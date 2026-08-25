import { cookies } from "next/headers";
import { sanitizeEnvValue } from "../env/sanitizer";
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "./session-token.mjs";

export function getAdminAuthConfig() {
  const adminEmail = sanitizeEnvValue(process.env.ADMIN_EMAIL) || "admin@vialfoundry.com";
  const accessPassword = sanitizeEnvValue(process.env.ADMIN_ACCESS_PASSWORD) || "foundry2026";
  const sessionSecret = sanitizeEnvValue(process.env.ADMIN_SESSION_SECRET) || "vial-foundry-dev-session-secret-key-32chars";

  return {
    adminEmail,
    accessPassword,
    sessionSecret,
  };
}

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!token) return false;

  const { sessionSecret } = getAdminAuthConfig();
  return verifyAdminSessionToken(token, sessionSecret);
}

export function generateAdminSessionCookie(email: string) {
  const { sessionSecret } = getAdminAuthConfig();
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
