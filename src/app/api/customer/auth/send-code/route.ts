import { NextRequest, NextResponse } from 'next/server';
import { sendCustomerLoginCode } from '@/lib/customer/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email || '').trim();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const res = await sendCustomerLoginCode(email);
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email.',
      codeForTest: res.codeForTest,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
