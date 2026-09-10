/**
 * Stripe feature gating.
 *
 * Kept dependency-free (and in .mjs) so the rule that decides whether card
 * payments are live can be unit-tested without pulling in the Stripe SDK or a
 * Next.js runtime. The rule itself is security-relevant: a partially configured
 * environment must never half-enable payments.
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
 * Stripe handles checkout only when it is BOTH explicitly selected and fully
 * credentialed. Either condition alone is not enough.
 */
export function isStripeEnabled(env = process.env) {
  return env.PAYMENT_GATEWAY_TYPE === "stripe" && isStripeConfigured(env);
}
