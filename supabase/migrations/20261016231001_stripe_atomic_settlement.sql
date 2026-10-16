-- Additive migration. No historical payment/inventory/email markers are reset.
-- Every financial mutation below shares a transaction with the event receipt.
-- Checkout already writes with the server service role. Anonymous direct
-- inserts could forge paid orders or append lines after amount validation.
DROP POLICY IF EXISTS "Public insert manual orders" ON public.manual_orders;
DROP POLICY IF EXISTS "Public insert manual order items" ON public.manual_order_items;
REVOKE INSERT ON public.manual_orders,public.manual_order_items FROM PUBLIC,anon,authenticated;
ALTER TABLE public.stripe_webhook_events ADD COLUMN IF NOT EXISTS result jsonb;
ALTER TABLE public.manual_orders ADD COLUMN IF NOT EXISTS stripe_settled_at timestamptz;
CREATE UNIQUE INDEX manual_orders_stripe_intent_unique ON public.manual_orders(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE TABLE public.stripe_email_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_order_id uuid NOT NULL REFERENCES public.manual_orders(id),
  kind text NOT NULL CHECK (kind IN ('paid_customer','paid_owner','refund_customer','refund_owner')),
  revision integer NOT NULL DEFAULT 0,
  snapshot jsonb NOT NULL,
  payload jsonb,
  first_attempt_at timestamptz,
  lease_token uuid,
  lease_until timestamptz,
  sent_at timestamptz,
  provider_id text,
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(manual_order_id, kind, revision)
);
ALTER TABLE public.stripe_email_outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.stripe_email_outbox FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.stripe_email_outbox TO service_role;
CREATE INDEX stripe_email_pending_idx ON public.stripe_email_outbox(created_at) WHERE sent_at IS NULL;

