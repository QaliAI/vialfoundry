/**
 * Inventory policy for Stripe checkout (launch volume).
 *
 * CHOSEN BEHAVIOR: decrement_on_payment
 *
 *   1. Stock is checked at checkout-session creation against the
 *      authoritative catalog (src/data/products.ts) and, when present,
 *      public.products.inventory_quantity.
 *   2. Stock is NOT reserved when a Stripe Checkout Session is created.
 *      Abandoned checkouts therefore cannot lock inventory. Sessions expire
 *      in Stripe's default window (~24h); expired sessions cancel the order
 *      without touching stock.
 *   3. Stock is decremented once, on confirmed payment (Stripe webhook),
 *      against public.products.inventory_quantity. The write is keyed by
 *      manual_orders.inventory_decremented_at so retries cannot
 *      double-decrement.
 *   4. Overselling risk: two customers can concurrently pay for the last
 *      unit. Acceptable at this launch volume. A paid order is always
 *      honoured; going through zero is logged as an oversell event.
 *   5. A full refund restocks once (inventory_restocked_at). A partial
 *      refund does not restock — the goods may already have shipped.
 *
 * Do not introduce a reservation table unless volume requires it.
 */

export const INVENTORY_POLICY = "decrement_on_payment";

export function shouldDecrementInventory(order) {
  if (!order) return { apply: false, reason: "order_not_found" };
  if (order.inventory_decremented_at) return { apply: false, reason: "already_decremented" };
  if (order.payment_status !== "paid") return { apply: false, reason: "not_paid" };
  return { apply: true };
}

export function shouldRestockInventory(order, fullyRefunded) {
  if (!order) return { apply: false, reason: "order_not_found" };
  if (!fullyRefunded) return { apply: false, reason: "partial_refund" };
  if (!order.inventory_decremented_at) return { apply: false, reason: "never_decremented" };
  if (order.inventory_restocked_at) return { apply: false, reason: "already_restocked" };
  return { apply: true };
}

/** Never let a sale write a negative on-hand figure. */
export function nextInventoryQuantity(current, change) {
  const onHand = Number.isFinite(Number(current)) ? Number(current) : 0;
  const delta = Number.isFinite(Number(change)) ? Number(change) : 0;
  return Math.max(0, onHand + delta);
}

export function isOversell(current, decrement) {
  return Number(current || 0) < Number(decrement || 0);
}
