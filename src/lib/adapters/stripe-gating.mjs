/**
 * Stripe feature gating and TEST/LIVE environment safety.
 *
 * Kept dependency-free (and in .mjs) so the rule that decides whether card
 * payments are live can be unit-tested without pulling in the Stripe SDK or a
 * Next.js runtime.
 *
 * Security-relevant invariants:
 *   - A partially configured environment never half-enables payments.
 *   - Mode is determined ONLY from the Stripe secret/publishable keys, never
 *     from customer input.
 *   - Live keys are refused outside Vercel production.
 *   - Test keys are refused in Vercel production.
 *   - Secret and publishable keys must be the same mode.
 *   - There is no runtime fallback onto a second live/test secret. The
 *     process sees exactly one STRIPE_SECRET_KEY.
 */

export const STRIPE_ENV_KEYS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
];

/** Which required Stripe variables are absent or blank. */
export function missingStripeEnv(env = process.env) {
  return STRIPE_ENV_KEYS.filter((key) => {
    const value = env[key];
    return typeof value !== "string" || value.trim() === "";
  });
}

export function isStripeConfigured(env = process.env) {
  return missingStripeEnv(env).length === 0;
}

/**
 * TEST vs LIVE, derived only from the secret key prefix.
 * Returns "test" | "live" | null.
 */
export function stripeSecretMode(env = process.env) {
  const key = String(env.STRIPE_SECRET_KEY || "").trim();
  if (key.startsWith("sk_test_") || key.startsWith("rk_test_")) return "test";
  if (key.startsWith("sk_live_") || key.startsWith("rk_live_")) return "live";
  return null;
}

/** TEST vs LIVE from the publishable key. Returns "test" | "live" | null. */
export function stripePublishableMode(env = process.env) {
  const key = String(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "").trim();
  if (key.startsWith("pk_test_")) return "test";
  if (key.startsWith("pk_live_")) return "live";
  return null;
}

/**
 * Runtime we are executing in.
 * Vercel sets VERCEL_ENV to production | preview | development.
 * Local `next dev` has no VERCEL_ENV and is treated as development.
 */
export function stripeRuntimeEnvironment(env = process.env) {
  const vercel = String(env.VERCEL_ENV || "").toLowerCase();
  if (vercel === "production" || vercel === "preview" || vercel === "development") {
    return vercel;
  }
  return "development";
}

/**
 * Reasons the current key/environment pairing is unsafe.
 * Empty array means the pairing is allowed (credentials may still be missing).
 */
export function stripeEnvironmentMismatch(env = process.env) {
  const reasons = [];
  const secretMode = stripeSecretMode(env);
  const pubMode = stripePublishableMode(env);
  const runtime = stripeRuntimeEnvironment(env);

  if (secretMode && pubMode && secretMode !== pubMode) {
    reasons.push("secret_publishable_mode_mismatch");
  }
  if (secretMode === "live" && runtime !== "production") {
    reasons.push("live_key_outside_production");
  }
  if (secretMode === "test" && runtime === "production") {
    reasons.push("test_key_in_production");
  }
  if (env.STRIPE_SECRET_KEY && !secretMode) {
    reasons.push("unrecognized_secret_key_prefix");
  }
  return reasons;
}

export function isStripeEnvironmentAllowed(env = process.env) {
  return stripeSecretMode(env) !== null && stripeEnvironmentMismatch(env).length === 0;
}

/**
 * Stripe handles checkout only when it is:
 *   1. explicitly selected (PAYMENT_GATEWAY_TYPE=stripe)
 *   2. fully credentialed
 *   3. running with keys that match this environment (test locally/preview,
 *      live only in Vercel production)
 *
 * Any one of those failing keeps card checkout dark. We never silently
 * switch to live mode.
 */
export function isStripeEnabled(env = process.env) {
  return (
    env.PAYMENT_GATEWAY_TYPE === "stripe" &&
    isStripeConfigured(env) &&
    isStripeEnvironmentAllowed(env)
  );
}

/** Client-safe: the storefront may show the Stripe CTA from public vars only. */
export function isStripeClientEnabled(env = process.env) {
  const pub = String(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "").trim();
  const type = env.NEXT_PUBLIC_PAYMENT_GATEWAY_TYPE || env.PAYMENT_GATEWAY_TYPE;
  return type === "stripe" && pub.length > 0 && (pub.startsWith("pk_test_") || pub.startsWith("pk_live_"));
}

export function stripeDashboardBaseUrl(livemode) {
  return livemode === true || livemode === "live"
    ? "https://dashboard.stripe.com"
    : "https://dashboard.stripe.com/test";
}

export function stripeDashboardPaymentUrl(paymentIntentId, livemode) {
  if (!paymentIntentId) return null;
  return `${stripeDashboardBaseUrl(livemode)}/payments/${encodeURIComponent(paymentIntentId)}`;
}

export function stripeDashboardSessionUrl(sessionId, livemode) {
  if (!sessionId) return null;
  return `${stripeDashboardBaseUrl(livemode)}/checkout/sessions/${encodeURIComponent(sessionId)}`;
}

/**
 * Status object safe to log: names and modes only, never secret values.
 */
export function stripeConfigStatus(env = process.env) {
  return {
    enabled: isStripeEnabled(env),
    selected: env.PAYMENT_GATEWAY_TYPE === "stripe",
    mode: stripeSecretMode(env),
    runtime: stripeRuntimeEnvironment(env),
    missing: missingStripeEnv(env),
    mismatch: stripeEnvironmentMismatch(env),
  };
}
