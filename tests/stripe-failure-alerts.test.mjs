import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import { isolatedCommerce } from './fixtures/isolated-commerce.mjs';
import { loadTSModule } from './fixtures/load-ts-module.mjs';
import { applySettlement } from '../src/lib/adapters/stripe-settlement.mjs';
import {
  classifySettlementFailure,
  alertPermanentSettlementFailure,
} from '../src/lib/adapters/stripe-failure-alerts.mjs';

const orderId = '00000000-0000-4000-8000-000000000001';
const affiliateId = '00000000-0000-4000-8000-000000000002';
const webhookSecret = '<redacted>';

let db;
let client;
const q = (sql, params = []) => db.query(sql, params);

before(async () => {
  ({ db, client } = await isolatedCommerce());
});

after(async () => {
  if (db) await db.close();
});

beforeEach(async () => {
  await q('TRUNCATE stripe_email_outbox,stripe_webhook_events,inventory_transactions,order_events,referral_revenue,manual_order_items,manual_orders,products,affiliates CASCADE');
  await q('INSERT INTO affiliates(id) VALUES($1)', [affiliateId]);
  await q("INSERT INTO products VALUES('sku-a',10,now()),('sku-b',10,now())");
  await q(`INSERT INTO manual_orders(id,order_number,customer_email,customer_name,checkout_mode,payment_provider,stripe_livemode,
    stripe_checkout_session_id,total_amount,subtotal_amount,discount_amount,shipping_amount,promo_code,affiliate_id,affiliate_commission_amount,affiliate_commission_rate_bps,is_test)
    VALUES($1,'VF-TEST','qa@example.invalid','QA','stripe','stripe',false,'cs_test_a',1000,900,100,100,'WELCOME10',$2,90,1000,true)`, [orderId, affiliateId]);
  await q("INSERT INTO manual_order_items(manual_order_id,product_id,product_name,quantity,unit_price_amount,line_total_amount) VALUES($1,'sku-a','A',2,300,600),($1,'sku-b','B',1,400,400)", [orderId]);
});

function event(type = 'checkout.session.completed', id = 'evt_a', extra = {}) {
  const session = type.startsWith('checkout.session.');
  return {
    id, type, livemode: false,
    data: {
      object: {
        id: session ? 'cs_test_a' : type === 'charge.refunded' ? 'ch_test_a' : 'pi_test_a',
        metadata: { orderId },
        client_reference_id: orderId,
        payment_intent: 'pi_test_a',
        payment_status: 'paid',
        amount_total: 1000,
        amount_received: 1000,
        amount: 1000,
        currency: 'usd',
        ...extra,
      },
    },
  };
}

const apply = (e) => applySettlement(client, e);
const receipt = async (id) =>
  (await q('select result from stripe_webhook_events where id=$1', [id])).rows[0]?.result || null;

// ---------------------------------------------------------------- classification

test('permanent business-logic rejections are not transient', () => {
  for (const reason of [
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
  ]) {
    const c = classifySettlementFailure(new Error('settlement_database_failure', { cause: reason }));
    assert.equal(c.reason, reason);
    assert.equal(c.transient, false, reason);
  }
});

test('retryable, infrastructural, and unrecognized failures stay transient', () => {
  for (const reason of [
    'order_not_found_retryable',
    'refund_before_settlement',
    'database_unavailable',
    'settlement_database_failure',
    'outbox_read_failed',
    'outbox_claim_failed',
    'outbox_prepare_failed',
    'outbox_finish_failed',
    'email_delivery_pending',
  ]) {
    assert.equal(classifySettlementFailure(new Error(reason)).transient, true, reason);
  }
  // applySettlement wraps the RPC reason as the error cause; classification unwraps it.
  const wrapped = new Error('settlement_database_failure', { cause: 'stripe_amount_or_currency_mismatch' });
  assert.deepEqual(classifySettlementFailure(wrapped), { reason: 'stripe_amount_or_currency_mismatch', transient: false });
  // Unknown future reasons default to TRANSIENT: an unrecognized failure may
  // mean the event was never processed (e.g. a network error), and such an
  // event must never be acknowledged with 200. Retry backlogs stay visible
  // on the health endpoint's webhookProcessing field.
  assert.equal(classifySettlementFailure(new Error('some_future_rejection')).transient, true);
  // Network/infra failures between the app and the database stay retryable.
  const netErr = new Error('settlement_database_failure', { cause: 'Failed to fetch' });
  assert.deepEqual(classifySettlementFailure(netErr), { reason: 'Failed to fetch', transient: true });
  const plainNet = new Error('fetch failed');
  assert.equal(classifySettlementFailure(plainNet).transient, true);
});

