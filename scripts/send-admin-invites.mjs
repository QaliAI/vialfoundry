#!/usr/bin/env node
/**
 * Sends the initial Admin Console invitation to every active admin_users row.
 * Does not print email addresses.
 */
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function loadEnv() {
  const envPath = path.resolve(".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const idx = t.indexOf("=");
    const key = t.slice(0, idx).trim();
    const val = t.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendKey = process.env.RESEND_API_KEY;
if (!url || !key || !resendKey) {
  console.error("FAIL: missing supabase or resend configuration");
  process.exit(1);
}

function inviteHtml(name, loginUrl, supportEmail) {
  return `<p>Hello ${name},</p>
<p>You have been granted access to the Vial Foundry Admin Console.</p>
<p>Sign in with your email at <a href="${loginUrl}">${loginUrl}</a>. We will email you a single-use login link each time. There is no shared password.</p>
<p>Questions? ${supportEmail}</p>`;
}

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: users, error } = await sb
  .from("admin_users")
  .select("email, name, role, active")
  .eq("active", true);

if (error) {
  console.error("FAIL: could not read admin_users");
  process.exit(1);
}

const loginUrl = "https://www.vialfoundry.com/admin/login";
const support = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@vialfoundry.com";
const from = process.env.TRANSACTIONAL_EMAIL_FROM || "Vial Foundry <orders@vialfoundry.com>";
const resend = new Resend(resendKey);

let sent = 0;
for (const user of users || []) {
  const { error: sendErr } = await resend.emails.send({
    from,
    to: user.email,
    subject: "[Vial Foundry] You have been granted Admin Console access",
    html: inviteHtml(user.name, loginUrl, support),
    replyTo: support,
  });
  if (sendErr) {
    console.error("FAIL send", user.role);
  } else {
    sent += 1;
    console.log("sent", user.role);
  }
}
console.log("invites_sent", sent);
if (sent < 2) process.exitCode = 1;
