import test from "node:test";
import assert from "node:assert/strict";
import {
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "../src/lib/admin/session-token.mjs";

const TEST_SECRET = "super-secret-key-that-is-at-least-32-chars-long";

test("creates and verifies valid admin HMAC session token", () => {
  const token = createAdminSessionToken("admin@vialfoundry.com", TEST_SECRET);
  assert.ok(token);
  assert.equal(typeof token, "string");

  const isValid = verifyAdminSessionToken(token, TEST_SECRET);
  assert.equal(isValid, true);
});

test("rejects token with wrong secret", () => {
  const token = createAdminSessionToken("admin@vialfoundry.com", TEST_SECRET);
  const isValid = verifyAdminSessionToken(token, "wrong-secret-key-that-is-long-enough");
  assert.equal(isValid, false);
});

test("rejects expired token", () => {
  const token = createAdminSessionToken("admin@vialfoundry.com", TEST_SECRET);
  const isValid = verifyAdminSessionToken(token, TEST_SECRET, -1);
  assert.equal(isValid, false);
});
