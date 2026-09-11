import { NextResponse } from "next/server";
import { getAdminAuthConfig } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateLoginToken, hashLoginToken } from "@/lib/admin/session-token.mjs";
import { GENERIC_LOGIN_ACK, LOGIN_TOKEN_TTL_MS, isUsableAdmin, normalizeAdminEmail } from "@/lib/admin/login-tokens.mjs";
import { sendEmailSafely } from "@/lib/email/resend";
import { renderAdminLoginEmail } from "@/lib/email/templates/admin-login";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://www.vialfoundry.com").replace(/\/$/, "");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = normalizeAdminEmail(body?.email);
    const config = getAdminAuthConfig();

    if (!config) {
      return NextResponse.json(
        { success: false, error: "Admin access is not configured on this deployment." },
        { status: 503 },
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Enter a valid email address." }, { status: 400 });
    }

    // Always acknowledge the same way so unknown addresses cannot be enumerated.
    const ack = { success: true, message: GENERIC_LOGIN_ACK };

    const supabase = createAdminClient();
    if (!supabase) return NextResponse.json(ack);

    const { data: user } = await supabase
      .from("admin_users")
      .select("id, email, name, role, active")
      .eq("email", email)
      .maybeSingle();

    if (!isUsableAdmin(user) || !user) return NextResponse.json(ack);
    const admin = user;

    const raw = generateLoginToken();
    const tokenHash = hashLoginToken(raw);
    const expiresAt = new Date(Date.now() + LOGIN_TOKEN_TTL_MS).toISOString();

    const { error } = await supabase.from("admin_login_tokens").insert({
      admin_user_id: admin.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });
    if (error) {
      console.error("[admin/login] token persist failed");
      return NextResponse.json(ack);
    }

    const loginUrl = `${siteUrl()}/admin/login?token=${encodeURIComponent(raw)}`;
    const mail = renderAdminLoginEmail({
      name: admin.name,
      loginUrl,
      expiresMinutes: Math.round(LOGIN_TOKEN_TTL_MS / 60000),
    });
    const sent = await sendEmailSafely({
      to: admin.email,
      subject: "[Vial Foundry] Admin sign-in link",
      html: mail.html,
    });
    if (!sent.success) {
      console.error("[admin/login] login email failed to send");
    }

    return NextResponse.json(ack);
  } catch (err: any) {
    console.error("[admin/login] error");
    return NextResponse.json({ success: false, error: "Authentication system error" }, { status: 500 });
  }
}
