import { NextResponse } from "next/server";
import { generateAdminSessionCookie, getAdminAuthConfig } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashLoginToken } from "@/lib/admin/session-token.mjs";
import { isUsableAdmin } from "@/lib/admin/login-tokens.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const config = getAdminAuthConfig();
  if (!config) {
    return NextResponse.json(
      { success: false, error: "Admin access is not configured on this deployment." },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const raw = typeof body?.token === "string" ? body.token.trim() : "";
  if (!raw) {
    return NextResponse.json({ success: false, error: "Missing sign-in token." }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Admin access is unavailable." }, { status: 503 });
  }

  const tokenHash = hashLoginToken(raw);
  const { data: row } = await supabase
    .from("admin_login_tokens")
    .select("id, admin_user_id, expires_at, consumed_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!row || row.consumed_at) {
    return NextResponse.json({ success: false, error: "This sign-in link is invalid or has already been used." }, { status: 401 });
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ success: false, error: "This sign-in link has expired. Request a new one." }, { status: 401 });
  }

  const { data: user } = await supabase
    .from("admin_users")
    .select("id, email, name, role, active")
    .eq("id", row.admin_user_id)
    .maybeSingle();

  if (!isUsableAdmin(user) || !user) {
    return NextResponse.json({ success: false, error: "This sign-in link is invalid or has already been used." }, { status: 401 });
  }
  const admin = user;

  const { data: consumed } = await supabase
    .from("admin_login_tokens")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", row.id)
    .is("consumed_at", null)
    .select("id")
    .maybeSingle();

  if (!consumed) {
    return NextResponse.json({ success: false, error: "This sign-in link is invalid or has already been used." }, { status: 401 });
  }

  await supabase
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", admin.id);

  const sessionCookie = generateAdminSessionCookie(admin.email, config.sessionSecret);
  const response = NextResponse.json({ success: true, user: { email: admin.email, name: admin.name, role: admin.role } });
  response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);
  return response;
}
