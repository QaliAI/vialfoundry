/**
 * Pure admin-auth configuration resolver.
 *
 * Kept dependency-free (and in .mjs) so the fail-closed rule can be unit-tested
 * without next/headers or a running server. This repository is public, so there
 * must be NO fallback credentials: a fallback password would be a published
 * password, and a fallback session secret would let anyone forge an admin
 * cookie. When any required value is missing or the secret is too short to be a
 * real secret, this returns null and callers deny admin access.
 */

const MIN_SESSION_SECRET_LENGTH = 32;

function clean(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

/**
 * Passwordless admin login only needs a session-signing secret.
 * Allowlisted users live in admin_users, not in environment variables.
 *
 * @param {Record<string, string | undefined>} env
 * @returns {{ sessionSecret: string } | null}
 */
export function resolveAdminAuthConfig(env = {}) {
  const sessionSecret = clean(env.ADMIN_SESSION_SECRET);
  if (!sessionSecret) return null;
  if (sessionSecret.length < MIN_SESSION_SECRET_LENGTH) return null;
  return { sessionSecret };
}

export { MIN_SESSION_SECRET_LENGTH };
