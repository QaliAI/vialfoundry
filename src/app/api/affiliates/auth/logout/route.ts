import { NextResponse } from 'next/server';
import { AFFILIATE_SESSION_COOKIE_NAME } from '@/lib/affiliates/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true, redirect: '/affiliates/login' });
  response.cookies.delete(AFFILIATE_SESSION_COOKIE_NAME);
  return response;
}
