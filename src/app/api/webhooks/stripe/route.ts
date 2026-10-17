import { NextResponse } from 'next/server';
import { StripePaymentAdapter, isStripeEnabled } from '../../../../lib/adapters/stripeAdapter';
import { isHandledEvent } from '../../../../lib/adapters/stripe-webhook-rules.mjs';
import { applySettlement, deliverStripeMessages } from '../../../../lib/adapters/stripe-settlement.mjs';
import {
  classifySettlementFailure,
  alertPermanentSettlementFailure,
} from '../../../../lib/adapters/stripe-failure-alerts.mjs';
import { createAdminClient } from '../../../../lib/supabase/admin';
import { sendEmailSafely } from '../../../../lib/email/resend';
import { renderStripeMessage } from '../../../../lib/email/stripe-messages';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!isStripeEnabled()) return NextResponse.json({ error: 'Payment processing unavailable' }, { status: 503 });
  const signature = req.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  const rawBody = await req.text();
  let event;
  try {
    event = new StripePaymentAdapter().constructEvent(rawBody, signature);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  if (!isHandledEvent(event.type)) return NextResponse.json({ received: true, ignored: true });

  let database = null;
  try {
    database = createAdminClient();
    // Payment, inventory, commission, promotion usage, timeline, outbox and
    // receipt share one transaction. Any database error aborts all its writes.
    const result = await applySettlement(database, event);
    if (result.review) {
      console.error('[stripe-webhook] reconciliation required', { eventId: event.id, reason: result.outcome });
      return NextResponse.json({ error: 'Reconciliation required' }, { status: 503 });
    }
    if (result.outcome === 'unknown_unattributed_event') {
      // D3: money may have moved with no order attached. Alert the owner
      // exactly once, then acknowledge so Stripe stops retrying an event
      // that can never be attributed.
      const alert = await alertPermanentSettlementFailure({
        database,
        event,
        reason: 'unknown_unattributed_event',
        orderId: null,
        send: sendEmailSafely,
      });
      if (!alert.alerted && !alert.duplicate) {
        return NextResponse.json({ error: 'Owner alert failed; retry delivery' }, { status: 503 });
      }
      return NextResponse.json({ received: true, outcome: 'permanent_failure_alerted', duplicate: alert.duplicate });
    }
    // Completed event retries still drain messages. Email errors cannot roll
    // back a paid order or make a replay repeat financial mutations.
    if (result.orderId && database) {
      await deliverStripeMessages(database, result.orderId, renderStripeMessage, sendEmailSafely);
    }
    return NextResponse.json({ received: true, outcome: result.outcome, duplicate: Boolean(result.duplicate) });
  } catch (error) {
    const { reason, transient } = classifySettlementFailure(error);
    if (!transient && database) {
      // N1: permanent business-logic rejections can never succeed on retry.
      // Alert once, then acknowledge so Stripe stops the retry storm.
      const stripeObject = event?.data?.object as { metadata?: { orderId?: string } } | undefined;
      const orderId = stripeObject?.metadata?.orderId || null;
      const alert = await alertPermanentSettlementFailure({
        database,
        event,
        reason,
        orderId,
        send: sendEmailSafely,
      });
      if (alert.alerted || alert.duplicate) {
        return NextResponse.json({ received: true, outcome: 'permanent_failure_alerted', duplicate: alert.duplicate });
      }
      console.error('[stripe-webhook] permanent failure alert failed', { eventId: event.id, reason });
      return NextResponse.json({ error: 'Owner alert failed; retry delivery' }, { status: 503 });
    }
    console.error('[stripe-webhook] processing failed', {
      eventId: event.id, reason: error instanceof Error ? error.message : 'processing_failure',
    });
    return NextResponse.json({ error: 'Processing failed; retry delivery' }, { status: 503 });
  }
}
