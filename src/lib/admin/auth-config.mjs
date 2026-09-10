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
 * @param {Record<string, string | undefined>} env
 * @returns {{ adminEmail: string, accessPassword: string, sessionSecret: string } | null}
 */
export function resolveAdminAuthConfig(env = {}) {
  const adminEmail = clean(env.ADMIN_EMAIL);
  const accessPassword = clean(env.ADMIN_ACCESS_PASSWORD);
  const sessionSecret = clean(env.ADMIN_SESSION_SECRET);

  if (!adminEmail || !accessPassword || !sessionSecret) return null;
  if (sessionSecret.length < MIN_SESSION_SECRET_LENGTH) return null;

  return { adminEmail, accessPassword, sessionSecret };
}

export { MIN_SESSION_SECRET_LENGTH };
