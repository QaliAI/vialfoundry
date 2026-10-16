/**
 * Read-only production commerce watchdog.
 * No database writes, payment sessions, coupon redemptions, or customer orders.
 * Designed for GitHub Actions and an external AI operations agent.
 */
const base = (process.env.CHECKOUT_SITE_URL || 'https://www.vialfoundry.com').replace(/\/$/, '');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJson(path, options = {}) {
  const response = await fetch(base + path, {
    cache: 'no-store',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
    ...options,
  });
  let body;
  try { body = await response.json(); }
  catch { throw new Error(path + ' HTTP ' + response.status + ' did not return JSON'); }
  if (!response.ok) throw new Error(path + ' HTTP ' + response.status + ' status=' + String(body.status || body.error || 'unknown'));
  return body;
}

async function probe() {
  const [health, promotions, coupon] = await Promise.all([
    getJson('/api/health/checkout'),
    getJson('/api/promotions'),
    getJson('/api/promotions/validate', {
      method: 'POST',
      body: JSON.stringify({ code: 'WELCOME10', subtotalCents: 5999, customerEmail: 'health-probe-20261016@example.invalid' }),
    }),
  ]);

  if (health.status !== 'ok' || health.checkoutAvailable !== true || health.database !== 'available')
    throw new Error('Checkout database/availability health was not OK');
  if (health.paymentMode !== 'stripe')
    throw new Error('Checkout no longer reports Stripe enabled; no card-payment claim can be made');
  if (health.webhookProcessing === undefined && process.env.COMMERCE_DEPLOYMENT_GRACE === 'true') {
    const pending = new Error('Waiting for the new production health contract during deployment');
    pending.deploymentPending = true;
    throw pending;
  }
  if (health.webhookProcessing !== 'ok')
    throw new Error('Stripe settlement retries or notification backlog require reconciliation');
  if (promotions.banner?.code !== 'WELCOME10')
    throw new Error('WELCOME10 is not the active announcement campaign');
  if (!coupon.valid || coupon.code !== 'WELCOME10' || coupon.discountRateBps !== 1000 ||
      coupon.discountCents !== 600 || coupon.isProvisional !== false)
    throw new Error('WELCOME10 live eligibility/discount validation failed');

  return { checkout: 'ok', database: 'available', stripeConfigured: true,
    coupon: 'WELCOME10', couponDiscountCents: coupon.discountCents };
}

let lastError;
const maxAttempts = process.env.COMMERCE_DEPLOYMENT_GRACE === 'true' ? 12 : 3;
for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  try {
    const result = await probe();
    console.log('PASS', JSON.stringify({ target: base, ...result }));
    console.log('LIMITATION: This checks API readiness only; it does not prove Stripe charges_enabled or a completed payment.');
    process.exit(0);
  } catch (error) {
    lastError = error;
    console.error('Attempt ' + attempt + '/' + maxAttempts + ':', error.message);
    if (!error.deploymentPending && attempt >= 3) break;
    if (attempt < maxAttempts) await sleep(Math.min(attempt * 2500, 10000));
  }
}
console.error('FAIL: checkout watchdog detected an outage; ' + (lastError?.message || 'unknown'));
process.exit(1);
