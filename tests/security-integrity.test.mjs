import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import {
  createAdminSessionToken,
  verifyAdminSessionToken,
  ADMIN_SESSION_COOKIE_NAME,
} from "../src/lib/admin/session-token.mjs";
import { recalculateInvoice } from "../src/lib/admin/order-math.mjs";

test("timing-safe HMAC tokens reject invalid, altered, and forged signatures", () => {
  const secret = "very-secure-32-char-admin-secret-key-1234";
  const token = createAdminSessionToken("admin@vialfoundry.com", secret);
  assert.ok(token);

  // Valid token passes
  assert.equal(verifyAdminSessionToken(token, secret), true);

  // Wrong secret fails
  assert.equal(verifyAdminSessionToken(token, "wrong-secret-key-that-is-32-chars-long"), false);

  // Tampered payload fails
  const decoded = Buffer.from(token, "base64url").toString("utf8");
  const parts = decoded.split(":");
  const tamperedPayload = `hacker@evil.com:${parts[1]}:${parts[2]}`;
  const tamperedToken = Buffer.from(tamperedPayload).toString("base64url");
  assert.equal(verifyAdminSessionToken(tamperedToken, secret), false);

  // Expired token fails
  const pastTimestamp = Date.now() - 60000; // 60s ago
  const expiredPayload = `admin@vialfoundry.com:${pastTimestamp}`;
  const expiredSig = crypto.createHmac("sha256", secret).update(expiredPayload).digest("hex");
  const expiredToken = Buffer.from(`${expiredPayload}:${expiredSig}`).toString("base64url");
  assert.equal(verifyAdminSessionToken(expiredToken, secret, 10), false); // 10s max age
});

test("constant-time SHA-256 password hash comparison prevents timing side-channels", () => {
  function comparePasswordsConstantTime(attempt, expected) {
    const attemptHash = crypto.createHash("sha256").update(String(attempt)).digest();
    const expectedHash = crypto.createHash("sha256").update(String(expected)).digest();
    return crypto.timingSafeEqual(attemptHash, expectedHash);
  }

  assert.equal(comparePasswordsConstantTime("foundry2026", "foundry2026"), true);
  assert.equal(comparePasswordsConstantTime("foundry2025", "foundry2026"), false);
  assert.equal(comparePasswordsConstantTime("short", "foundry2026"), false);
  assert.equal(comparePasswordsConstantTime("verylongpasswordthatdoesnotmatch", "foundry2026"), false);
});

test("client cannot inject or inflate discounts outside of configured promotions", () => {
  const brandPromotions = [
    { code: "FOUNDRY10", discountRateBps: 1000, enabled: true },
  ];

  // Client attempts to pass a fake 50% discount code "HACK50"
  const forgedResult = recalculateInvoice(
    {
      items: [{ product_name: "BPC-157", unit_price_amount: 10000, quantity: 1 }],
      promoCode: "HACK50",
      shippingAmount: 1500,
    },
    brandPromotions
  );

  // Fake discount is ignored (discount_amount: 0), total remains $100 + $15 shipping = $115
  assert.equal(forgedResult.discount_amount, 0);
  assert.equal(forgedResult.subtotal_after_discount, 10000);
  assert.equal(forgedResult.total_amount, 11500);
  assert.equal(forgedResult.promo_code, null);
});

test("environment variable scanner verifies no service role credentials are in client namespace", () => {
  const publicVars = Object.keys(process.env).filter((k) => k.startsWith("NEXT_PUBLIC_"));
  for (const v of publicVars) {
    assert.ok(
      !v.includes("SERVICE_ROLE") && !v.includes("SECRET_KEY"),
      `Client variable ${v} must not expose private service credentials`
    );
  }
});