CREATE FUNCTION public.apply_stripe_event(p_event jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE
  o public.manual_orders%ROWTYPE;
  receipt public.stripe_webhook_events%ROWTYPE;
  candidate_ids uuid[];
  line record;
  prev integer;
  nextq integer;
  oversold boolean := false;
  outcome text := 'ignored';
  typ text := p_event->>'type';
  sid text := p_event->>'session_id';
  pi text := p_event->>'payment_intent_id';
  amount integer := (p_event->>'amount')::integer;
  refunded integer := (p_event->>'amount_refunded')::integer;
  original_commission integer;
  adjusted_commission integer;
  snapshot jsonb;
  result jsonb;
BEGIN
  IF coalesce(p_event->>'id','') = '' OR typ NOT IN (
    'checkout.session.completed','checkout.session.async_payment_succeeded',
    'checkout.session.async_payment_failed','checkout.session.expired',
    'payment_intent.succeeded','payment_intent.payment_failed','charge.refunded'
  ) OR jsonb_typeof(p_event->'livemode') IS DISTINCT FROM 'boolean' THEN
    RAISE EXCEPTION 'invalid_stripe_event';
  END IF;
  -- Same event serializes before the order lock; different events for one order
  -- serialize on the order row. An insertion/financial failure rolls back both.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_event->>'id', 0));
  SELECT * INTO receipt FROM public.stripe_webhook_events WHERE id = p_event->>'id';
  IF FOUND THEN
    IF receipt.result IS NULL THEN
      result := jsonb_build_object('outcome','legacy_event_review','orderId',receipt.manual_order_id,'review',true);
      UPDATE public.stripe_webhook_events SET result=jsonb_build_object(
        'outcome','legacy_event_review','orderId',receipt.manual_order_id,'review',true) WHERE id=receipt.id;
      RETURN result;
    END IF;
    IF NOT coalesce((receipt.result->>'retry')::boolean,false) THEN
      RETURN receipt.result || jsonb_build_object('duplicate',true);
    END IF;
  END IF;

  SELECT array_agg(id) INTO candidate_ids FROM public.manual_orders
    WHERE id::text = p_event->>'order_id'
       OR stripe_checkout_session_id = sid OR stripe_payment_intent_id = pi;
  IF cardinality(candidate_ids) > 1 THEN RAISE EXCEPTION 'conflicting_order_references'; END IF;
  IF coalesce(cardinality(candidate_ids),0) = 0 THEN
    -- Checkout always supplies orderId in both Session and PaymentIntent metadata.
    -- An attributed but missing order may be temporarily invisible: request retry.
    IF p_event->>'order_id' IS NOT NULL THEN RAISE EXCEPTION 'order_not_found_retryable'; END IF;
    RETURN jsonb_build_object('outcome','unknown_unattributed_event');
  END IF;
  SELECT * INTO STRICT o FROM public.manual_orders WHERE id = candidate_ids[1] FOR UPDATE;
  IF o.checkout_mode IS DISTINCT FROM 'stripe'
     OR o.stripe_livemode IS DISTINCT FROM (p_event->>'livemode')::boolean
     OR (p_event->>'order_id' IS NOT NULL AND o.id::text <> p_event->>'order_id')
     OR (sid IS NOT NULL AND o.stripe_checkout_session_id IS NOT NULL AND sid <> o.stripe_checkout_session_id)
     OR (pi IS NOT NULL AND o.stripe_payment_intent_id IS NOT NULL AND pi <> o.stripe_payment_intent_id) THEN
    RAISE EXCEPTION 'stripe_order_identity_mismatch';
  END IF;

  IF typ IN ('checkout.session.completed','checkout.session.async_payment_succeeded','payment_intent.succeeded')
     AND coalesce((p_event->>'paid')::boolean,false) THEN
    IF amount IS DISTINCT FROM o.total_amount OR amount <= 0
       OR lower(p_event->>'currency') IS DISTINCT FROM lower(o.currency) OR pi IS NULL THEN
      RAISE EXCEPTION 'stripe_amount_or_currency_mismatch';
    END IF;
    -- Never revive a refund, regress fulfilment, or repeat an old partial mutation.
    IF o.payment_status IN ('paid','partially_refunded','refunded') THEN
      IF o.stripe_settled_at IS NULL THEN
        result := jsonb_build_object('outcome','legacy_order_review','orderId',o.id,'review',true);
        INSERT INTO public.stripe_webhook_events(id,event_type,manual_order_id,result) VALUES(p_event->>'id',typ,o.id,result)
          ON CONFLICT(id) DO UPDATE SET result=excluded.result,manual_order_id=excluded.manual_order_id;
        RETURN result;
      END IF;
      outcome := 'already_settled';
    ELSE
      IF o.inventory_decremented_at IS NOT NULL OR EXISTS(
        SELECT 1 FROM public.inventory_transactions WHERE reference_id=o.id::text AND transaction_type='sale'
      ) THEN RAISE EXCEPTION 'partial_legacy_inventory_review'; END IF;
      IF NOT EXISTS(SELECT 1 FROM public.manual_order_items WHERE manual_order_id=o.id)
         OR EXISTS(SELECT 1 FROM public.manual_order_items WHERE manual_order_id=o.id AND (product_id IS NULL OR quantity<=0)) THEN
        RAISE EXCEPTION 'order_items_incomplete';
      END IF;
      -- Lock products in deterministic order, aggregate repeated product lines.
      FOR line IN SELECT product_id, sum(quantity)::integer AS quantity FROM public.manual_order_items
        WHERE manual_order_id=o.id GROUP BY product_id ORDER BY product_id LOOP
        SELECT inventory_quantity INTO STRICT prev FROM public.products WHERE id=line.product_id FOR UPDATE;
        IF prev IS NULL THEN RAISE EXCEPTION 'inventory_unavailable'; END IF;
        nextq := greatest(0,prev-line.quantity);
        oversold := oversold OR prev < line.quantity;
        UPDATE public.products SET inventory_quantity=nextq, updated_at=now() WHERE id=line.product_id;
        INSERT INTO public.inventory_transactions(product_id,transaction_type,quantity_change,previous_quantity,new_quantity,reason,reference_id,created_by)
          VALUES(line.product_id,'sale',-line.quantity,prev,nextq,'Stripe payment settlement',o.id::text,'stripe-webhook');
        INSERT INTO public.order_events(manual_order_id,event_type,actor,message,metadata)
          VALUES(o.id,CASE WHEN prev<line.quantity THEN 'inventory_oversell' ELSE 'inventory_adjusted' END,
            'stripe-webhook','Payment inventory applied',jsonb_build_object('productId',line.product_id,'quantity',line.quantity));
      END LOOP;
      UPDATE public.manual_orders SET payment_status='paid',
        status=CASE WHEN oversold THEN 'waiting_inventory' ELSE 'paid' END,
        paid_at=now(), stripe_settled_at=now(), inventory_decremented_at=now(), updated_at=now(),
        stripe_checkout_session_id=coalesce(stripe_checkout_session_id,sid),
        stripe_payment_intent_id=pi, stripe_customer_id=coalesce(stripe_customer_id,p_event->>'customer_id'),
        affiliate_status=CASE WHEN affiliate_id IS NOT NULL THEN 'pending_payout' ELSE affiliate_status END
        WHERE id=o.id RETURNING * INTO o;
      IF o.affiliate_id IS NOT NULL THEN
        -- Existing checkout may have written the ledger; repair a missing row
        -- from the immutable order snapshot without adding a second commission.
        IF (SELECT count(*) FROM public.referral_revenue WHERE manual_order_id=o.id)>1 THEN
          RAISE EXCEPTION 'duplicate_commission_ledger_review';
        END IF;
        UPDATE public.referral_revenue SET status='pending_payout',commission_amount_cents=o.affiliate_commission_amount
          WHERE manual_order_id=o.id;
        IF NOT FOUND THEN
          INSERT INTO public.referral_revenue(affiliate_id,manual_order_id,order_number,gross_revenue_cents,product_subtotal_cents,commission_rate_bps,commission_amount_cents,status)
            VALUES(o.affiliate_id,o.id,o.order_number,o.total_amount,o.subtotal_amount,o.affiliate_commission_rate_bps,o.affiliate_commission_amount,'pending_payout');
        END IF;
      END IF;
      UPDATE public.promotions SET times_used=coalesce(times_used,0)+1,updated_at=now() WHERE upper(code)=upper(o.promo_code);
      INSERT INTO public.order_events(manual_order_id,event_type,actor,message,metadata)
        VALUES(o.id,'payment_succeeded','stripe-webhook','Verified Stripe payment settled',jsonb_build_object('eventId',p_event->>'id'));
      outcome := 'settled';
    END IF;
    -- A second event can backfill a session reference without changing fulfilment.
    UPDATE public.manual_orders SET stripe_checkout_session_id=coalesce(stripe_checkout_session_id,sid),
      stripe_customer_id=coalesce(stripe_customer_id,p_event->>'customer_id') WHERE id=o.id;
  ELSIF typ IN ('payment_intent.payment_failed','checkout.session.async_payment_failed','checkout.session.expired') THEN
    IF o.payment_status NOT IN ('paid','refunded','partially_refunded') THEN
      UPDATE public.manual_orders SET
        payment_status=CASE WHEN typ='checkout.session.expired' THEN 'expired' ELSE 'failed' END,
        status=CASE WHEN typ='checkout.session.expired' THEN 'canceled' ELSE status END,
        affiliate_status=CASE WHEN typ='checkout.session.expired' AND affiliate_id IS NOT NULL THEN 'void' ELSE affiliate_status END,
        updated_at=now() WHERE id=o.id;
      IF typ='checkout.session.expired' THEN
        UPDATE public.referral_revenue SET status='void' WHERE manual_order_id=o.id AND status='pending_payment';
      END IF;
      INSERT INTO public.order_events(manual_order_id,event_type,actor,message,metadata)
        VALUES(o.id,CASE WHEN typ='checkout.session.expired' THEN 'checkout_expired' ELSE 'payment_failed' END,
          'stripe-webhook','Stripe checkout did not settle',jsonb_build_object('eventId',p_event->>'id'));
      outcome := 'unpaid_updated';
    END IF;
  ELSIF typ='charge.refunded' THEN
    IF lower(p_event->>'currency') IS DISTINCT FROM lower(o.currency) OR amount IS DISTINCT FROM o.total_amount
      OR refunded IS NULL OR refunded<0 OR refunded>o.total_amount THEN RAISE EXCEPTION 'invalid_refund'; END IF;
    IF refunded > o.amount_refunded THEN
      -- Stripe may deliver refund before success. Retry until settlement exists.
      IF o.payment_status NOT IN ('paid','partially_refunded','refunded') THEN RAISE EXCEPTION 'refund_before_settlement'; END IF;
      original_commission := coalesce((SELECT (box.snapshot->'order'->>'affiliate_commission_amount')::integer
        FROM public.stripe_email_outbox box WHERE manual_order_id=o.id AND kind='paid_customer'),
        round(o.subtotal_amount::numeric*o.affiliate_commission_rate_bps/10000)::integer,o.affiliate_commission_amount);
      -- Use the immutable settlement snapshot to avoid compounding rounding.
      adjusted_commission := CASE WHEN refunded=o.total_amount THEN 0 ELSE
        round(original_commission::numeric*(o.total_amount-refunded)/greatest(1,o.total_amount))::integer END;
      UPDATE public.manual_orders SET amount_refunded=refunded,
        payment_status=CASE WHEN refunded=total_amount THEN 'refunded' ELSE 'partially_refunded' END,
        status=CASE WHEN refunded=total_amount THEN 'refunded' ELSE status END,
        refunded_at=CASE WHEN refunded=total_amount THEN now() ELSE refunded_at END,
        affiliate_commission_amount=CASE WHEN affiliate_id IS NOT NULL THEN adjusted_commission ELSE affiliate_commission_amount END,
        affiliate_status=CASE WHEN affiliate_id IS NULL THEN affiliate_status WHEN refunded=total_amount THEN 'reversed' ELSE 'pending_payout' END,
        updated_at=now() WHERE id=o.id RETURNING * INTO o;
      UPDATE public.referral_revenue SET status=CASE WHEN refunded=o.total_amount THEN 'reversed' ELSE 'pending_payout' END,
        commission_amount_cents=adjusted_commission WHERE manual_order_id=o.id;
      INSERT INTO public.order_events(manual_order_id,event_type,actor,message,metadata)
        VALUES(o.id,'refund_completed','stripe-webhook','Verified Stripe refund applied',jsonb_build_object('eventId',p_event->>'id','amountRefunded',refunded));
      outcome := 'refunded';
    END IF;
  END IF;

  IF outcome IN ('settled','refunded') THEN
    snapshot := jsonb_build_object('order',to_jsonb(o),'items',(
      SELECT jsonb_agg(to_jsonb(i) ORDER BY i.id) FROM public.manual_order_items i WHERE manual_order_id=o.id));
    INSERT INTO public.stripe_email_outbox(manual_order_id,kind,revision,snapshot)
      SELECT o.id,k,CASE WHEN outcome='refunded' THEN refunded ELSE 0 END,snapshot
      FROM unnest(CASE WHEN outcome='settled' THEN ARRAY['paid_customer','paid_owner'] ELSE ARRAY['refund_customer','refund_owner'] END) AS k
      ON CONFLICT(manual_order_id,kind,revision) DO NOTHING;
  END IF;
  result := jsonb_build_object('outcome',outcome,'orderId',o.id);
  INSERT INTO public.stripe_webhook_events(id,event_type,manual_order_id,result)
    VALUES(p_event->>'id',typ,o.id,result)
    ON CONFLICT(id) DO UPDATE SET result=excluded.result,manual_order_id=excluded.manual_order_id,processed_at=now();
  RETURN result;
