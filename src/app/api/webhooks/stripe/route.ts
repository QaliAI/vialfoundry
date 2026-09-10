import { NextResponse } from 'next/server';
import {
  StripePaymentAdapter,
  isStripeEnabled,
  missingStripeEnv,
} from '../../../../lib/adapters/stripeAdapter';
import { updateAdminOrderStatus } from '../../../../lib/admin/orders';

/**
 * Stripe webhook receiver.
 *
 * Returns 404 while Stripe is not fully configured, so the endpoint does not
 * advertise itself before the merchant account exists. Nothing in the payload
 * is trusted until `constructEvent` has verified the signature.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Stripe payment outcomes -> internal order lifecycle statuses. */
const STATUS_MAP: Record<string, string> = {
  paid: 'paid',
  refunded: 'refunded',
};

export async function POST(req: Request) {
  if (!isStripeEnabled()) {
    console.warn(
      `[stripe-webhook] rejected: Stripe not enabled (missing: ${missingStripeEnv().join(', ') || 'PAYMENT_GATEWAY_TYPE'})`,
    );
    return new NextResponse('Not found', { status: 404 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  // The raw body is required for signature verification.
  const rawBody = await req.text();

  let result: { event: string; orderId: string; status: string };
  try {
    result = await new StripePaymentAdapter().handleWebhook(rawBody, signature);
  } catch (err) {
    console.error('[stripe-webhook] signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const nextStatus = STATUS_MAP[result.status];
  if (nextStatus && result.orderId) {
    try {
      await updateAdminOrderStatus({
        orderId: result.orderId,
        nextStatus,
        actor: 'stripe-webhook',
        notes: `Stripe event ${result.event}`,
      });
    } catch (err) {
      // Already-applied transitions are expected: Stripe retries deliveries and
      // may send both checkout.session.completed and payment_intent.succeeded.
      console.warn(`[stripe-webhook] no status change for ${result.orderId}:`, err);
    }
  }

  // Always acknowledge a verified event so Stripe stops retrying it.
  return NextResponse.json({ received: true, event: result.event });
}
