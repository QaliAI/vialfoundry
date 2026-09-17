/**
 * Pure decision rules for applying a Stripe event to an order.
 *
 * Extracted from the route so the risky parts — "should this event be applied
 * at all", "does the captured amount match", "what does this do to affiliate
 * commission" — can be unit-tested without Stripe, Supabase or a server.
 */

export const HANDLED_EVENT_TYPES = [
  'checkout.session.completed',
  'checkout.session.expired',
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
  const originalCommission = order.affiliate_commission_rate_bps && order.subtotal_amount
    ? Math.round(Number(order.subtotal_amount) * (Number(order.affiliate_commission_rate_bps) / 10000))
    : Number(order.affiliate_commission_amount) || 0;
  const remainingRatio = Math.max(0, ((order.total_amount || 0) - refunded) / (order.total_amount || 1));
  const adjustedCommission = fully ? 0 : Math.round(originalCommission * remainingRatio);
  return {
    apply: true,
    fullyRefunded: fully,
    updates: {
      amount_refunded: refunded,
      payment_status: fully ? 'refunded' : 'partially_refunded',
      ...(fully ? { status: 'refunded' } : {}),
      ...(order.affiliate_id
        ? {
            affiliate_commission_amount: adjustedCommission,
            affiliate_status: fully ? 'reversed' : 'pending_payout',
          }
        : {}),
    },
  };
}

/**
 * Abandoned Stripe Checkout: the customer never paid. Cancel the pending
 * order so the desk does not treat it as a live invoice. Never touch a
 * paid or refunded order — expiry can race a late settlement in theory,
 * and settlement always wins.
 */
export function resolveSessionExpired(order) {
  if (!order) return { apply: false, reason: 'order_not_found' };
  if (order.payment_status === 'paid') return { apply: false, reason: 'already_paid' };
  if (order.payment_status === 'refunded' || order.payment_status === 'partially_refunded') {
    return { apply: false, reason: 'already_refunded' };
  }
  if (order.payment_status === 'expired' || order.status === 'canceled' || order.status === 'cancelled') {
    return { apply: false, reason: 'already_expired' };
  }
  return {
    apply: true,
    updates: {
      status: 'canceled',
      payment_status: 'expired',
      affiliate_status: order.affiliate_id ? 'void' : null,
    },
  };
}

/**
 * Refuses an event whose Stripe mode disagrees with the mode the order was
 * created in: a test event must never settle, refund or cancel a live order,
 * and a live event must never be applied to a test one.
 *
 * Signing secrets are per-endpoint and per-mode, so a mismatch should already
 * be impossible. This is defence in depth for one specific operator mistake:
 * this account has both a test and a live endpoint, production reads its
 * signing secret from an environment variable, and the Vercel project carries
 * two similarly named key pairs (STRIPE_SECRET_KEY and STRIPE_SECRET_API_KEY).
 * One mis-pasted secret is all it would take for test traffic to reach real
 * orders, so the mismatch is refused rather than applied.
 *
 * `stripe_livemode` is null on manual-invoice orders and on rows created before
 * 07_stripe_lifecycle. There is nothing to contradict in that case, so those
 * orders are not blocked here.
 *
 * @param {object} order
 * @param {boolean|undefined} eventLivemode  Stripe event's `livemode` flag
 */
export function resolveLivemodeMatch(order, eventLivemode) {
  if (!order) return { apply: false, reason: 'order_not_found' };

  const orderMode = order.stripe_livemode;
  if (orderMode !== true && orderMode !== false) return { apply: true };
  if (eventLivemode !== true && eventLivemode !== false) return { apply: true };

  if (orderMode !== eventLivemode) {
    return { apply: false, reason: 'livemode_mismatch' };
  }
  return { apply: true };
}

/** True when this event id has already been applied. */
export function isDuplicateEvent(processedEventIds, eventId) {
  return processedEventIds.includes(eventId);
}
