import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePromoCode,
  resolvePromoCodeWithConfig,
  checkFirstOrderEligibility,
} from '../src/lib/promotions/promotions.mjs';
import { recalculateInvoice, recalculateAffiliateCommission, resolveAffiliateRateBps } from '../src/lib/admin/order-math.mjs';
import { FEATURED_PRODUCT_IDS, getFeaturedProducts } from '../src/config/merchandising.ts';
import { PRODUCTS } from '../src/data/products.ts';
import { parseUtmParams } from '../src/lib/analytics/attribution.ts';

test('promotions engine: FOUNDRY20 is configured for 20% discount on first orders only', () => {
  const promos = [
    {
      code: 'FOUNDRY20',
      name: 'FOUNDRY20 — 20% First Order Discount',
      discount_type: 'percentage',
      discount_rate_bps: 2000,
      fixed_discount_cents: 0,
      minimum_subtotal_cents: 0,
      first_order_only: true,
      enabled: true,
    },
  ];

  // Eligible first-time customer
  const eligible = resolvePromoCodeWithConfig('FOUNDRY20', promos, 10000, { isFirstOrder: true });
  assert.equal(eligible.valid, true);
  assert.equal(eligible.discountRateBps, 2000);
  assert.equal(eligible.code, 'FOUNDRY20');

  // Ineligible repeat customer
  const ineligible = resolvePromoCodeWithConfig('FOUNDRY20', promos, 10000, { isFirstOrder: false });
  assert.equal(ineligible.valid, false);
  assert.ok(ineligible.error.includes('first-time'));
});

test('first-order eligibility: allows customer with no prior orders or canceled/unpaid orders', async () => {
  const mockSupabaseUnpaid = {
    from: () => ({
      select: () => ({
        ilike: () =>
          Promise.resolve({
            data: [
              {
                id: 'ord-1',
                order_number: 'VF-000001',
                status: 'canceled',
                payment_status: 'unpaid',
                is_test: false,
                stripe_livemode: true,
              },
            ],
            error: null,
          }),
      }),
    }),
  };

  const res = await checkFirstOrderEligibility('newbuyer@lab.org', mockSupabaseUnpaid);
  assert.equal(res.eligible, true);
});

test('first-order eligibility: blocks customer with prior successfully paid production order', async () => {
  const mockSupabasePaid = {
    from: () => ({
      select: () => ({
        ilike: () =>
          Promise.resolve({
            data: [
              {
                id: 'ord-2',
                order_number: 'VF-000002',
                status: 'paid',
                payment_status: 'paid',
                is_test: false,
                stripe_livemode: true,
              },
            ],
            error: null,
          }),
      }),
    }),
  };

  const res = await checkFirstOrderEligibility('priorbuyer@lab.org', mockSupabasePaid);
  assert.equal(res.eligible, false);
  assert.ok(res.reason.includes('previous paid order was found'));
  assert.equal(res.priorOrderNumber, 'VF-000002');
});

test('first-order eligibility: test orders do NOT disqualify customer', async () => {
  const mockSupabaseTest = {
    from: () => ({
      select: () => ({
        ilike: () =>
          Promise.resolve({
            data: [
              {
                id: 'ord-test',
                order_number: 'VF-TEST01',
                status: 'paid',
                payment_status: 'paid',
                is_test: true,
                stripe_livemode: false,
              },
            ],
            error: null,
          }),
      }),
    }),
  };

  const res = await checkFirstOrderEligibility('qa_tester@vialfoundry.com', mockSupabaseTest);
  assert.equal(res.eligible, true);
});

test('promotions engine: enforces expiration date and minimum spend constraints', () => {
  const pastPromo = [
    {
      code: 'EXPIRED10',
      discount_rate_bps: 1000,
      ends_at: '2025-01-01T00:00:00Z',
      enabled: true,
    },
  ];

  const expiredCheck = resolvePromoCodeWithConfig('EXPIRED10', pastPromo, 10000, {
    now: new Date('2026-06-01T00:00:00Z'),
  });
  assert.equal(expiredCheck.valid, false);
  assert.ok(expiredCheck.error.includes('expired'));

  const minSpendPromo = [
    {
      code: 'MIN200',
      discount_rate_bps: 1500,
      minimum_subtotal_cents: 20000,
      enabled: true,
    },
  ];

  const subtotalLow = resolvePromoCodeWithConfig('MIN200', minSpendPromo, 15000);
  assert.equal(subtotalLow.valid, false);
  assert.ok(subtotalLow.error.includes('$200.00'));

  const subtotalPass = resolvePromoCodeWithConfig('MIN200', minSpendPromo, 25000);
  assert.equal(subtotalPass.valid, true);
});

test('discount stacking & affiliate economics guardrails', () => {
  const standardRate = resolveAffiliateRateBps(null, 1000);
  assert.equal(standardRate, 1000);

  const foundry20OverrideRate = resolveAffiliateRateBps('FOUNDRY20', 1000);
  assert.equal(foundry20OverrideRate, 800);

  const invoice = recalculateInvoice(
    {
      items: [{ productName: 'BPC-157', quantity: 2, unit_price_amount: 5499, price_status: 'fixed' }],
      promoCode: 'FOUNDRY20',
      shippingAmount: 1500,
      paymentMethodDiscountRateBps: 0,
    },
    [{ code: 'FOUNDRY20', discount_rate_bps: 2000, enabled: true }]
  );

  assert.equal(invoice.subtotal_before_discount, 10998);
  assert.equal(invoice.discount_amount, 2200);
  assert.equal(invoice.subtotal_amount, 8798);

  const affCommission = recalculateAffiliateCommission({
    productSubtotalCents: invoice.subtotal_amount,
    promoCode: 'FOUNDRY20',
    rateBps: 1000,
  });

  assert.equal(affCommission.affiliate_commission_rate_bps, 800);
  assert.equal(affCommission.affiliate_commission_amount, 704);
});

test('homepage merchandising: selects strategic featured products instead of slice(0, 4)', () => {
  assert.ok(FEATURED_PRODUCT_IDS.length >= 4);
  const featured = getFeaturedProducts(PRODUCTS, 6);
  assert.equal(featured.length, 6);

  const names = featured.map((p) => p.name);
  assert.ok(names.some((n) => n.includes('BPC-157')));
  assert.ok(names.some((n) => n.includes('Semaglutide')));
  assert.ok(names.some((n) => n.includes('TB-500')));
});

test('attribution parser extracts standard UTMs and referrer cleanly', () => {
  const url = 'https://www.vialfoundry.com/catalog?utm_source=bioresearch_digest&utm_medium=newsletter&utm_campaign=q4_launch&utm_content=hero_banner';
  const utms = parseUtmParams(url);

  assert.equal(utms.utm_source, 'bioresearch_digest');
  assert.equal(utms.utm_medium, 'newsletter');
  assert.equal(utms.utm_campaign, 'q4_launch');
  assert.equal(utms.utm_content, 'hero_banner');
});

test('ruo compliance: forbids therapeutic and clinical claims in marketing', () => {
  const prohibitedWords = ['cure', 'injection', 'dosing', 'human use', 'patient', 'therapy'];

  function checkRuo(text) {
    const lower = text.toLowerCase();
    return prohibitedWords.filter((w) => lower.includes(w));
  }

  const badCopy = 'This peptide offers effective dosing for human use and patient therapy.';
  const violations = checkRuo(badCopy);
  assert.ok(violations.length >= 3);

  const truthfulRuoCopy = 'Standardized, lot-documented research materials strictly for in vitro laboratory evaluation.';
  assert.equal(checkRuo(truthfulRuoCopy).length, 0);
});
