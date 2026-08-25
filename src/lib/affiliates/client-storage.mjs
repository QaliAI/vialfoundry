const COOKIE_NAME = "vf_ref_partner";

export function getClientAffiliateCode() {
  if (typeof document === "undefined") {
    return null;
  }

  // 1. Check document.cookie
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));

  if (match) {
    const val = match.split("=")[1];
    if (val) return decodeURIComponent(val).trim().toUpperCase();
  }

  // 2. LocalStorage fallback
  try {
    const stored = localStorage.getItem(COOKIE_NAME);
    if (stored) return stored.trim().toUpperCase();
  } catch {
    // Ignore storage errors
  }

  return null;
}

export function setClientAffiliateCode(code) {
  if (typeof document === "undefined" || !code) return;
  const clean = String(code).trim().toUpperCase();
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(clean)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  try {
    localStorage.setItem(COOKIE_NAME, clean);
  } catch {
    // Ignore
  }
}
