import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * Structural guard: every admin API route must check the admin session.
 * A new route added without auth fails this test rather than shipping open.
 */

const ADMIN_API = "src/app/api/admin";

/** Public by necessity: login IS the authentication entry point; logout only clears a cookie. */
const PUBLIC_BY_DESIGN = new Set(["login/route.ts", "logout/route.ts"]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.name === "route.ts") out.push(p);
  }
  return out;
}

const routes = walk(ADMIN_API);

test("admin API routes exist and are discoverable", () => {
  assert.ok(routes.length >= 8, `expected several admin routes, found ${routes.length}`);
});

test("every admin route verifies the admin session", () => {
  const offenders = [];
  for (const file of routes) {
    const rel = path.relative(ADMIN_API, file).split(path.sep).join("/");
    if (PUBLIC_BY_DESIGN.has(rel)) continue;
    const src = fs.readFileSync(file, "utf8");
    if (!src.includes("verifyAdminSession")) offenders.push(rel);
  }
  assert.deepEqual(offenders, [], `these admin routes do not check auth: ${offenders.join(", ")}`);
});

test("every admin route that mutates data checks auth before doing so", () => {
  for (const file of routes) {
    const rel = path.relative(ADMIN_API, file).split(path.sep).join("/");
    if (PUBLIC_BY_DESIGN.has(rel)) continue;
    const src = fs.readFileSync(file, "utf8");
    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      const idx = src.indexOf(`export async function ${method}`);
      if (idx === -1) continue;
      const body = src.slice(idx, idx + 900);
      assert.ok(
        body.includes("verifyAdminSession"),
        `${rel} ${method} must verify the admin session before mutating`,
      );
    }
  }
});

test("no server secret is referenced from a client component", () => {
  const SECRETS = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "SUPABASE_SERVICE_ROLE_KEY", "RESEND_API_KEY", "ADMIN_SESSION_SECRET", "ADMIN_ACCESS_PASSWORD"];
  const offenders = [];
  const walkAll = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { walkAll(p); continue; }
      if (!/\.(tsx|ts)$/.test(e.name)) continue;
      if (p.includes(`${path.sep}api${path.sep}`)) continue; // server routes may use them
      if (p.includes(`${path.sep}lib${path.sep}`)) continue; // server libs may use them
      const src = fs.readFileSync(p, "utf8");
      if (!src.includes("'use client'")) continue;
      for (const s of SECRETS) if (src.includes(s)) offenders.push(`${p} -> ${s}`);
    }
  };
  walkAll("src");
  assert.deepEqual(offenders, [], `secrets referenced in client components: ${offenders.join(", ")}`);
});

test("the Stripe webhook is signature-verified and gated", () => {
  const src = fs.readFileSync("src/app/api/webhooks/stripe/route.ts", "utf8");
  assert.ok(src.includes("constructEvent"), "webhook must verify the Stripe signature");
  assert.ok(src.includes("isStripeEnabled"), "webhook must be gated on Stripe configuration");
  assert.ok(src.includes("stripe_webhook_events"), "webhook must record event ids for idempotency");
});
