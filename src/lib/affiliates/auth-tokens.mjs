import crypto from 'node:crypto';

export const AFFILIATE_SESSION_COOKIE_NAME = 'vf_affiliate_session';
export const AFFILIATE_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export function hashAffiliatePassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

export function verifyAffiliatePassword(password, salt, expectedHash) {
  try {
    const hash = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHash, 'hex');
    return expected.length === hash.length && crypto.timingSafeEqual(hash, expected);
  } catch {
    return false;
  }
}

export function generateAffiliateSessionToken(affiliate, secret = 'vf-affiliate-session-token-secret-2026') {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + AFFILIATE_SESSION_MAX_AGE_SECONDS;
  const payload = {
    affiliateId: affiliate.id,
    email: affiliate.email,
    code: affiliate.affiliateCode || affiliate.code || affiliate.referral_code,
    name: affiliate.name,
    iat,
    exp,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body);
  const sig = hmac.digest('base64url');
  return `${body}.${sig}`;
}

export function verifyAffiliateSessionToken(token, secret = 'vf-affiliate-session-token-secret-2026') {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 2) return null;
    const [body, sig] = parts;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(body);
    const expectedSig = hmac.digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return null;
    }
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    const now = Math.floor(Date.now() / 1000);
    if (data.exp < now) return null;
    return data;
  } catch {
    return null;
  }
}
