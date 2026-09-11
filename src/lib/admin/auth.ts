import { cookies } from "next/headers";
import { sanitizeEnvValue } from "../env/sanitizer";
import { resolveAdminAuthConfig } from "./auth-config.mjs";
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  parseAdminSessionToken,
  verifyAdminSessionToken,
} from "./session-token.mjs";

export interface AdminAuthConfig {
  sessionSecret: string;
}

export interface AdminSession {
  email: string;
}

export function getAdminAuthConfig(): AdminAuthConfig | null {
  return resolveAdminAuthConfig({
    ADMIN_SESSION_SECRET: sanitizeEnvValue(process.env.ADMIN_SESSION_SECRET),
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const config = getAdminAuthConfig();
  if (!config) return null;

  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  return parseAdminSessionToken(token, config.sessionSecret);
}

export async function verifyAdminSession(): Promise<boolean> {
  return Boolean(await getAdminSession());
}

export async function requireAdminActor(): Promise<string | null> {
  const session = await getAdminSession();
  return session?.email || null;
}

export function generateAdminSessionCookie(email: string, sessionSecret: string) {
  const token = createAdminSessionToken(email.trim().toLowerCase(), sessionSecret);

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

export { verifyAdminSessionToken };
