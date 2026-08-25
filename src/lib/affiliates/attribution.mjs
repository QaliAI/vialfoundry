import { AFFILIATE_COOKIE_MAX_AGE_SECONDS, resolveAliasCode, normalizeAffiliateCode } from "./utils.mjs";

export const DEFAULT_AFFILIATE_COOKIE_NAME = "vf_ref_partner";

export function getAffiliateCookieConfig(options = {}) {
  return {
    name: options.cookieName || DEFAULT_AFFILIATE_COOKIE_NAME,
    maxAge: options.maxAgeSeconds || AFFILIATE_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false, // Allow client-side checkout to read attribution code
  };
}

export function parseAffiliateCodeFromCookie(cookieHeader, cookieName = DEFAULT_AFFILIATE_COOKIE_NAME) {
  if (!cookieHeader || typeof cookieHeader !== "string") {
    return null;
  }
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const target = cookies.find((c) => c.startsWith(`${cookieName}=`));
  if (!target) return null;
  const value = target.split("=")[1];
  if (!value) return null;
  try {
    const decoded = decodeURIComponent(value);
    const normalized = normalizeAffiliateCode(decoded);
    return resolveAliasCode(normalized);
  } catch {
    return null;
  }
}
