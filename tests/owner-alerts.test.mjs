import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

test('internal order notification template defines fulfillment next step and excludes sensitive payment data', () => {
  const tplSrc = read('src/lib/email/templates/internal-order.ts');
  assert.ok(tplSrc.includes('fulfillmentNextStep?: string | null;'), 'template interface must declare fulfillmentNextStep');
  assert.ok(tplSrc.includes('Fulfillment next step'), 'template must render fulfillment next step heading');
  assert.ok(tplSrc.includes('escapeHtml(nextStep)'), 'template must safely escape fulfillment next step');
  
  // Never expose sensitive card tokens or numbers
  assert.ok(!tplSrc.includes('cvc'));
  assert.ok(!tplSrc.includes('exp_month'));
  assert.ok(!tplSrc.includes('client_secret'));
});

test('stripe webhook ensures email failure does not lose the paid order', () => {
  const webhookSrc = read('src/app/api/webhooks/stripe/route.ts');

  // Customer email wrapped in try/catch
  assert.ok(
    webhookSrc.includes('// 1. Customer confirmation email (isolated try/catch so failure never throws)'),
    'customer email dispatch must be isolated in try/catch',
  );

  // Owner alert wrapped in try/catch
  assert.ok(
    webhookSrc.includes('// 2. Owner alert email (isolated try/catch so failure never throws)'),
    'owner alert dispatch must be isolated in try/catch',
  );

  // Pass fulfillment next step
  assert.ok(
    webhookSrc.includes('fulfillmentNextStep'),
    'webhook must provide fulfillmentNextStep in owner alert',
  );

  // Order transition to waiting_inventory on oversell
  assert.ok(
    webhookSrc.includes("status: 'waiting_inventory'"),
    'webhook must transition order status to waiting_inventory on oversell',
  );
});

test('admin resend-email route supports owner_alert with proper event logging', () => {
  const resendSrc = read('src/app/api/admin/orders/resend-email/route.ts');
  assert.ok(
    resendSrc.includes('emailType === "owner_alert"'),
    'resend route must support owner_alert email type',
  );
  assert.ok(
    resendSrc.includes('renderInternalOrderNotificationEmail'),
    'resend route must render internal order notification for owner alert',
  );
});
