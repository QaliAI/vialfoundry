export const LOGIN_TOKEN_TTL_MS = 12 * 60 * 1000; // 12 minutes
export const GENERIC_LOGIN_ACK =
  "If that address is on the admin list, we sent a login link. Check your inbox.";

export function normalizeAdminEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isUsableAdmin(user) {
  return Boolean(user && user.active !== false && user.email);
}
