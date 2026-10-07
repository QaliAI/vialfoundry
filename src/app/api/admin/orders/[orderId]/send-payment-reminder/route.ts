import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin/auth';
import { sendPaymentReminder } from '@/lib/email/payment-recovery';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const orderId = params?.orderId;
  if (!orderId) {
    return NextResponse.json({ success: false, error: 'Missing order ID' }, { status: 400 });
  }

  const result = await sendPaymentReminder(orderId);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: `Payment reminder sent for order ${result.orderNumber}` });
}
