/**
 * Permanent vs transient Stripe webhook failure classification, plus
 * exactly-once owner alerts for permanent failures (N1/D3).
 *
 * Background: the settlement RPC raises for business-logic rejections
 * (amount/identity mismatch, invalid refund, conflicting references, ...).
 * applySettlement() wraps those into `settlement_database_failure` with the
 * underlying reason attached as the error cause. Retrying such an event can
 * never succeed, yet the route used to answer 503 to every failure, so
 * Stripe retried permanent failures for days with no owner signal.
 *
 * Rule: only the known-permanent business-logic rejections are acknowledged
 * (200) after a single owner alert. EVERYTHING else stays retryable (503):
 * an unrecognized failure must never be acknowledged, because the event may
 * never have been processed at all (e.g. a network error between the app and
 * the database). Retry backlogs stay visible on the health endpoint's
 * webhookProcessing field, so transient-by-default cannot go silent.
 *
 * Alert idempotency reuses the stripe_webhook_events receipt row: once an
 * event is marked permanent_failure_alerted, redeliveries are acknowledged
 * as duplicates without re-sending.
 */

/**
 * Business-logic rejections raised by the settlement RPC (see migration
 * 20261016231001_stripe_atomic_settlement.sql). These can never succeed on
 * retry: alert the owner exactly once per event id, then answer 200 so
 * Stripe stops retrying.
 */
const PERMANENT_REASONS = new Set([
  'stripe_amount_or_currency_mismatch',
  'stripe_order_identity_mismatch',
  'invalid_refund',
  'conflicting_order_references',
  'order_items_incomplete',
  'invalid_stripe_event',
  'partial_legacy_inventory_review',
  'duplicate_commission_ledger_review',
  'inventory_unavailable',
  'unknown_unattributed_event',
]);

const REASON_DESCRIPTIONS = {
  stripe_amount_or_currency_mismatch:
    'The payment amount or currency does not match the order total.',
  stripe_order_identity_mismatch:
    'The Stripe object references a different order, session, or payment intent than our records.',
  invalid_refund: 'The refund amount is invalid for this order.',
  conflicting_order_references: 'The event matched more than one order.',
  order_items_incomplete: 'The order has no valid line items.',
  invalid_stripe_event: 'The event payload failed validation.',
  partial_legacy_inventory_review:
    'A legacy order has partial inventory effects that need manual review.',
  duplicate_commission_ledger_review:
    'Duplicate affiliate ledger rows need manual review.',
  inventory_unavailable: 'A product referenced by the order is missing.',
  unknown_unattributed_event:
    'The event could not be matched to any order.',
};

const PERMANENT_OUTCOME = 'permanent_failure_alerted';

/**
 * Split applySettlement()'s generic throw back into the underlying RPC
 * reason. Returns { reason, transient }.
 *
 * Only the known-permanent business-logic rejections are permanent.
 * Anything unrecognized — a network error, a wrapped infra failure, a
 * future RPC reason — stays transient so an event that may never have been
 * processed is never acknowledged with 200.
 */
export function classifySettlementFailure(error) {
  let raw = '';
  if (error instanceof Error) {
    raw = typeof error.cause === 'string' && error.cause ? error.cause : error.message;
  } else {
    raw = String(error ?? '');
  }
  const reason = (raw || 'processing_failure').split(':')[0].trim() || 'processing_failure';
  return { reason, transient: !PERMANENT_REASONS.has(reason) };
}

function reasonDescription(reason) {
  return REASON_DESCRIPTIONS[reason] || 'No further detail available.';
}

function alertSubject(event, reason) {
  return `[Vial Foundry] Stripe webhook needs review: ${reason} (${event.id})`;
}

function alertText(event, reason, orderId) {
  const when = new Date().toISOString();
  return [
    'A Stripe webhook event failed permanently and will not be retried.',
    '',
    `Event id: ${event.id}`,
    `Event type: ${event.type}`,
    `Reason: ${reason}`,
    `Detail: ${reasonDescription(reason)}`,
    `Order id: ${orderId || 'unknown'}`,
    `Time: ${when}`,
    `Stripe dashboard: https://dashboard.stripe.com/events/${event.id}`,
    '',
    'No money moved for this event. Review the reason above; replay the event',
    'from the Stripe dashboard once the underlying data is fixed.',
  ].join('\n');
}

