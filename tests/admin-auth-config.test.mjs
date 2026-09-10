import test from "node:test";
import assert from "node:assert/strict";
import { resolveAdminAuthConfig, MIN_SESSION_SECRET_LENGTH } from "../src/lib/admin/auth-config.mjs";

const FULL = {
  ADMIN_EMAIL: "admin@vialfoundry.com",
  ADMIN_ACCESS_PASSWORD: "a-real-strong-password",
  ADMIN_SESSION_SECRET: "x".repeat(64),
};

test("resolves a complete, well-formed admin config", () => {
  const c = resolveAdminAuthConfig(FULL);
  assert.ok(c);
  assert.equal(c.adminEmail, "admin@vialfoundry.com");
});

test("fails closed when any required credential is missing (public repo: no fallbacks)", () => {
  for (const key of ["ADMIN_EMAIL", "ADMIN_ACCESS_PASSWORD", "ADMIN_SESSION_SECRET"]) {
    const partial = { ...FULL };
    delete partial[key];
    assert.equal(resolveAdminAuthConfig(partial), null, `${key} missing must deny admin`);
  }
});

test("treats blank / whitespace-only credentials as missing", () => {
  assert.equal(resolveAdminAuthConfig({ ...FULL, ADMIN_ACCESS_PASSWORD: "   " }), null);
  assert.equal(resolveAdminAuthConfig({ ...FULL, ADMIN_EMAIL: "" }), null);
});

test("rejects a session secret that is too short to be a real secret", () => {
  const shortSecret = "x".repeat(MIN_SESSION_SECRET_LENGTH - 1);
  assert.equal(resolveAdminAuthConfig({ ...FULL, ADMIN_SESSION_SECRET: shortSecret }), null);
});

test("an empty environment denies admin access", () => {
  assert.equal(resolveAdminAuthConfig({}), null);
  assert.equal(resolveAdminAuthConfig(), null);
});
