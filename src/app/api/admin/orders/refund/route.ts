import { NextResponse } from 'next/server';
import { verifyAdminSession, getAdminAuthConfig } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { recordOrderEvent } from '@/lib/admin/order-events';
import { isStripeEnabled } from '@/lib/adapters/stripe-gating.mjs';

/**
 * Issues a refund against a Stripe-paid order.
 *
 * Deliberate design choices:
 *  - Admin session required; the Stripe secret never leaves the server.
 *  - `confirm: true` must be sent explicitly, so a stray click cannot refund.
 *  - We do NOT write the refunded state here. Stripe's `charge.refunded`
 *    webhook is the single authority for that, exactly as payment is. This
 *    route only asks Stripe to refund and records that an admin asked.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const config = getAdminAuthConfig();
  const actor = config?.adminEmail || 'admin';

  let body: { orderId?: string; amountCents?: number; confirm?: boolean; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.orderId) {
    return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
  }
  if (body.confirm !== true) {
    return NextResponse.json(
      { success: false, error: 'Refunds require explicit confirmation (confirm: true).' },
      { status: 400 },
    );
  }
  if (!isStripeEnabled()) {
    return NextResponse.json(
      { success: false, error: 'Stripe is not configured, so no card refund can be issued. Record the refund manually.' },
      { status: 409 },
    );
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }

  const { data: order } = await supabase
    .from('manual_orders')
    .select('id, order_number, total_amount, amount_refunded, payment_status, stripe_payment_intent_id')
    .eq('id', body.orderId)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  }
  if (!order.stripe_payment_intent_id) {
    return NextResponse.json(
      { success: false, error: 'This order has no Stripe payment to refund.' },
      { status: 409 },
    );
  }
  if (order.payment_status !== 'paid' && order.payment_status !== 'partially_refunded') {
    return NextResponse.json(
      { success: false, error: `Cannot refund an order with payment status "${order.payment_status}".` },
      { status: 409 },
    );
  }

  const alreadyRefunded = order.amount_refunded || 0;
  const refundable = (order.total_amount || 0) - alreadyRefunded;
  const amount = body.amountCents ?? refundable;

  if (!Number.isInteger(amount) || amount <= 0 || amount > refundable) {
    return NextResponse.json(
      { success: false, error: `Refund amount must be between 1 and ${refundable} cents.` },
      { status: 400 },
    );
  }

  try {
    const { StripePaymentAdapter } = await import('@/lib/adapters/stripeAdapter');
    const refund = await new StripePaymentAdapter().refundPaymentIntent(
      order.stripe_payment_intent_id,
      amount,
    );

    await recordOrderEvent({
      orderId: order.id,
      type: 'refund_initiated',
      actor,
      message: `Refund of ${(amount / 100).toFixed(2)} requested${body.reason ? ` — ${body.reason}` : ''}`,
      metadata: { refundId: refund.id, amount, reason: body.reason || null },
    });

    // State is applied by the charge.refunded webhook, not here.
    return NextResponse.json({
      success: true,
      refundId: refund.id,
      status: refund.status,
      amount,
      note: 'Refund submitted to Stripe. Order state updates when Stripe confirms it.',
    });
  } catch (err: any) {
    console.error('[admin/refund] failed:', err?.message || err);
    await recordOrderEvent({
      orderId: order.id,
      type: 'refund_initiated',
      actor,
      message: `Refund FAILED: ${err?.message || 'unknown error'}`,
      metadata: { amount, failed: true },
    });
    return NextResponse.json(
      { success: false, error: err?.message || 'Refund failed at the payment provider.' },
      { status: 502 },
    );
  }
}
