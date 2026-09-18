import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { PRODUCTS } from '../src/data/products.ts';
import { vialFoundryBrandConfig } from '../src/config/brand.ts';
import { calculateShipping } from '../src/lib/manual-orders/shipping.mjs';
import { recalculateInvoice } from '../src/lib/admin/order-math.mjs';
import { buildStripeCheckoutAmounts } from '../src/lib/adapters/stripe-amounts.mjs';
import { validateCheckoutItem, isPubliclyPurchasable } from '../src/lib/manual-orders/checkout-catalog.mjs';

const SCRIPT = 'scripts/stripe-test-session.mjs';
const src = fs.readFileSync(path.resolve(SCRIPT), 'utf8');

/**
 * The Stripe QA script once carried its own copy of launch economics
 * (standard shipping $15, BPC-157 $64). Those constants silently went stale
 * and the script kept reporting OK against numbers production had stopped
 * using. It must derive everything from the authoritative modules instead.
 */

test('stripe QA script derives economics from the authoritative modules', () => {
  for (const dep of [
    '../src/config/brand.ts',
    '../src/data/products.ts',
    '../src/lib/manual-orders/shipping.mjs',
    '../src/lib/admin/order-math.mjs',
    '../src/lib/adapters/stripe-amounts.mjs',
    '../src/lib/manual-orders/checkout-catalog.mjs',
  ]) {
    assert.ok(src.includes(dep), `${SCRIPT} must import ${dep}`);
  }
});

test('stripe QA script defines no local shipping or promotion tables', () => {
  // A local table is exactly how the stale $15 / $64 values survived.
  for (const banned of [
    /const\s+SHIPPING\s*=/,
    /const\s+PROMOS\s*=/,
    /freeShippingThresholdCents\s*:/,
    /costCents\s*:\s*\d/,
    /discountRateBps\s*:\s*\d/,
  ]) {
    assert.ok(!banned.test(src), `${SCRIPT} must not hard-code economics (${banned})`);
  }
});

test('stripe QA script hard-codes no catalogue price or shipping cost in cents', () => {
  const shippingCents = vialFoundryBrandConfig.shippingOptions.map((o) => o.costCents);
  const priceCents = PRODUCTS.map((p) => Math.round(Number(p.price) * 100));
  const stale = [1500, 6400]; // the exact values this guard exists to prevent

  for (const value of [...new Set([...shippingCents, ...priceCents, ...stale])]) {
    const literal = new RegExp(`\\b${value}\\b`);
    assert.ok(
      !literal.test(src),
      `${SCRIPT} must not contain the literal ${value}; read it from the authoritative config instead`,
    );
  }
});

test('stripe QA script still refuses live keys', () => {
  assert.ok(/stripeSecretMode/.test(src), 'must check the secret key mode');
  assert.ok(/!==\s*"test"/.test(src), 'must require test mode');
  assert.ok(/REFUSED/.test(src), 'must refuse rather than continue');
  assert.ok(/stripePublishableMode/.test(src), 'must check the publishable key mode too');
});

/**
 * The amount invariant the script asserts at runtime, proven here without a
 * network call, across every publicly purchasable SKU and every shipping tier.
 */
test('every purchasable SKU reaches Stripe at the exact server total', () => {
  const purchasable = PRODUCTS.filter(isPubliclyPurchasable);
  assert.ok(purchasable.length > 0, 'catalogue must expose purchasable products');

  for (const product of purchasable) {
    for (const option of vialFoundryBrandConfig.shippingOptions) {
      const validated = validateCheckoutItem(
        { productId: product.id, sku: product.sku, quantity: 1 },
        PRODUCTS,
      );
      assert.ok(validated.ok, `${product.sku} must pass public checkout validation`);
      assert.equal(
        validated.unit_price_amount,
        Math.round(Number(product.price) * 100),
        `${product.sku} checkout price must equal the catalogue price`,
      );

      const shipping = calculateShipping(
        validated.line_total_amount,
        option.id,
        vialFoundryBrandConfig.shippingOptions,
      );
      const invoice = recalculateInvoice(
        {
          items: [{ ...validated, productName: product.name, price_status: 'fixed' }],
          shippingAmount: shipping.amountCents,
          taxAmount: 0,
        },
        vialFoundryBrandConfig.promotions,
      );
      const built = buildStripeCheckoutAmounts({
        items: [
          {
            productName: product.displayName || product.name,
            sku: product.sku,
            quantity: validated.quantity,
            unit_price_amount: validated.unit_price_amount,
          },
        ],
        invoice,
        currency: vialFoundryBrandConfig.currency,
        shippingLabel: option.name,
      });

      assert.equal(
        built.expectedTotalCents,
        invoice.total_amount,
        `${product.sku} via ${option.id}: Stripe total must equal the server invoice total`,
      );
    }
  }
});

test('free standard shipping engages exactly at the configured threshold', () => {
  const standard = vialFoundryBrandConfig.shippingOptions.find((o) => o.id === 'standard');
  const threshold = standard.freeShippingThresholdCents;
  const options = vialFoundryBrandConfig.shippingOptions;

  assert.equal(calculateShipping(threshold - 1, 'standard', options).amountCents, standard.costCents);
  assert.equal(calculateShipping(threshold, 'standard', options).amountCents, 0);
  assert.equal(calculateShipping(threshold + 1, 'standard', options).amountCents, 0);

  // The threshold is standard-only; paid tiers never become free.
  for (const option of options.filter((o) => o.id !== 'standard')) {
    assert.equal(
      calculateShipping(threshold * 10, option.id, options).amountCents,
      option.costCents,
      `${option.id} must never be discounted by the standard free-shipping threshold`,
    );
  }
});
