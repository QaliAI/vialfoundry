import test from "node:test";
import assert from "node:assert/strict";
import { resolveEmailIdentity } from "../src/lib/email/identity.mjs";

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
