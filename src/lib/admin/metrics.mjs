/**
 * Operator dashboard metrics.
 *
 * Pure functions over order rows so the arithmetic is unit-testable and cannot
 * drift from what the finance view reports.
 *
 * Rules that matter:
 *  - Revenue counts money we have ACTUALLY collected: payment_status "paid"
 *    or "partially_refunded", minus whatever has been refunded.
 *  - Test orders and archived orders never count.
 *  - Nothing is estimated. If we cannot measure it, it is not reported.
 */

const PAID_STATES = new Set(["paid", "partially_refunded"]);

export function isCountableOrder(order) {
  if (!order) return false;
  if (order.is_test) return false;
  if (order.archived_at) return false;
  return true;
}

/** Money actually collected on an order, net of refunds, in cents. */
export function netCollectedCents(order) {
  if (!isCountableOrder(order)) return 0;
  if (!PAID_STATES.has(order.payment_status)) return 0;
  const total = Number(order.total_amount) || 0;
  const refunded = Number(order.amount_refunded) || 0;
  return Math.max(0, total - refunded);
}

function sameDay(iso, reference) {
  if (!iso) return false;
  const d = new Date(iso);
  return (
    d.getUTCFullYear() === reference.getUTCFullYear() &&
    d.getUTCMonth() === reference.getUTCMonth() &&
    d.getUTCDate() === reference.getUTCDate()
  );
}

/**
 * @param {Array} orders manual_orders rows
 * @param {Date}  [now]  reference "today" (UTC)
 */
export function computeDashboardMetrics(orders = [], now = new Date()) {
  const countable = orders.filter(isCountableOrder);

  let todayRevenueCents = 0;
  let netRevenueCents = 0;
  let refundedCents = 0;
  let paidOrders = 0;
  let awaitingPayment = 0;
  let toFulfil = 0;
  let shippedToday = 0;

  for (const o of countable) {
    const net = netCollectedCents(o);
    netRevenueCents += net;
    refundedCents += Number(o.amount_refunded) || 0;

    if (PAID_STATES.has(o.payment_status)) {
      paidOrders += 1;
      if (sameDay(o.paid_at, now)) todayRevenueCents += net;
      // Paid but not yet out the door.
      if (["paid", "preparing", "packed"].includes(o.status)) toFulfil += 1;
    } else if (o.payment_status === "unpaid" && !["canceled", "cancelled", "refunded"].includes(o.status)) {
      awaitingPayment += 1;
    }

    if (o.status === "shipped" && sameDay(o.shipped_at, now)) shippedToday += 1;
  }

  return {
    todayRevenueCents,
    netRevenueCents,
    refundedCents,
    paidOrders,
    awaitingPayment,
    toFulfil,
    shippedToday,
    averageOrderValueCents: paidOrders > 0 ? Math.round(netRevenueCents / paidOrders) : 0,
    totalCountableOrders: countable.length,
  };
}

/** Commission owed on orders that have actually been paid for. */
export function computePendingCommissionCents(orders = []) {
  return orders
    .filter(isCountableOrder)
    .filter((o) => PAID_STATES.has(o.payment_status))
    .filter((o) => o.affiliate_status === "pending_payout")
    .reduce((sum, o) => sum + (Number(o.affiliate_commission_amount) || 0), 0);
}

/** Revenue grouped by ISO date (UTC), newest last. Paid orders only. */
export function revenueByDay(orders = [], days = 30, now = new Date()) {
  const buckets = new Map();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    buckets.set(d.toISOString().slice(0, 10), { date: d.toISOString().slice(0, 10), revenueCents: 0, orders: 0 });
  }
  for (const o of orders.filter(isCountableOrder)) {
    if (!PAID_STATES.has(o.payment_status) || !o.paid_at) continue;
    const key = new Date(o.paid_at).toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.revenueCents += netCollectedCents(o);
      bucket.orders += 1;
    }
  }
  return Array.from(buckets.values());
}

/** Top products by collected revenue. Requires joined line items. */
export function topProducts(orders = [], itemsByOrderId = {}, limit = 10) {
  const totals = new Map();
  for (const o of orders.filter(isCountableOrder)) {
    if (!PAID_STATES.has(o.payment_status)) continue;
    for (const item of itemsByOrderId[o.id] || []) {
      const key = item.sku || item.product_name;
      const cur = totals.get(key) || { key, name: item.product_name, sku: item.sku || null, units: 0, revenueCents: 0 };
      cur.units += Number(item.quantity) || 0;
      cur.revenueCents += Number(item.line_total_amount) || 0;
      totals.set(key, cur);
    }
  }
  return Array.from(totals.values())
    .sort((a, b) => b.revenueCents - a.revenueCents)
    .slice(0, limit);
}

/** Collected revenue split by how the customer paid. */
export function revenueByPaymentMethod(orders = []) {
  const out = new Map();
  for (const o of orders.filter(isCountableOrder)) {
    if (!PAID_STATES.has(o.payment_status)) continue;
    const key = o.payment_provider || o.preferred_payment_method || "unknown";
    const cur = out.get(key) || { method: key, orders: 0, revenueCents: 0 };
    cur.orders += 1;
    cur.revenueCents += netCollectedCents(o);
    out.set(key, cur);
  }
  return Array.from(out.values()).sort((a, b) => b.revenueCents - a.revenueCents);
}
