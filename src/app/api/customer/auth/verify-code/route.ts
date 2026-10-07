import { NextRequest, NextResponse } from 'next/server';
import {
  verifyCustomerLoginCode,
  CUSTOMER_SESSION_COOKIE_NAME,
  CUSTOMER_SESSION_MAX_AGE_SECONDS,
} from '@/lib/customer/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email || '').trim();
    const code = String(body?.code || '').trim();

    if (!email || !code) {
      return NextResponse.json({ success: false, error: 'Email and code are required' }, { status: 400 });
    }

    const res = await verifyCustomerLoginCode(email, code);
    if (!res.success || !res.token) {
      return NextResponse.json({ success: false, error: res.error || 'Invalid code' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, redirect: '/account' });
    response.cookies.set(CUSTOMER_SESSION_COOKIE_NAME, res.token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: CUSTOMER_SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