function alertHtml(event, reason, orderId) {
  const esc = (s) =>
    String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const row = (k, v) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#64748b;">${k}</td><td style="padding:4px 0;"><code>${esc(v)}</code></td></tr>`;
  return `<div style="font-family:sans-serif;max-width:640px;">
<p>A Stripe webhook event failed <strong>permanently</strong> and will not be retried.</p>
<table>${row('Event id', event.id)}${row('Event type', event.type)}${row('Reason', reason)}${row('Detail', reasonDescription(reason))}${row('Order id', orderId || 'unknown')}${row('Time', new Date().toISOString())}</table>
<p><a href="https://dashboard.stripe.com/events/${esc(event.id)}">Open in the Stripe dashboard</a></p>
<p style="color:#64748b;">No money moved for this event. Review the reason above; replay the event from the Stripe dashboard once the underlying data is fixed.</p>
</div>`;
}

/**
 * Send the owner alert for a permanent settlement failure, exactly once per
 * event id. Returns { alerted, duplicate }.
 *
 * - If a receipt already marks this event permanent_failure_alerted, no email
 *   is sent and duplicate:true is returned.
 * - If the email cannot be sent (no recipient configured or provider
 *   failure), nothing is marked, so a redelivery retries the alert.
 * - On success the receipt row is upserted with retry:false, so the
 *   settlement RPC treats redeliveries as acknowledged duplicates.
 *
 * `send` is injected (sendEmailSafely in production) for testability.
 * Never logs or emails secret values.
 */
export async function alertPermanentSettlementFailure({ database, event, reason, orderId, send }) {
  if (!database) return { alerted: false, duplicate: false };
  const { data: existing } = await database
    .from('stripe_webhook_events')
    .select('result')
    .eq('id', event.id)
    .maybeSingle();
  if (existing && existing.result && existing.result.outcome === PERMANENT_OUTCOME) {
    return { alerted: false, duplicate: true };
  }

  const to = process.env.NOTIFICATION_EMAIL_TO || process.env.ADMIN_NOTIFICATION_EMAIL;
  let sent = false;
  if (!to) {
    console.error('[stripe-webhook] permanent failure: no notification email configured', {
      eventId: event.id,
      reason,
    });
  } else {
    const result = await send({
      to,
      subject: alertSubject(event, reason),
      html: alertHtml(event, reason, orderId),
      text: alertText(event, reason, orderId),
      idempotencyKey: `stripe-permanent-failure/${event.id}`,
    });
    sent = Boolean(result && result.success);
    if (!sent) {
      console.error('[stripe-webhook] permanent failure alert not delivered', {
        eventId: event.id,
        reason,
      });
    }
  }

  if (sent) {
    // Mark the receipt so redeliveries are acknowledged as duplicates instead
    // of re-alerting. This overwrites the processing_failed/retry:true marker
    // that applySettlement wrote on the raise path, so the settlement RPC
    // treats redeliveries as acknowledged duplicates (retry:false).
    const receipt = {
      outcome: PERMANENT_OUTCOME,
      reason,
      orderId: orderId || null,
      retry: false,
      alerted_at: new Date().toISOString(),
    };
    const row = {
      id: event.id,
      event_type: event.type,
      manual_order_id: orderId || null,
      result: receipt,
    };
    if (existing) {
      await database.from('stripe_webhook_events').update(row).eq('id', event.id);
    } else {
      const inserted = await database.from('stripe_webhook_events').insert(row);
      if (inserted.error) {
        // Lost a race with a concurrent delivery; re-check before reporting.
        const { data: raced } = await database
          .from('stripe_webhook_events')
          .select('result')
          .eq('id', event.id)
          .maybeSingle();
        if (raced && raced.result && raced.result.outcome === PERMANENT_OUTCOME) {
          return { alerted: sent, duplicate: true };
        }
      }
    }
  }
  return { alerted: sent, duplicate: false };
}
