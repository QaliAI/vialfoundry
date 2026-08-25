import test from "node:test";
import assert from "node:assert/strict";
import { isValidStatusTransition, isCancelledStatus } from "../src/lib/admin/order-classification.mjs";

test("normal status happy path transitions are allowed", () => {
  assert.equal(isValidStatusTransition("new", "invoice_sent"), true);
  assert.equal(isValidStatusTransition("invoice_sent", "pending_payment"), true);
  assert.equal(isValidStatusTransition("pending_payment", "paid"), true);
  assert.equal(isValidStatusTransition("paid", "preparing"), true);
  assert.equal(isValidStatusTransition("preparing", "shipped"), true);
  assert.equal(isValidStatusTransition("shipped", "fulfilled"), true);
});

test("cancellation and refund paths are allowed", () => {
  assert.equal(isValidStatusTransition("new", "canceled"), true);
  assert.equal(isValidStatusTransition("pending_payment", "canceled"), true);
  assert.equal(isValidStatusTransition("paid", "refunded"), true);
  assert.equal(isValidStatusTransition("fulfilled", "refunded"), true);
});

test("refunded and canceled are terminal states", () => {
  assert.equal(isValidStatusTransition("refunded", "paid"), false);
  assert.equal(isValidStatusTransition("refunded", "shipped"), false);
  assert.equal(isValidStatusTransition("canceled", "paid"), false);
  assert.equal(isValidStatusTransition("canceled", "shipped"), false);
});

test("idempotent same-status updates are always allowed", () => {
  assert.equal(isValidStatusTransition("paid", "paid"), true);
  assert.equal(isValidStatusTransition("shipped", "shipped"), true);
});
