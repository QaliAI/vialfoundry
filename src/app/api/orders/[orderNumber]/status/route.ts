import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../../lib/supabase/admin';

/**
 * Read-only order status for the confirmation page.
 *
 * The success URL cannot be trusted to prove payment, so the page asks the
 * server what actually happened. The server reports the state the *webhook*
 * wrote — it never infers payment from a query parameter.
 *
 * Deliberately narrow: it returns only what the buyer already knows, and only
 * when the order number is paired with the matching email OR the Stripe
 * session id, so order numbers cannot be enumerated.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { orderNumber: string } },
) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get('session_id');
  const email = url.searchParams.get('email');

  if (!sessionId && !email) {
    return NextResponse.json({ error: 'A session id or email is required.' }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }

  let query = supabase
    .from('manual_orders')
    .select(
      'order_number, status, payment_status, payment_provider, total_amount, subtotal_amount, shipping_amount, discount_amount, currency, customer_name, shipping_address_snapshot, paid_at, created_at, tracking_number, carrier',
    )
    .eq('order_number', params.orderNumber);

  query = sessionId
    ? query.eq('stripe_checkout_session_id', sessionId)
    : query.ilike('customer_email', String(email));

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('[order-status] lookup failed:', error.message);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const { data: items } = await supabase
    .from('manual_order_items')
    .select('product_name, quantity, unit_price_amount, line_total_amount')
    .eq('manual_order_id', (await supabase
      .from('manual_orders')
      .select('id')
      .eq('order_number', params.orderNumber)
      .maybeSingle()).data?.id ?? '');

  return NextResponse.json({
    orderNumber: data.order_number,
    status: data.status,
    paymentStatus: data.payment_status,
    paymentProvider: data.payment_provider,
    paid: data.payment_status === 'paid',
    totalCents: data.total_amount,
    subtotalCents: data.subtotal_amount,
    shippingCents: data.shipping_amount,
    discountCents: data.discount_amount,
    currency: data.currency,
    customerName: data.customer_name,
    shippingAddress: data.shipping_address_snapshot,
    paidAt: data.paid_at,
    trackingNumber: data.tracking_number,
    carrier: data.carrier,
    items: items || [],
  });
}
