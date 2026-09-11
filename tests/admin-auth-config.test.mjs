import test from "node:test";
import assert from "node:assert/strict";
import { resolveAdminAuthConfig, MIN_SESSION_SECRET_LENGTH } from "../src/lib/admin/auth-config.mjs";

const FULL = {
  ADMIN_SESSION_SECRET: "x".repeat(64),
};

test("resolves when a real session secret is present", () => {
  const c = resolveAdminAuthConfig(FULL);
  assert.ok(c);
  assert.equal(c.sessionSecret.length, 64);
});

test("fails closed when the session secret is missing", () => {
  assert.equal(resolveAdminAuthConfig({}), null);
  assert.equal(resolveAdminAuthConfig({ ADMIN_SESSION_SECRET: "   " }), null);
});

test("rejects a session secret that is too short to be a real secret", () => {
  const shortSecret = "x".repeat(MIN_SESSION_SECRET_LENGTH - 1);
  assert.equal(resolveAdminAuthConfig({ ADMIN_SESSION_SECRET: shortSecret }), null);
});

test("does not require a shared ADMIN_EMAIL or ADMIN_ACCESS_PASSWORD", () => {
  const c = resolveAdminAuthConfig(FULL);
  assert.ok(c);
  assert.equal("accessPassword" in c, false);
});
