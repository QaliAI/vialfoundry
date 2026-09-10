-- 06_stripe_commerce.sql
-- Stripe payment references + an auditable order timeline.
--
-- Payment state is deliberately separate from fulfilment state:
--   status         = where the order is in the fulfilment pipeline
--   payment_status = whether money has actually been captured
-- An order can be `paid` and still `processing`; it can be `shipped` and later
-- `refunded`. Collapsing these into one column loses information we need for
-- disputes.

-- ---------------------------------------------------------------- payments
ALTER TABLE public.manual_orders
  ADD COLUMN IF NOT EXISTS payment_provider TEXT NOT NULL DEFAULT 'manual_invoice',
  ADD COLUMN IF NOT EXISTS payment_status   TEXT NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id   TEXT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id         TEXT,
  ADD COLUMN IF NOT EXISTS amount_refunded INTEGER NOT NULL DEFAULT 0, -- cents
  ADD COLUMN IF NOT EXISTS paid_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS carrier TEXT,
  ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;

-- One Stripe session maps to exactly one order. This is what makes webhook
-- replay safe: a duplicate session can never create a second paid order.
CREATE UNIQUE INDEX IF NOT EXISTS manual_orders_stripe_session_idx
  ON public.manual_orders (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS manual_orders_payment_status_idx
  ON public.manual_orders (payment_status);

CREATE INDEX IF NOT EXISTS manual_orders_payment_intent_idx
  ON public.manual_orders (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- ---------------------------------------------------------------- timeline
CREATE TABLE IF NOT EXISTS public.order_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manual_order_id UUID NOT NULL REFERENCES public.manual_orders(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,   -- order_created, payment_succeeded, status_changed, ...
    actor TEXT NOT NULL DEFAULT 'system',
    message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS order_events_order_idx
  ON public.order_events (manual_order_id, created_at DESC);

-- ------------------------------------------------- webhook idempotency ledger
-- Stripe retries deliveries and can send the same event more than once. We
-- record every event id we have already applied and ignore repeats, so a retry
-- can never double-apply a refund or re-fire notification email.
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
    id TEXT PRIMARY KEY,                -- Stripe's event id (evt_...)
    event_type TEXT NOT NULL,
    manual_order_id UUID REFERENCES public.manual_orders(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------- RLS
-- These tables are admin/service-role only. No public policies are created,
-- so with RLS enabled the anon key cannot read or write them.
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
