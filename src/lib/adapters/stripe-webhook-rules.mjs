/**
 * Pure decision rules for applying a Stripe event to an order.
 *
 * Extracted from the route so the risky parts — "should this event be applied
 * at all", "does the captured amount match", "what does this do to affiliate
 * commission" — can be unit-tested without Stripe, Supabase or a server.
 */

export const HANDLED_EVENT_TYPES = [
  'checkout.session.completed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'charge.refunded',
];

export function isHandledEvent(type) {
  return HANDLED_EVENT_TYPES.includes(type);
}

/**
 * Decides what a settlement event should do to an order.
 *
 * @param {object} order   current order row ({ payment_status, total_amount })
 * @param {number|null} amountPaid  cents Stripe reports as captured
 * @returns {{ apply: boolean, reason?: string, updates?: object }}
 */
export function resolvePaymentSuccess(order, amountPaid) {
  if (!order) return { apply: false, reason: 'order_not_found' };

  // Replay / the second of the two events Stripe sends for one payment.
  if (order.payment_status === 'paid') {
    return { apply: false, reason: 'already_paid' };
  }
  if (order.payment_status === 'refunded') {
    return { apply: false, reason: 'already_refunded' };
  }

  // Amount integrity re-checked at settlement, not just at session creation.
  if (amountPaid !== null && amountPaid !== undefined && amountPaid !== order.total_amount) {
    return { apply: false, reason: 'amount_mismatch' };
  }

  return {
    apply: true,
    updates: {
      payment_status: 'paid',
      status: 'paid',
      // Commission is only earned once money has actually settled.
      affiliate_status: order.affiliate_id ? 'pending_payout' : null,
    },
  };
}

/**
 * Decides what a refund event should do.
 *
 * @param {object} order
 * @param {number} amountRefunded cents
 */
export function resolveRefund(order, amountRefunded) {
  if (!order) return { apply: false, reason: 'order_not_found' };

  const refunded = Number(amountRefunded) || 0;
  if (refunded <= 0) return { apply: false, reason: 'no_refund_amount' };

  // Never regress a larger refund back to a smaller one on replay.
  if (refunded <= (order.amount_refunded || 0)) {
    return { apply: false, reason: 'already_applied' };
  }

  const fully = refunded >= (order.total_amount || 0);
  return {
    apply: true,
    fullyRefunded: fully,
    updates: {
      amount_refunded: refunded,
      payment_status: fully ? 'refunded' : 'partially_refunded',
      ...(fully ? { status: 'refunded' } : {}),
      // A fully refunded order must stop paying commission.
      ...(order.affiliate_id && fully ? { affiliate_status: 'reversed' } : {}),
    },
  };
}

/** True when this event id has already been applied. */
export function isDuplicateEvent(processedEventIds, eventId) {
  return processedEventIds.includes(eventId);
}
