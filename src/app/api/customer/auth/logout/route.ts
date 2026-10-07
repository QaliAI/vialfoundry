import { NextResponse } from 'next/server';
import { CUSTOMER_SESSION_COOKIE_NAME } from '@/lib/customer/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true, redirect: '/account' });
  response.cookies.delete(CUSTOMER_SESSION_COOKIE_NAME);
  return response;
}
