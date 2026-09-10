import test from "node:test";
import assert from "node:assert/strict";
import {
  isHandledEvent, resolvePaymentSuccess, resolveRefund, resolveSessionExpired, isDuplicateEvent, HANDLED_EVENT_TYPES,
} from "../src/lib/adapters/stripe-webhook-rules.mjs";

const unpaid = { id: "o1", payment_status: "unpaid", total_amount: 7900, amount_refunded: 0, affiliate_id: null };
const withAffiliate = { ...unpaid, affiliate_id: "aff-1" };
const paid = { ...unpaid, payment_status: "paid" };

test("handles the required Stripe events including checkout expiry", () => {
  for (const t of [
    "checkout.session.completed",
    "checkout.session.expired",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "charge.refunded",
  ]) {
    assert.ok(isHandledEvent(t), t);
  }
  assert.equal(isHandledEvent("customer.created"), false);
  assert.equal(HANDLED_EVENT_TYPES.length, 5);
});

test("marks an unpaid order paid when the amount matches exactly", () => {
  const r = resolvePaymentSuccess(unpaid, 7900);
  assert.equal(r.apply, true);
  assert.equal(r.updates.payment_status, "paid");
  assert.equal(r.updates.status, "paid");
});

test("REFUSES to mark paid when the captured amount differs by even one cent", () => {
  assert.equal(resolvePaymentSuccess(unpaid, 7899).apply, false);
  assert.equal(resolvePaymentSuccess(unpaid, 7899).reason, "amount_mismatch");
  assert.equal(resolvePaymentSuccess(unpaid, 7901).reason, "amount_mismatch");
});

test("duplicate delivery of a settlement event is a no-op", () => {
  const r = resolvePaymentSuccess(paid, 7900);
  assert.equal(r.apply, false);
  assert.equal(r.reason, "already_paid");
});

test("both events Stripe sends for one payment only apply once", () => {
  // checkout.session.completed applies...
  const first = resolvePaymentSuccess(unpaid, 7900);
  assert.equal(first.apply, true);
  // ...then payment_intent.succeeded arrives for the now-paid order
  const second = resolvePaymentSuccess({ ...unpaid, payment_status: first.updates.payment_status }, 7900);
  assert.equal(second.apply, false);
});

test("affiliate commission becomes payable only after payment settles", () => {
  assert.equal(resolvePaymentSuccess(withAffiliate, 7900).updates.affiliate_status, "pending_payout");
  assert.equal(resolvePaymentSuccess(unpaid, 7900).updates.affiliate_status, null);
});

test("a refunded order is never re-marked paid", () => {
  const r = resolvePaymentSuccess({ ...unpaid, payment_status: "refunded" }, 7900);
  assert.equal(r.apply, false);
  assert.equal(r.reason, "already_refunded");
});

test("full refund reverses the order and the affiliate commission", () => {
  const r = resolveRefund({ ...withAffiliate, payment_status: "paid" }, 7900);
  assert.equal(r.apply, true);
  assert.equal(r.fullyRefunded, true);
  assert.equal(r.updates.payment_status, "refunded");
  assert.equal(r.updates.status, "refunded");
  assert.equal(r.updates.affiliate_status, "reversed");
});

test("partial refund does not close the order or reverse commission", () => {
  const r = resolveRefund({ ...withAffiliate, payment_status: "paid" }, 2000);
  assert.equal(r.apply, true);
  assert.equal(r.fullyRefunded, false);
  assert.equal(r.updates.payment_status, "partially_refunded");
  assert.equal(r.updates.status, undefined);
  assert.equal(r.updates.affiliate_status, undefined);
});

test("replayed refund never regresses a larger refund", () => {
  const already = { ...unpaid, payment_status: "partially_refunded", amount_refunded: 5000 };
  assert.equal(resolveRefund(already, 5000).apply, false);
  assert.equal(resolveRefund(already, 2000).apply, false);
  assert.equal(resolveRefund(already, 7900).apply, true); // escalating to full is allowed
});

test("event id ledger blocks replays", () => {
  assert.equal(isDuplicateEvent(["evt_1", "evt_2"], "evt_1"), true);
  assert.equal(isDuplicateEvent(["evt_1"], "evt_9"), false);
});

test("missing order is never applied", () => {
  assert.equal(resolvePaymentSuccess(null, 7900).apply, false);
  assert.equal(resolveRefund(null, 100).apply, false);
  assert.equal(resolveSessionExpired(null).apply, false);
});

test("expired unpaid checkout cancels the order and voids unpaid commission", () => {
  const r = resolveSessionExpired(withAffiliate);
  assert.equal(r.apply, true);
  assert.equal(r.updates.status, "canceled");
  assert.equal(r.updates.payment_status, "expired");
  assert.equal(r.updates.affiliate_status, "void");
});

test("expiry never overwrites a paid or refunded order", () => {
  assert.equal(resolveSessionExpired(paid).apply, false);
  assert.equal(resolveSessionExpired({ ...unpaid, payment_status: "refunded" }).apply, false);
  assert.equal(resolveSessionExpired({ ...unpaid, payment_status: "expired" }).apply, false);
});
