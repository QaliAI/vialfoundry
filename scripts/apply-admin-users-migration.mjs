#!/usr/bin/env node
import fs from "fs";
import path from "path";
import pg from "pg";

const envPath = path.resolve(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("FAIL: .env.local missing");
  process.exit(1);
}
const env = Object.fromEntries(
  fs.readFileSync(envPath, "utf8").split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    }),
);
const connStr = env.SUPABASE_DIRECT_CONNECTION_STRING;
if (!connStr) {
  console.error("FAIL: SUPABASE_DIRECT_CONNECTION_STRING not set");
  process.exit(1);
}
const sql = fs.readFileSync(path.resolve("supabase/migrations/08_admin_users_inventory.sql"), "utf8");
const client = new pg.Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
try {
  await client.connect();
  await client.query(sql);
  const { rows } = await client.query("select email, name, role, active from public.admin_users order by email");
  console.log("OK: applied 08_admin_users_inventory.sql");
  console.log("admin_users", rows.length);
  for (const r of rows) console.log(`- ${r.role} active=${r.active}`);
} catch (err) {
  console.error("FAIL:", err.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