END $$;

-- Called only after the settlement transaction failed. It never erases a
-- completed receipt or turns a legacy claim into permission to replay it.
CREATE FUNCTION public.record_stripe_failure(p_id text,p_type text) RETURNS void
LANGUAGE sql SECURITY INVOKER SET search_path=public,pg_temp AS $$
  INSERT INTO public.stripe_webhook_events(id,event_type,result)
    VALUES(p_id,p_type,'{"outcome":"processing_failed","retry":true}'::jsonb)
    ON CONFLICT(id) DO UPDATE SET processed_at=now()
      WHERE stripe_webhook_events.result->>'retry'='true';
$$;

CREATE FUNCTION public.stripe_processing_health() RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public,pg_temp AS $$
  SELECT jsonb_build_object('retryPending',(
    SELECT count(*) FROM public.stripe_webhook_events WHERE result->>'retry'='true'),
    'reviewPending',(
    SELECT count(*) FROM public.stripe_webhook_events WHERE result->>'review'='true'),
    'messagesPending',(
    SELECT count(*) FROM public.stripe_email_outbox WHERE sent_at IS NULL AND created_at<now()-interval '10 minutes'),
    'deliveryReview',(
    SELECT count(*) FROM public.stripe_email_outbox WHERE sent_at IS NULL AND first_attempt_at<now()-interval '23 hours'));
