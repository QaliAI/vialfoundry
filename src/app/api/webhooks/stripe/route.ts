import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  StripePaymentAdapter,
  isStripeEnabled,
  missingStripeEnv,
} from '../../../../lib/adapters/stripeAdapter';
import { createAdminClient } from '../../../../lib/supabase/admin';
import { recordOrderEvent } from '../../../../lib/admin/order-events';
import { sendEmailSafely } from '../../../../lib/email/resend';
import { renderOrderConfirmationEmail } from '../../../../lib/email/templates/order';
import { renderInternalOrderNotificationEmail } from '../../../../lib/email/templates/internal-order';
import { getBrandConfig } from '../../../../config/brand';

/**
 * Stripe webhook — the ONLY authoritative confirmation that money moved.
 *
 * The success URL is never trusted: a customer can craft it, and Stripe may
 * redirect before the payment settles. Order state changes only from a
 * signature-verified event delivered here.
 *
 * Idempotency: Stripe retries and can deliver the same event more than once,
 * and `checkout.session.completed` plus `payment_intent.succeeded` both arrive
 * for a single payment. Every event id is recorded in `stripe_webhook_events`
 * before we act, so a replay is a no-op and email is never sent twice.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HANDLED = new Set([
  'checkout.session.completed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'charge.refunded',
]);

/** Records the event id. Returns false when we have already processed it. */
async function claimEvent(
  supabase: ReturnType<typeof createAdminClient>,
  event: Stripe.Event,
  orderId: string | null,
): Promise<boolean> {
  if (!supabase) return true; // no DB: process, but nothing is persisted anyway
  const { error } = await supabase.from('stripe_webhook_events').insert({
    id: event.id,
    event_type: event.type,
    manual_order_id: orderId,
  });
  if (error) {
    // A unique-violation means this event id is already recorded.
    if (error.code === '23505') return false;
    console.error('[stripe-webhook] could not record event id:', error.message);
  }
  return true;
}

