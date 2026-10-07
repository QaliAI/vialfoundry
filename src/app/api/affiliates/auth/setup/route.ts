import { NextRequest, NextResponse } from 'next/server';
import {
  setupAffiliatePassword,
  createAffiliateSessionCookie,
  AFFILIATE_SESSION_COOKIE_NAME,
  AFFILIATE_SESSION_MAX_AGE_SECONDS,
} from '@/lib/affiliates/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = String(body?.token || '').trim();
    const password = String(body?.password || '').trim();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token and password are required.' },
        { status: 400 }
      );
    }

    const result = await setupAffiliatePassword(token, password);
    if (!result.success || !result.affiliate) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to complete setup.' },
        { status: 400 }
      );
    }

    const sessionToken = createAffiliateSessionCookie(result.affiliate);
    const response = NextResponse.json({
      success: true,
      redirect: '/affiliates/portal',
    });

    response.cookies.set(AFFILIATE_SESSION_COOKIE_NAME, sessionToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: AFFILIATE_SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (err: any) {
    console.error('[api/affiliates/auth/setup] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
