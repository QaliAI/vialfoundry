/**
 * Inventory policy for Stripe checkout (launch volume).
 *
 * SINGLE SOURCE OF TRUTH: public.products.inventory_quantity in Supabase.
 *
 * CHOSEN BEHAVIOR: decrement_on_payment
 *
 *   1. Checkout resolves the trusted catalogue product (id/SKU), then reads
 *      current inventory_quantity from Supabase. Static stockCount is used
 *      ONLY when there is intentionally no database (local/dev). Production
 *      never silently falls back to build-time stock.
 *   2. Stock is NOT reserved when a Stripe Checkout Session is created.
 *   3. Confirmed payment decrements the SAME Supabase column, once, keyed by
 *      manual_orders.inventory_decremented_at. The SQL function
 *      apply_inventory_delta takes a row lock so concurrent payments cannot
 *      double-apply.
 *   4. A paid order is always honoured even if the row would go through zero
 *      (oversell is logged). Checkout still rejects insufficient stock at
 *      session creation.
 *   5. A full refund restocks once (inventory_restocked_at). Partial refunds
 *      do not restock.
 *
 * Admin inventory adjustments write the same column, so checkout sees them
 * immediately without a redeploy.
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
