import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateAffiliate,
  createAffiliateSessionCookie,
  AFFILIATE_SESSION_COOKIE_NAME,
  AFFILIATE_SESSION_MAX_AGE_SECONDS,
} from '@/lib/affiliates/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email || '').trim();
    const password = String(body?.password || '').trim();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const authResult = await authenticateAffiliate(email, password);
    if (!authResult.success || !authResult.affiliate) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Invalid credentials.' },
        { status: 401 }
      );
    }

    const token = createAffiliateSessionCookie(authResult.affiliate);
    const response = NextResponse.json({
      success: true,
      redirect: '/affiliates/portal',
    });

    response.cookies.set(AFFILIATE_SESSION_COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: AFFILIATE_SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (err: any) {
    console.error('[api/affiliates/auth/login] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