// ---------------------------------------------------------------- alert idempotency

test('permanent failure alerts once per event id and marks the receipt', async () => {
  process.env.NOTIFICATION_EMAIL_TO = 'owner@example.invalid';
  const sent = [];
  const send = async (p) => { sent.push(p); return { success: true, id: 'test-id' }; };
  const evt = event('checkout.session.completed', 'evt_perm_a', { amount_total: 999 });

  await assert.rejects(apply(evt), /settlement_database_failure/);
  const first = await alertPermanentSettlementFailure({
    database: client, event: evt, reason: 'stripe_amount_or_currency_mismatch', orderId, send,
  });
  assert.equal(first.alerted, true);
  assert.equal(first.duplicate, false);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'owner@example.invalid');
  assert.match(sent[0].subject, /stripe_amount_or_currency_mismatch/);
  assert.match(sent[0].text, /evt_perm_a/);
  assert.match(sent[0].text, /checkout\.session\.completed/);
  assert.match(sent[0].text, /https:\/\/dashboard\.stripe\.com\/events\/evt_perm_a/);
  assert.match(sent[0].text, new RegExp(orderId));
  assert.ok(!sent[0].text.includes('sk_test') && !sent[0].text.includes('whsec'));

  const row = await receipt('evt_perm_a');
  assert.equal(row.outcome, 'permanent_failure_alerted');
  assert.equal(row.reason, 'stripe_amount_or_currency_mismatch');
  assert.equal(row.retry, false);

  // Redelivery: no second email, acknowledged as duplicate.
  const second = await alertPermanentSettlementFailure({
    database: client, event: evt, reason: 'stripe_amount_or_currency_mismatch', orderId, send,
  });
  assert.equal(second.duplicate, true);
  assert.equal(sent.length, 1);

  // The settlement RPC itself now treats the redelivery as an acknowledged duplicate.
  const replay = await apply(evt);
  assert.equal(replay.outcome, 'permanent_failure_alerted');
  assert.equal(replay.duplicate, true);
  delete process.env.NOTIFICATION_EMAIL_TO;
});

test('unattributed events alert once and write a receipt row', async () => {
  process.env.NOTIFICATION_EMAIL_TO = 'owner@example.invalid';
  const sent = [];
  const send = async (p) => { sent.push(p); return { success: true, id: 'test-id' }; };
  const evt = event('checkout.session.completed', 'evt_unattr', {
    metadata: {}, client_reference_id: null, id: 'cs_unknown', payment_intent: 'pi_unknown',
  });
  const result = await apply(evt);
  assert.equal(result.outcome, 'unknown_unattributed_event');

  const first = await alertPermanentSettlementFailure({
    database: client, event: evt, reason: 'unknown_unattributed_event', orderId: null, send,
  });
  assert.equal(first.alerted, true);
  assert.equal(sent.length, 1);
  const row = await receipt('evt_unattr');
  assert.equal(row.outcome, 'permanent_failure_alerted');

  const second = await alertPermanentSettlementFailure({
    database: client, event: evt, reason: 'unknown_unattributed_event', orderId: null, send,
  });
  assert.equal(second.duplicate, true);
  assert.equal(sent.length, 1);
  delete process.env.NOTIFICATION_EMAIL_TO;
});

test('a failed alert send is not marked, so redelivery retries the alert', async () => {
  process.env.NOTIFICATION_EMAIL_TO = 'owner@example.invalid';
  let calls = 0;
  const flaky = async () => { calls++; return calls === 1 ? { success: false, error: 'boom' } : { success: true, id: 'x' }; };
  const evt = event('checkout.session.completed', 'evt_flaky', { amount_total: 999 });
  await assert.rejects(apply(evt), /settlement_database_failure/);

  const first = await alertPermanentSettlementFailure({
    database: client, event: evt, reason: 'stripe_amount_or_currency_mismatch', orderId, send: flaky,
  });
  assert.equal(first.alerted, false);
  // applySettlement's record_stripe_failure marker is still there; the alert
  // itself was NOT recorded, so redelivery retries the alert.
  assert.equal((await receipt('evt_flaky')).outcome, 'processing_failed');

  const second = await alertPermanentSettlementFailure({
    database: client, event: evt, reason: 'stripe_amount_or_currency_mismatch', orderId, send: flaky,
  });
  assert.equal(second.alerted, true);
  assert.equal((await receipt('evt_flaky')).outcome, 'permanent_failure_alerted');
  delete process.env.NOTIFICATION_EMAIL_TO;
});

