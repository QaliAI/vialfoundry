import crypto from "crypto";

export const ADMIN_SESSION_COOKIE_NAME = "vf_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function createAdminSessionToken(email, secret) {
  if (!secret || typeof secret !== "string" || secret.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 16 characters long.");
  }
  const timestamp = Date.now();
  const payload = `${email}:${timestamp}`;
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

export function parseAdminSessionToken(token, secret, maxAgeSeconds = ADMIN_SESSION_MAX_AGE_SECONDS) {
  if (!token || !secret) return null;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;
    const [email, timestampStr, signature] = parts;
    const timestamp = Number(timestampStr);
    if (!email || !Number.isFinite(timestamp)) return null;

    const ageSeconds = (Date.now() - timestamp) / 1000;
    if (ageSeconds < 0 || ageSeconds > maxAgeSeconds) return null;

    const expectedPayload = `${email}:${timestampStr}`;
    const expectedSignature = crypto.createHmac("sha256", secret).update(expectedPayload).digest("hex");

    if (signature.length !== expectedSignature.length) return null;
    const match = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    if (!match) return null;
    return { email: email.toLowerCase() };
  } catch {
    return null;
  }
}

export function verifyAdminSessionToken(token, secret, maxAgeSeconds = ADMIN_SESSION_MAX_AGE_SECONDS) {
  return parseAdminSessionToken(token, secret, maxAgeSeconds) !== null;
}

export function hashLoginToken(raw) {
  return crypto.createHash("sha256").update(String(raw)).digest("hex");
}

export function generateLoginToken() {
  return crypto.randomBytes(32).toString("hex");
}
