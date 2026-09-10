import { cookies } from "next/headers";
import { sanitizeEnvValue } from "../env/sanitizer";
import { resolveAdminAuthConfig } from "./auth-config.mjs";
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "./session-token.mjs";

export interface AdminAuthConfig {
  adminEmail: string;
  accessPassword: string;
  sessionSecret: string;
}

/**
 * Reads admin auth configuration from the environment.
 *
 * There are deliberately NO hardcoded fallback credentials. This repository is
 * public, so a fallback password or session secret would be a published
 * credential — and a fallback session secret would let anyone forge a valid
 * admin cookie. When any required value is missing we return null, and every
 * caller treats that as "admin is unavailable" (fail closed) rather than
 * silently authenticating against a known-public default.
 */
export function getAdminAuthConfig(): AdminAuthConfig | null {
  return resolveAdminAuthConfig({
    ADMIN_EMAIL: sanitizeEnvValue(process.env.ADMIN_EMAIL),
    ADMIN_ACCESS_PASSWORD: sanitizeEnvValue(process.env.ADMIN_ACCESS_PASSWORD),
    ADMIN_SESSION_SECRET: sanitizeEnvValue(process.env.ADMIN_SESSION_SECRET),
  });
}

export async function verifyAdminSession(): Promise<boolean> {
  const config = getAdminAuthConfig();
  if (!config) return false;

  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!token) return false;

  return verifyAdminSessionToken(token, config.sessionSecret);
}

export function generateAdminSessionCookie(email: string, sessionSecret: string) {
  const token = createAdminSessionToken(email, sessionSecret);

  return {
    name: ADMIN_SESSION_COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    },
  };
}