test('transient failures are never alerted by the classifier', async () => {
  const evt = event('checkout.session.completed', 'evt_retry', {
    metadata: { orderId: '00000000-0000-4000-8000-000000000099' },
    client_reference_id: null, id: 'cs_unknown', payment_intent: 'pi_unknown',
  });
  const err = await apply(evt).then(() => null, (e) => e);
  assert.ok(err);
  const c = classifySettlementFailure(err);
  assert.equal(c.reason, 'order_not_found_retryable');
  assert.equal(c.transient, true);
});

// ---------------------------------------------------------------- route behavior

function signedRequest(evt) {
  const stripe = new Stripe('sk_test_fixture');
  const payload = JSON.stringify(evt);
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: webhookSecret });
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    headers: { 'stripe-signature': signature, 'content-type': 'application/json' },
    body: payload,
  });
}

async function loadRoute(send) {
  const original = { ...process.env };
  Object.assign(process.env, {
    PAYMENT_GATEWAY_TYPE: 'stripe',
    STRIPE_SECRET_KEY: 'sk_test_fixture',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_fixture',
    STRIPE_WEBHOOK_SECRET: webhookSecret,
    NOTIFICATION_EMAIL_TO: 'owner@example.invalid',
  });
  const { POST } = loadTSModule('src/app/api/webhooks/stripe/route.ts', {
    'src/lib/supabase/admin.ts': { createAdminClient: () => client },
    'src/lib/email/resend.ts': { sendEmailSafely: send },
  });
  return {
    POST,
    restore() {
      for (const k of Object.keys(process.env)) if (!(k in original)) delete process.env[k];
      Object.assign(process.env, original);
    },
  };
}

const post = async (POST, evt) => {
  const res = await POST(signedRequest(evt));
  return { status: res.status, body: await res.json() };
};

test('route: permanent failure alerts once and answers 200; redelivery is a duplicate 200', async () => {
  const sent = [];
  const { POST, restore } = await loadRoute(async (p) => { sent.push(p); return { success: true, id: 'x' }; });
  try {
    const evt = event('checkout.session.completed', 'evt_route_perm', { amount_total: 999 });
    const first = await post(POST, evt);
    assert.equal(first.status, 200);
    assert.equal(first.body.outcome, 'permanent_failure_alerted');
    assert.equal(first.body.duplicate, false);
    assert.equal(sent.length, 1);

    const second = await post(POST, evt);
    assert.equal(second.status, 200);
    assert.equal(second.body.outcome, 'permanent_failure_alerted');
    assert.equal(second.body.duplicate, true);
    assert.equal(sent.length, 1);

    // The order itself was never settled by the permanent failure.
    assert.equal((await q('select payment_status from manual_orders where id=$1', [orderId])).rows[0].payment_status, 'unpaid');
  } finally { restore(); }
});

test('route: transient failure still answers 503', async () => {
  const sent = [];
  const { POST, restore } = await loadRoute(async (p) => { sent.push(p); return { success: true, id: 'x' }; });
  try {
    const evt = event('checkout.session.completed', 'evt_route_trans', {
      metadata: { orderId: '00000000-0000-4000-8000-000000000099' },
      client_reference_id: null, id: 'cs_unknown', payment_intent: 'pi_unknown',
    });
    const res = await post(POST, evt);
    assert.equal(res.status, 503);
    assert.equal(sent.length, 0);
  } finally { restore(); }
});

test('route: unattributed event alerts and answers 200 (D3)', async () => {
  const sent = [];
  const { POST, restore } = await loadRoute(async (p) => { sent.push(p); return { success: true, id: 'x' }; });
  try {
    const evt = event('checkout.session.completed', 'evt_route_unattr', {
      metadata: {}, client_reference_id: null, id: 'cs_unknown', payment_intent: 'pi_unknown',
    });
    const res = await post(POST, evt);
    assert.equal(res.status, 200);
    assert.equal(res.body.outcome, 'permanent_failure_alerted');
    assert.equal(sent.length, 1);
    assert.match(sent[0].text, /unknown_unattributed_event/);
  } finally { restore(); }
});