$$;

CREATE FUNCTION public.claim_stripe_email(p_id uuid,p_token uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE job public.stripe_email_outbox%ROWTYPE;
BEGIN
  SELECT * INTO job FROM public.stripe_email_outbox WHERE id=p_id FOR UPDATE;
  IF NOT FOUND OR job.sent_at IS NOT NULL OR job.lease_until>now() THEN RETURN NULL; END IF;
  IF job.first_attempt_at < now()-interval '23 hours' THEN
    UPDATE public.stripe_email_outbox SET last_error='delivery_ambiguous_review' WHERE id=p_id;
    RETURN NULL;
  END IF;
  UPDATE public.stripe_email_outbox SET lease_token=p_token,lease_until=now()+interval '2 minutes',
    attempts=attempts+1 WHERE id=p_id RETURNING * INTO job;
  RETURN to_jsonb(job);
END $$;

CREATE FUNCTION public.prepare_stripe_email(p_id uuid,p_token uuid,p_payload jsonb) RETURNS boolean
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
BEGIN
  UPDATE public.stripe_email_outbox SET payload=coalesce(payload,p_payload),first_attempt_at=coalesce(first_attempt_at,now())
    WHERE id=p_id AND lease_token=p_token AND sent_at IS NULL AND lease_until>now();
  RETURN FOUND;
END $$;

CREATE FUNCTION public.finish_stripe_email(p_id uuid,p_token uuid,p_provider_id text) RETURNS boolean
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE job public.stripe_email_outbox%ROWTYPE;
BEGIN
  UPDATE public.stripe_email_outbox SET sent_at=CASE WHEN p_provider_id IS NOT NULL THEN now() ELSE NULL END,
    provider_id=p_provider_id,last_error=CASE WHEN p_provider_id IS NULL THEN 'provider_delivery_failed' ELSE NULL END,
    lease_until=NULL,lease_token=NULL WHERE id=p_id AND lease_token=p_token AND sent_at IS NULL RETURNING * INTO job;
  IF NOT FOUND THEN RETURN false; END IF;
  INSERT INTO public.order_events(manual_order_id,event_type,actor,message,metadata)
    VALUES(job.manual_order_id,CASE WHEN p_provider_id IS NULL THEN 'email_failed' ELSE 'email_sent' END,
      'stripe-webhook','Stripe notification delivery result',jsonb_build_object('outboxId',job.id,'kind',job.kind));
  IF job.kind LIKE 'paid_%' AND NOT EXISTS(
    SELECT 1 FROM public.stripe_email_outbox WHERE manual_order_id=job.manual_order_id AND kind LIKE 'paid_%' AND sent_at IS NULL
  ) THEN UPDATE public.manual_orders SET paid_email_sent_at=now() WHERE id=job.manual_order_id; END IF;
  RETURN true;
END $$;

REVOKE ALL ON FUNCTION public.apply_stripe_event(jsonb),public.claim_stripe_email(uuid,uuid),
  public.prepare_stripe_email(uuid,uuid,jsonb),public.finish_stripe_email(uuid,uuid,text),
  public.record_stripe_failure(text,text),public.stripe_processing_health() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.apply_stripe_event(jsonb),public.claim_stripe_email(uuid,uuid),
  public.prepare_stripe_email(uuid,uuid,jsonb),public.finish_stripe_email(uuid,uuid,text),
  public.record_stripe_failure(text,text),public.stripe_processing_health() TO service_role;
