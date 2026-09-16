import test from "node:test";
import assert from "node:assert/strict";
import { calculateShipping, getFreeShippingMessage } from "../src/lib/manual-orders/shipping.mjs";

test("calculates standard, priority, and express shipping pricing", () => {
  const standard = calculateShipping(5000, "standard");
  assert.equal(standard.amountCents, 999);
  assert.equal(standard.displayPrice, "$9.99");

  const priority = calculateShipping(5000, "priority");
  assert.equal(priority.amountCents, 2499);
  assert.equal(priority.displayPrice, "$24.99");

  const express = calculateShipping(5000, "express");
  assert.equal(express.amountCents, 4999);
  assert.equal(express.displayPrice, "$49.99");
});

test("unlocks free standard shipping at or above $200 threshold", () => {
  // $199.99 standard order charges standard shipping
  const under = calculateShipping(19999, "standard");
  assert.equal(under.amountCents, 999);
  assert.equal(under.displayPrice, "$9.99");

  // $200.00 standard order ships free
  const over = calculateShipping(20000, "standard");
  assert.equal(over.amountCents, 0);
  assert.equal(over.displayPrice, "FREE");

  // Priority and express remain paid even at or above $200 threshold
  const priorityAtThreshold = calculateShipping(20000, "priority");
  assert.equal(priorityAtThreshold.amountCents, 2499);
  assert.equal(priorityAtThreshold.displayPrice, "$24.99");

  const expressAtThreshold = calculateShipping(20000, "express");
  assert.equal(expressAtThreshold.amountCents, 4999);
  assert.equal(expressAtThreshold.displayPrice, "$49.99");
});

test("getFreeShippingMessage formats remaining amount", () => {
  const msg = getFreeShippingMessage(15000);
  assert.equal(msg, "You're $50.00 away from free Standard Shipping.");

  const unlocked = getFreeShippingMessage(20000);
  assert.equal(unlocked, "Free Standard Shipping unlocked.");
});