async function findOrder(
  supabase: NonNullable<ReturnType<typeof createAdminClient>>,
  { orderId, sessionId, paymentIntentId }:
    { orderId?: string | null; sessionId?: string | null; paymentIntentId?: string | null },
) {
  const cols =
    'id, order_number, status, payment_status, total_amount, amount_refunded, currency, customer_email, customer_name, customer_phone, shipping_address_snapshot, promo_code, affiliate_code, affiliate_id, subtotal_amount, shipping_amount, discount_amount, is_test';

  for (const [column, value] of [
    ['id', orderId],
    ['stripe_checkout_session_id', sessionId],
    ['stripe_payment_intent_id', paymentIntentId],
  ] as const) {
    if (!value) continue;
    const { data } = await supabase.from('manual_orders').select(cols).eq(column, value).maybeSingle();
    if (data) return data as any;
  }
  return null;
}

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

  const rawBody = await req.text();

  const adapter = new StripePaymentAdapter();
  let event: Stripe.Event;
  try {
    event = adapter.constructEvent(rawBody, signature);
  } catch (err: any) {
    console.error('[stripe-webhook] signature verification failed:', err?.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (!HANDLED.has(event.type)) {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    console.error('[stripe-webhook] no database client; cannot apply event', event.id);
    return NextResponse.json({ received: true, applied: false });
  }

  // Resolve which order this event belongs to.
  let orderId: string | null = null;
  let sessionId: string | null = null;
  let paymentIntentId: string | null = null;
  let stripeCustomerId: string | null = null;

  switch (event.type) {
    case 'checkout.session.completed': {
      const s = event.data.object as Stripe.Checkout.Session;
      orderId = s.client_reference_id || (s.metadata?.orderId ?? null);
      sessionId = s.id;
      paymentIntentId = typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id ?? null;
      stripeCustomerId = typeof s.customer === 'string' ? s.customer : s.customer?.id ?? null;
      break;
    }
    case 'payment_intent.succeeded':
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent;
      orderId = pi.metadata?.orderId ?? null;
      paymentIntentId = pi.id;
      break;
    }
    case 'charge.refunded': {
      const ch = event.data.object as Stripe.Charge;
      orderId = ch.metadata?.orderId ?? null;
      paymentIntentId = typeof ch.payment_intent === 'string' ? ch.payment_intent : ch.payment_intent?.id ?? null;
      break;
    }
  }

  const order = await findOrder(supabase, { orderId, sessionId, paymentIntentId });
  if (!order) {
    // Acknowledge so Stripe stops retrying an event we can never match.
    console.warn(`[stripe-webhook] no matching order for ${event.type} (${event.id})`);
    return NextResponse.json({ received: true, matched: false });
  }

  const fresh = await claimEvent(supabase, event, order.id);
  if (!fresh) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const brand = getBrandConfig();
  const now = new Date().toISOString();

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
      // Confirm the money actually settled before marking paid.
      let amountPaid: number | null = null;
      if (event.type === 'checkout.session.completed') {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.payment_status !== 'paid') {
          return NextResponse.json({ received: true, applied: false, reason: s.payment_status });
        }
        amountPaid = s.amount_total ?? null;
      } else {
        const pi = event.data.object as Stripe.PaymentIntent;
        amountPaid = pi.amount_received ?? null;
      }

      // Amount integrity, checked again at settlement.
      if (amountPaid !== null && amountPaid !== order.total_amount) {
        console.error(
          `[stripe-webhook] AMOUNT MISMATCH on ${order.order_number}: paid ${amountPaid} vs order ${order.total_amount}`,
        );
        await recordOrderEvent({
          orderId: order.id,
          type: 'payment_failed',
          actor: 'stripe-webhook',
          message: `Amount mismatch: Stripe captured ${amountPaid} but the order total is ${order.total_amount}. Held for review.`,
          metadata: { eventId: event.id, amountPaid, orderTotal: order.total_amount },
        });
        return NextResponse.json({ received: true, applied: false, reason: 'amount_mismatch' });
      }

      if (order.payment_status === 'paid') {
        return NextResponse.json({ received: true, alreadyPaid: true });
      }

      await supabase
        .from('manual_orders')
        .update({
          payment_status: 'paid',
          status: 'paid',
          paid_at: now,
          updated_at: now,
          ...(sessionId ? { stripe_checkout_session_id: sessionId } : {}),
          ...(paymentIntentId ? { stripe_payment_intent_id: paymentIntentId } : {}),
          ...(stripeCustomerId ? { stripe_customer_id: stripeCustomerId } : {}),
        })
        .eq('id', order.id);

      // Commission becomes earned only once payment has actually settled.
      if (order.affiliate_id) {
        await supabase
          .from('manual_orders')
          .update({ affiliate_status: 'pending_payout' })
          .eq('id', order.id);
        await supabase
          .from('referral_revenue')
          .update({ status: 'pending_payout' })
          .eq('manual_order_id', order.id);
      }

      await recordOrderEvent({
        orderId: order.id,
        type: 'payment_succeeded',
        actor: 'stripe-webhook',
        message: `Payment received: ${((amountPaid ?? order.total_amount) / 100).toFixed(2)} ${order.currency || brand.currency}`,
        metadata: { eventId: event.id, paymentIntentId, sessionId },
      });

      await sendPaidEmails(supabase, order, brand);
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object as Stripe.PaymentIntent;
      await supabase
        .from('manual_orders')
        .update({ payment_status: 'failed', updated_at: now })
        .eq('id', order.id);
      await recordOrderEvent({
        orderId: order.id,
        type: 'payment_failed',
        actor: 'stripe-webhook',
        message: pi.last_payment_error?.message || 'Card payment failed',
        metadata: { eventId: event.id, paymentIntentId: pi.id },
      });
    }

    if (event.type === 'charge.refunded') {
      const ch = event.data.object as Stripe.Charge;
      const refunded = ch.amount_refunded ?? 0;
      const fullyRefunded = refunded >= (order.total_amount ?? 0);

      await supabase
        .from('manual_orders')
        .update({
          amount_refunded: refunded,
          payment_status: fullyRefunded ? 'refunded' : 'partially_refunded',
          ...(fullyRefunded ? { status: 'refunded', refunded_at: now } : {}),
          updated_at: now,
        })
        .eq('id', order.id);

      // A refunded order must not keep paying commission.
      if (order.affiliate_id && fullyRefunded) {
        await supabase.from('manual_orders').update({ affiliate_status: 'reversed' }).eq('id', order.id);
        await supabase.from('referral_revenue').update({ status: 'reversed' }).eq('manual_order_id', order.id);
      }

      await recordOrderEvent({
        orderId: order.id,
        type: 'refund_completed',
        actor: 'stripe-webhook',
        message: `${fullyRefunded ? 'Full' : 'Partial'} refund of ${(refunded / 100).toFixed(2)} processed`,
        metadata: { eventId: event.id, amountRefunded: refunded, fullyRefunded },
      });
    }
  } catch (err: any) {
    console.error(`[stripe-webhook] error applying ${event.type}:`, err?.message || err);
    // 500 asks Stripe to retry; the event id claim is rolled forward, so we
    // remove it to allow a genuine retry to re-apply.
    await supabase.from('stripe_webhook_events').delete().eq('id', event.id);
    return NextResponse.json({ error: 'processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true, event: event.type, order: order.order_number });
}

/** Customer receipt + operations notification, sent once, after payment. */
async function sendPaidEmails(
  supabase: NonNullable<ReturnType<typeof createAdminClient>>,
  order: any,
  brand: ReturnType<typeof getBrandConfig>,
) {
  const { data: lines } = await supabase
    .from('manual_order_items')
    .select('product_name, sku, quantity, unit_price_amount, line_total_amount')
    .eq('manual_order_id', order.id);

  const items = (lines || []).map((l: any) => ({
    name: l.product_name,
    sku: l.sku,
    quantity: l.quantity,
    unitPriceCents: l.unit_price_amount || 0,
    lineTotalCents: l.line_total_amount || 0,
  }));

  const shared = {
    orderNumber: order.order_number,
    customerName: order.customer_name,
    items,
    subtotalCents: (order.subtotal_amount || 0) + (order.discount_amount || 0),
    discountCents: order.discount_amount || 0,
    shippingCents: order.shipping_amount || 0,
    totalCents: order.total_amount || 0,
    shippingAddress: (order.shipping_address_snapshot || {}) as Record<string, string>,
  };

  const customer = renderOrderConfirmationEmail({ ...shared, paymentMethod: 'card' });
  const sent = await sendEmailSafely({
    to: order.customer_email,
    subject: `[Vial Foundry] Payment received — order ${order.order_number}`,
    html: customer.html,
  });
  await recordOrderEvent({
    orderId: order.id,
    type: sent.success ? 'email_sent' : 'email_failed',
    actor: 'stripe-webhook',
    message: sent.success
      ? `Payment confirmation sent to ${order.customer_email}`
      : `Payment confirmation FAILED to ${order.customer_email}: ${sent.error}`,
  });

  const admins = brand.orderNotificationEmails;
  if (admins.length > 0) {
    const internal = renderInternalOrderNotificationEmail({
      ...shared,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      paymentMethod: 'card (Stripe)',
      paymentStatus: 'paid',
      promoCode: order.promo_code,
      affiliateCode: order.affiliate_code,
      isTest: Boolean(order.is_test),
    });
    await sendEmailSafely({
      to: admins,
      subject: `${order.is_test ? '[TEST] ' : ''}[PAID] ${order.order_number} — ${order.customer_name} ($${((order.total_amount || 0) / 100).toFixed(2)})`,
      html: internal.html,
    });
  }
}
