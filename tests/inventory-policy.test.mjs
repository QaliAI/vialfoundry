import test from "node:test";
import assert from "node:assert/strict";
import {
  INVENTORY_POLICY,
  shouldDecrementInventory,
  shouldRestockInventory,
  nextInventoryQuantity,
  isOversell,
} from "../src/lib/admin/inventory.mjs";
import { assertSufficientStock } from "../src/lib/manual-orders/checkout-catalog.mjs";

test("launch policy is decrement on confirmed payment, not on session create", () => {
  assert.equal(INVENTORY_POLICY, "decrement_on_payment");
});

test("stock is taken only after the order is paid, and only once", () => {
  const unpaid = { payment_status: "unpaid", inventory_decremented_at: null };
  const paid = { payment_status: "paid", inventory_decremented_at: null };
  const already = { payment_status: "paid", inventory_decremented_at: "2026-01-01T00:00:00Z" };

  assert.equal(shouldDecrementInventory(unpaid).apply, false);
  assert.equal(shouldDecrementInventory(paid).apply, true);
  assert.equal(shouldDecrementInventory(already).reason, "already_decremented");
  assert.equal(shouldDecrementInventory(null).apply, false);
});

test("full refund restocks once; partial refund does not", () => {
  const decremented = {
    payment_status: "paid",
    inventory_decremented_at: "2026-01-01T00:00:00Z",
    inventory_restocked_at: null,
  };
  assert.equal(shouldRestockInventory(decremented, true).apply, true);
  assert.equal(shouldRestockInventory(decremented, false).reason, "partial_refund");
  assert.equal(shouldRestockInventory({ ...decremented, inventory_restocked_at: "x" }, true).reason, "already_restocked");
  assert.equal(shouldRestockInventory({ payment_status: "paid", inventory_decremented_at: null }, true).reason, "never_decremented");
});

test("admin 50 → 10 is what checkout sees, not the static catalog count", () => {
  const liveOnHand = 10;
  assert.equal(assertSufficientStock(liveOnHand, 11, "BPC-157").ok, false);
  assert.equal(assertSufficientStock(liveOnHand, 1, "BPC-157").ok, true);
});

test("payment 10 → 9 then refund 9 → 10 is a single decrement and a single restock", () => {
  let onHand = 10;
  const paid = { payment_status: "paid", inventory_decremented_at: null, inventory_restocked_at: null };
  assert.equal(shouldDecrementInventory(paid).apply, true);
  onHand = nextInventoryQuantity(onHand, -1);
  assert.equal(onHand, 9);
  const decremented = { ...paid, inventory_decremented_at: "now" };
  assert.equal(shouldDecrementInventory(decremented).apply, false);
  assert.equal(shouldRestockInventory(decremented, true).apply, true);
  onHand = nextInventoryQuantity(onHand, 1);
  assert.equal(onHand, 10);
  const restocked = { ...decremented, inventory_restocked_at: "now" };
  assert.equal(shouldRestockInventory(restocked, true).apply, false);
});

test("on-hand quantity never goes negative and oversell is detectable", () => {
  assert.equal(nextInventoryQuantity(10, -3), 7);
  assert.equal(nextInventoryQuantity(2, -5), 0);
  assert.equal(isOversell(2, 5), true);
  assert.equal(isOversell(5, 5), false);
});
