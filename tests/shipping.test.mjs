import test from "node:test";
import assert from "node:assert/strict";
import { calculateShipping, getFreeShippingMessage } from "../src/lib/manual-orders/shipping.mjs";

test("calculates standard, priority, and express shipping pricing", () => {
  const standard = calculateShipping(5000, "standard");
  assert.equal(standard.amountCents, 1500);
  assert.equal(standard.displayPrice, "$15.00");

  const priority = calculateShipping(5000, "priority");
  assert.equal(priority.amountCents, 3500);
  assert.equal(priority.displayPrice, "$35.00");

  const express = calculateShipping(5000, "express");
  assert.equal(express.amountCents, 6500);
  assert.equal(express.displayPrice, "$65.00");
});

test("unlocks free standard shipping at or above $200 threshold", () => {
  const under = calculateShipping(19900, "standard");
  assert.equal(under.amountCents, 1500);
  assert.equal(under.displayPrice, "$15.00");

  const over = calculateShipping(20000, "standard");
  assert.equal(over.amountCents, 0);
  assert.equal(over.displayPrice, "FREE");

  // Priority and express remain paid even above threshold
  const priorityOver = calculateShipping(25000, "priority");
  assert.equal(priorityOver.amountCents, 3500);
});

test("getFreeShippingMessage formats remaining amount", () => {
  const msg = getFreeShippingMessage(15000);
  assert.equal(msg, "You're $50.00 away from free Standard Shipping.");

  const unlocked = getFreeShippingMessage(20000);
  assert.equal(unlocked, "Free Standard Shipping unlocked.");
});
