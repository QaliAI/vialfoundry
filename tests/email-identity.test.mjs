import test from "node:test";
import assert from "node:assert/strict";
import { resolveEmailIdentity } from "../src/lib/email/identity.mjs";
import { resolveOrderNotificationEmails } from "../src/config/brand.ts";

test("default transactional sender is Vial Foundry <orders@vialfoundry.com>", () => {
  const id = resolveEmailIdentity({}, { supportEmail: "support@vialfoundry.com" });
  assert.equal(id.from, "Vial Foundry <orders@vialfoundry.com>");
  assert.equal(id.replyTo, "support@vialfoundry.com");
});

test("TRANSACTIONAL_EMAIL_REPLY_TO wins when explicitly configured", () => {
  const id = resolveEmailIdentity(
    { TRANSACTIONAL_EMAIL_REPLY_TO: "support@vialfoundry.com" },
    { supportEmail: "hello@vialfoundry.com" },
  );
  assert.equal(id.replyTo, "support@vialfoundry.com");
});

test("TRANSACTIONAL_EMAIL_FROM can be a bare address or a full mailbox", () => {
  const bare = resolveEmailIdentity({ TRANSACTIONAL_EMAIL_FROM: "orders@vialfoundry.com" });
  assert.equal(bare.from, "Vial Foundry <orders@vialfoundry.com>");
  const full = resolveEmailIdentity({ TRANSACTIONAL_EMAIL_FROM: "Vial Foundry <orders@vialfoundry.com>" });
  assert.equal(full.from, "Vial Foundry <orders@vialfoundry.com>");
});

test("blank reply-to falls through to support@", () => {
  const id = resolveEmailIdentity({ TRANSACTIONAL_EMAIL_REPLY_TO: "   " });
  assert.equal(id.replyTo, "support@vialfoundry.com");
});

test("resolveOrderNotificationEmails handles one address", () => {
  const result = resolveOrderNotificationEmails("owner1@vialfoundry.com", "");
  assert.deepEqual(result, ["owner1@vialfoundry.com"]);
});

test("resolveOrderNotificationEmails handles comma-separated addresses", () => {
  const result = resolveOrderNotificationEmails("admin1@vialfoundry.com, admin2@vialfoundry.com", "");
  assert.deepEqual(result, ["admin1@vialfoundry.com", "admin2@vialfoundry.com"]);
});

test("resolveOrderNotificationEmails resolves addresses across both variables", () => {
  const result = resolveOrderNotificationEmails("primary@vialfoundry.com", "secondary@vialfoundry.com");
  assert.deepEqual(result, ["primary@vialfoundry.com", "secondary@vialfoundry.com"]);
});

test("resolveOrderNotificationEmails deduplicates safely and normalizes case", () => {
  const result = resolveOrderNotificationEmails(
    "Owner@vialfoundry.com, ops@vialfoundry.com",
    "owner@vialfoundry.com, OPS@vialfoundry.com, extra@vialfoundry.com"
  );
  assert.deepEqual(result, ["owner@vialfoundry.com", "ops@vialfoundry.com", "extra@vialfoundry.com"]);
});

test("resolveOrderNotificationEmails returns empty array on empty config or whitespace", () => {
  assert.deepEqual(resolveOrderNotificationEmails("", ""), []);
  assert.deepEqual(resolveOrderNotificationEmails("   ", " , , "), []);
  assert.deepEqual(resolveOrderNotificationEmails(undefined, undefined), []);
});

