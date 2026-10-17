/** Only called with a signature-verified event (or an event retrieved from Stripe). */
export function settlementInput(event) {
  const o = event.data.object;
  const session = event.type.startsWith('checkout.session.');
  const intent = event.type.startsWith('payment_intent.');
  const id = value => typeof value === 'string' ? value : value?.id || null;
  return {
    id: event.id, type: event.type, livemode: event.livemode,
    order_id: o.metadata?.orderId || (session ? o.client_reference_id : null) || null,
    session_id: session ? o.id : null,
    payment_intent_id: intent ? o.id : id(o.payment_intent),
    customer_id: id(o.customer),
    currency: o.currency,
    amount: session ? o.amount_total : intent ? o.amount_received : o.amount,
    amount_refunded: o.amount_refunded,
    paid: session ? o.payment_status === 'paid' : event.type === 'payment_intent.succeeded',
  };
}

export async function applySettlement(database, event) {
  if (!database) throw new Error('database_unavailable');
  const { data, error } = await database.rpc('apply_stripe_event', { p_event: settlementInput(event) });
  if (error || !data) {
    // A failed receipt remains retryable and visible to the existing watchdog.
    await database.rpc('record_stripe_failure', { p_id: event.id, p_type: event.type });
    // Preserve the underlying RPC reason (e.g. stripe_amount_or_currency_mismatch)
    // so the route can tell permanent failures apart from transient ones.
    throw new Error('settlement_database_failure', {
      cause: error && typeof error.message === 'string' ? error.message : 'unknown',
    });
  }
  return data;
}

/**
 * Message payload and first-attempt time are persisted before sending. Resend
 * deduplicates this stable key for 24h. After 23h, an ambiguous attempt is held
 * for operator/provider reconciliation; it is never blindly sent again.
 */
export async function deliverStripeMessages(database, orderId, renderMessage, send) {
  const { data: messages, error } = await database.from('stripe_email_outbox')
    .select('id').eq('manual_order_id', orderId).is('sent_at', null);
  if (error) throw new Error('outbox_read_failed');
  let pending = false;
  for (const message of messages || []) {
    const token = crypto.randomUUID();
    const claim = await database.rpc('claim_stripe_email', { p_id: message.id, p_token: token });
    if (claim.error) throw new Error('outbox_claim_failed');
    const job = claim.data;
    if (!job) { pending = true; continue; }
    let payload = job.payload;
    if (!payload) {
      payload = await renderMessage(job);
      const prepared = await database.rpc('prepare_stripe_email', {
        p_id: job.id, p_token: token, p_payload: payload,
      });
      if (prepared.error || prepared.data !== true) throw new Error('outbox_prepare_failed');
    }
    const sent = await send({ ...payload, idempotencyKey: `stripe-email/${job.id}`, requireDelivery: true });
    const completed = await database.rpc('finish_stripe_email', {
      p_id: job.id, p_token: token, p_provider_id: sent.success ? sent.id || null : null,
    });
    if (completed.error || completed.data !== true) throw new Error('outbox_finish_failed');
    if (!sent.success || !sent.id) pending = true;
  }
  if (pending) throw new Error('email_delivery_pending');
}
