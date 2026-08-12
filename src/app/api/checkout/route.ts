import { NextResponse } from 'next/server';
import { getPaymentAdapter } from '../../../lib/adapters/paymentAdapter';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, amount, customerEmail, shippingAddress, items } = body;

    const adapter = getPaymentAdapter();
    const session = await adapter.createPaymentSession({
      orderId: orderId || `ORD-VF-${Date.now()}`,
      orderNumber: orderId || `ORD-VF-${Date.now()}`,
      amount: amount || 0,
      currency: 'USD',
      customerEmail: customerEmail || 'guest@vialfoundry.com',
      shippingAddress: shippingAddress || {},
      items: items || []
    });

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
