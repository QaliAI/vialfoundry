import test from "node:test";
import assert from "node:assert/strict";
import {
  STRIPE_ENV_KEYS,
  missingStripeEnv,
  isStripeConfigured,
  isStripeEnabled,
} from "../src/lib/adapters/stripe-gating.mjs";

const FULL = {
  PAYMENT_GATEWAY_TYPE: "stripe",
  STRIPE_SECRET_KEY: "sk_live_x",
  STRIPE_WEBHOOK_SECRET: "whsec_x",
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_live_x",
};

test("stripe is enabled only when selected AND fully credentialed", () => {
  assert.equal(isStripeEnabled(FULL), true);
  assert.equal(isStripeEnabled({ ...FULL, PAYMENT_GATEWAY_TYPE: "sandbox" }), false);
  assert.equal(isStripeEnabled({ PAYMENT_GATEWAY_TYPE: "stripe" }), false);
});

test("a partially configured environment never enables stripe", () => {
  for (const key of STRIPE_ENV_KEYS) {
    const partial = { ...FULL };
    delete partial[key];
    assert.equal(isStripeEnabled(partial), false, `${key} missing must disable stripe`);
    assert.deepEqual(missingStripeEnv(partial), [key]);
  }
});

test("blank and whitespace-only credentials count as missing", () => {
  assert.equal(isStripeConfigured({ ...FULL, STRIPE_SECRET_KEY: "" }), false);
  assert.equal(isStripeConfigured({ ...FULL, STRIPE_WEBHOOK_SECRET: "   " }), false);
  assert.equal(isStripeConfigured(FULL), true);
});

test("missingStripeEnv reports every absent key", () => {
  assert.deepEqual(missingStripeEnv({ PAYMENT_GATEWAY_TYPE: "stripe" }).sort(), [...STRIPE_ENV_KEYS].sort());
});
