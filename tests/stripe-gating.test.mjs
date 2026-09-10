import test from "node:test";
import assert from "node:assert/strict";
import {
  STRIPE_ENV_KEYS,
  missingStripeEnv,
  isStripeConfigured,
  isStripeEnabled,
  isStripeEnvironmentAllowed,
  stripeSecretMode,
  stripePublishableMode,
  stripeRuntimeEnvironment,
  stripeEnvironmentMismatch,
  stripeDashboardBaseUrl,
  stripeDashboardPaymentUrl,
  stripeConfigStatus,
} from "../src/lib/adapters/stripe-gating.mjs";

const TEST = {
  PAYMENT_GATEWAY_TYPE: "stripe",
  STRIPE_SECRET_KEY: "sk_test_x",
  STRIPE_WEBHOOK_SECRET: "whsec_x",
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_x",
};

const LIVE_PROD = {
  PAYMENT_GATEWAY_TYPE: "stripe",
  STRIPE_SECRET_KEY: "sk_live_x",
  STRIPE_WEBHOOK_SECRET: "whsec_x",
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_live_x",
  VERCEL_ENV: "production",
};

test("stripe is enabled only when selected AND fully credentialed AND env-safe", () => {
  assert.equal(isStripeEnabled(TEST), true);
  assert.equal(isStripeEnabled(LIVE_PROD), true);
  assert.equal(isStripeEnabled({ ...TEST, PAYMENT_GATEWAY_TYPE: "sandbox" }), false);
  assert.equal(isStripeEnabled({ PAYMENT_GATEWAY_TYPE: "stripe" }), false);
});

test("a partially configured environment never enables stripe", () => {
  for (const key of STRIPE_ENV_KEYS) {
    const partial = { ...TEST };
    delete partial[key];
    assert.equal(isStripeEnabled(partial), false, `${key} missing must disable stripe`);
    assert.deepEqual(missingStripeEnv(partial), [key]);
  }
});

test("blank and whitespace-only credentials count as missing", () => {
  assert.equal(isStripeConfigured({ ...TEST, STRIPE_SECRET_KEY: "" }), false);
  assert.equal(isStripeConfigured({ ...TEST, STRIPE_WEBHOOK_SECRET: "   " }), false);
  assert.equal(isStripeConfigured(TEST), true);
});

test("missingStripeEnv reports every absent key", () => {
  assert.deepEqual(missingStripeEnv({ PAYMENT_GATEWAY_TYPE: "stripe" }).sort(), [...STRIPE_ENV_KEYS].sort());
});

test("mode is derived from the key prefix, never from customer input", () => {
  assert.equal(stripeSecretMode(TEST), "test");
  assert.equal(stripeSecretMode(LIVE_PROD), "live");
  assert.equal(stripePublishableMode(TEST), "test");
  assert.equal(stripePublishableMode(LIVE_PROD), "live");
  assert.equal(stripeSecretMode({ STRIPE_SECRET_KEY: "not-a-key" }), null);
});

test("local and preview accept TEST keys only", () => {
  assert.equal(isStripeEnabled({ ...TEST, VERCEL_ENV: "development" }), true);
  assert.equal(isStripeEnabled({ ...TEST, VERCEL_ENV: "preview" }), true);
  assert.equal(isStripeEnabled({ ...LIVE_PROD, VERCEL_ENV: "preview" }), false);
  assert.equal(isStripeEnabled({ ...LIVE_PROD, VERCEL_ENV: "development" }), false);
  assert.ok(stripeEnvironmentMismatch({ ...LIVE_PROD, VERCEL_ENV: "preview" }).includes("live_key_outside_production"));
});

test("production accepts LIVE keys only", () => {
  assert.equal(isStripeEnabled(LIVE_PROD), true);
  assert.equal(isStripeEnabled({ ...TEST, VERCEL_ENV: "production" }), false);
  assert.ok(
    stripeEnvironmentMismatch({ ...TEST, VERCEL_ENV: "production" }).includes("test_key_in_production"),
  );
});

test("mismatched secret and publishable modes fail closed", () => {
  const mixed = { ...TEST, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_live_x" };
  assert.equal(isStripeEnabled(mixed), false);
  assert.ok(stripeEnvironmentMismatch(mixed).includes("secret_publishable_mode_mismatch"));
  assert.equal(isStripeEnvironmentAllowed(mixed), false);
});

test("live keys on a local machine (no VERCEL_ENV) fail closed", () => {
  const localLive = {
    PAYMENT_GATEWAY_TYPE: "stripe",
    STRIPE_SECRET_KEY: "sk_live_x",
    STRIPE_WEBHOOK_SECRET: "whsec_x",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_live_x",
  };
  assert.equal(stripeRuntimeEnvironment(localLive), "development");
  assert.equal(isStripeEnabled(localLive), false);
});

test("status object never includes secret values", () => {
  const status = stripeConfigStatus(TEST);
  const serialized = JSON.stringify(status);
  assert.equal(status.enabled, true);
  assert.equal(status.mode, "test");
  assert.equal(serialized.includes("sk_test"), false);
  assert.equal(serialized.includes("whsec"), false);
});

test("dashboard URLs point at test or live based on the order's livemode, not the current process", () => {
  assert.equal(stripeDashboardBaseUrl(false), "https://dashboard.stripe.com/test");
  assert.equal(stripeDashboardBaseUrl(true), "https://dashboard.stripe.com");
  assert.equal(
    stripeDashboardPaymentUrl("pi_123", false),
    "https://dashboard.stripe.com/test/payments/pi_123",
  );
  assert.equal(
    stripeDashboardPaymentUrl("pi_123", true),
    "https://dashboard.stripe.com/payments/pi_123",
  );
});
