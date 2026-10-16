# Stripe settlement operations

The `apply_stripe_event` RPC commits the payment, inventory ledger, commission,
promotion use, order timeline, notification outbox and event receipt together.
The RPC runs as the service role caller, with no public execution permission.
Apply `20261016231001_stripe_atomic_settlement.sql` transactionally before
deploying the application. It is additive except for removing public order/item
inserts; those writes already go through the server checkout API. The unique
payment-intent index deliberately aborts if historical duplicates exist.

## Detect and investigate

The existing hourly commerce watchdog calls `/api/health/checkout`. It returns
503 for retryable financial failures, notifications pending over ten minutes,
ambiguous notification delivery, or a missing processing migration. It exposes
no customer identifiers, amounts or provider keys. The watchdog opens one
deduplicated incident with a link to the failed run. Inspect privileged state:

```sql
select public.stripe_processing_health();
select id,event_type,manual_order_id,result from public.stripe_webhook_events
where result->>'retry'='true';
select id,manual_order_id,kind,attempts,last_error,first_attempt_at,provider_id
from public.stripe_email_outbox where sent_at is null;
```

Failed financial transactions leave a retryable receipt. Stripe retries non-2xx
responses; the same event can commit exactly once after the underlying issue is
resolved. Two settlement event types serialize on the same order row. A failed
notification never undoes the committed payment and is retried independently.

## Controlled reconciliation

Use explicit account credentials in the process environment, never in command
arguments or source. The script does not load local environments implicitly:

```sh
node scripts/reconcile-stripe-event.mjs --event evt_EXAMPLE
node scripts/reconcile-stripe-event.mjs --event evt_EXAMPLE --apply \
  --endpoint https://www.vialfoundry.com/api/webhooks/stripe \
  --webhook-endpoint we_EXAMPLE
```

The default is a Stripe API read. `--apply` verifies the registered endpoint and
mode, then uses the official Stripe CLI to request a signed resend. This never
creates a charge or changes financial rows directly. Verify the receipt and
outbox afterwards. Reconciliation needs a reachable Stripe CLI and account
access; events older than Stripe's resend retention require manual review.

For a new event already committed by this implementation, replay only drains
unsent notifications. Each recipient has a stable Resend idempotency key and an
immutable saved message. A provider timeout or database write failure after
provider acceptance can be retried within 23 hours of the first attempt. Beyond
that point delivery is held (`delivery_ambiguous_review`) because Resend's key
retention is 24 hours. Check Resend's delivery history and record the verified
provider receipt; do not clear timestamps or generate another key blindly.
`sent_at` records provider acceptance; mailbox delivery is a separate provider
event. `paid_email_sent_at` is set only when both paid messages are accepted.

Old webhook claims predate the transaction and are not evidence that every side
effect ran. `legacy_event_review` and `legacy_order_review` deliberately refuse
automatic replay. Compare the Stripe payment/session, every order line with its
inventory sale transaction, the commission ledger and provider email evidence.
Document any repair per order. Never delete the old receipt, reset inventory
markers, or replay financial changes as a general repair strategy. Refunds do
not restock automatically; physical returns remain an operations decision.

## Safe verification

`npm test` runs isolated embedded PostgreSQL transaction/route regressions.
CI also runs the transaction tests against an isolated PostgreSQL 17 service,
including concurrent deliveries. No production connection string is accepted.

`node scripts/stripe-reliability-sandbox.mjs` is an opt-in integration runner
using the existing VialFoundry Stripe sandbox, a fresh in-memory PostgreSQL
database, the actual checkout/webhook entry points and hosted test-card UI.
It strips all Supabase environment settings, refuses live keys and sends only
to Resend's documented test sink. It requires Playwright and configured sandbox
and email credentials. Evidence is written under ignored `output/`. It does
not prove live-card acceptance or the network delivery of a production webhook.

The production audit independently checked VialFoundry merchant capabilities,
enabled production webhook, and production publishable-key alignment. The
unrelated Stripe connector account is not used. The Supabase MCP connection
cannot access the production project; direct read-only access was verified
against `zywesqnrlmbzztxzjlgi` only. Runtime log retention is limited to one hour,
so a 48-hour retrospective cannot be established from Vercel's retained logs.

## Rollback

Keep the additive schema if the application must be rolled back. Do not roll
back to the old webhook while payments are arriving: it lacks transactional
idempotency and would not understand the new outbox. Stop the affected release
and fix forward or temporarily return 503 from the webhook so Stripe retains
deliveries. Never drop processing records to make an old release run.
