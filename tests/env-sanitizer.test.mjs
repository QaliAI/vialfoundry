import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeEnvValue } from "../src/lib/env/sanitizer.mjs";

test("strips BOM, quotes, and trims whitespace", () => {
  assert.equal(sanitizeEnvValue("\uFEFFmy-secret-key"), "my-secret-key");
  assert.equal(sanitizeEnvValue('"quoted-value"'), "quoted-value");
  assert.equal(sanitizeEnvValue("'single-quoted'"), "single-quoted");
  assert.equal(sanitizeEnvValue("  padded-value  "), "padded-value");
  assert.equal(sanitizeEnvValue(undefined), undefined);
  assert.equal(sanitizeEnvValue(null), undefined);
  assert.equal(sanitizeEnvValue(""), undefined);
});
