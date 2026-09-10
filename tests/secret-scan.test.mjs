import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(".");

function gitTrackedFiles() {
  const out = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" });
  return out.split(/\r?\n/).filter(Boolean);
}

/** Real-looking secret material. Fake fixtures like sk_test_x / sk_live_x are allowed. */
const SECRET_PATTERNS = [
  { name: "stripe_live_secret", re: /sk_live_[A-Za-z0-9]{16,}/ },
  { name: "stripe_test_secret", re: /sk_test_[A-Za-z0-9]{16,}/ },
  { name: "stripe_live_publishable", re: /pk_live_[A-Za-z0-9]{16,}/ },
  { name: "stripe_test_publishable", re: /pk_test_[A-Za-z0-9]{16,}/ },
  { name: "stripe_webhook_secret", re: /whsec_[A-Za-z0-9]{16,}/ },
  { name: "resend_api_key", re: /\bre_[A-Za-z0-9]{20,}/ },
];

const SKIP = new Set([
  "package-lock.json",
]);

test(".env.local is gitignored and untracked", () => {
  const ignore = execFileSync("git", ["check-ignore", "-v", ".env.local"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert.match(ignore, /\.env\*\.local/);
  const tracked = gitTrackedFiles();
  assert.equal(tracked.includes(".env.local"), false);
  assert.equal(tracked.includes(".env"), false);
});

test("tracked files do not contain real Stripe or Resend secrets", () => {
  const hits = [];
  for (const rel of gitTrackedFiles()) {
    if (SKIP.has(rel)) continue;
    if (rel.startsWith("node_modules/")) continue;
    const abs = path.join(ROOT, rel);
    let text;
    try {
      text = fs.readFileSync(abs, "utf8");
    } catch {
      continue;
    }
    for (const { name, re } of SECRET_PATTERNS) {
      if (re.test(text)) hits.push(`${rel} (${name})`);
    }
  }
  assert.deepEqual(hits, [], `Secret material in tracked files (paths only): ${hits.join(", ")}`);
});

test("NEXT_PUBLIC_ is never used for Stripe secret or Resend key names in source", () => {
  const offenders = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".next") continue;
        walk(full);
      } else if (/\.(ts|tsx|mjs|js)$/.test(entry.name)) {
        const src = fs.readFileSync(full, "utf8");
        if (/NEXT_PUBLIC_STRIPE_SECRET/.test(src) || /NEXT_PUBLIC_RESEND/.test(src)) {
          offenders.push(full);
        }
      }
    }
  };
  walk(path.resolve("src"));
  assert.deepEqual(offenders, []);
});
