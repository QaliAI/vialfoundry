import { NextResponse } from "next/server";
import { getAdminAuthConfig, generateAdminSessionCookie } from "@/lib/admin/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const config = getAdminAuthConfig();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password required" }, { status: 400 });
    }

    const emailMatch = email.trim().toLowerCase() === config.adminEmail.toLowerCase();
    
    // Constant-time password check via fixed-length SHA-256 digests
    const pwdHash = crypto.createHash("sha256").update(String(password)).digest();
    const expectedHash = crypto.createHash("sha256").update(String(config.accessPassword)).digest();
    const passwordMatch = crypto.timingSafeEqual(pwdHash, expectedHash);

    if (!emailMatch || !passwordMatch) {
      return NextResponse.json({ success: false, error: "Invalid administrative credentials" }, { status: 401 });
    }

    const sessionCookie = generateAdminSessionCookie(config.adminEmail);
    const response = NextResponse.json({ success: true, user: { email: config.adminEmail } });
    
    response.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.options
    );

    return response;
  } catch (err: any) {
    console.error("[admin/login] error:", err);
    return NextResponse.json({ success: false, error: "Authentication system error" }, { status: 500 });
  }
}
