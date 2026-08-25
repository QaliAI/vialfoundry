import test from "node:test";
import assert from "node:assert/strict";
import { recalculateInvoice, recalculateAffiliateCommission, resolveAffiliateRateBps, cents } from "../src/lib/admin/order-math.mjs";
import { calculateConfiguredPromoDiscount } from "../src/lib/promotions/promotions.mjs";

const testPromotions = [
  {
    code: "FOUNDRY10",
    name: "Foundry 10% Discount",
    discountRateBps: 1000,
    affiliateCommissionRateBps: 800,
    enabled: true,
  },
  {
    code: "RESEARCH25",
    name: "Research $25 Discount on orders $200+",
    fixedDiscountCents: 2500,
    minSubtotalCents: 20000,
    enabled: true,
  },
];

test("cents clamps negative and non-finite numbers to 0", () => {
  assert.equal(cents(-10), 0);
  assert.equal(cents("invalid"), 0);
  assert.equal(cents(null), 0);
  assert.equal(cents(49.99), 50);
  assert.equal(cents(5000), 5000);
});

test("recalculateInvoice derives product subtotal and total server-side", () => {
  const result = recalculateInvoice(
    {
      items: [
        { product_name: "BPC-157 5mg", unit_price_amount: 6400, quantity: 2 },
        { product_name: "TB-500 5mg", unit_price_amount: 5800, quantity: 1 },
      ],
      shippingAmount: 1500,
      taxAmount: 0,
    },
    testPromotions
  );

  assert.equal(result.pricingPending, false);
  assert.equal(result.subtotal_before_discount, 18600); // 12800 + 5800
  assert.equal(result.discount_amount, 0);
  assert.equal(result.subtotal_amount, 18600);
  assert.equal(result.shipping_amount, 1500);
  assert.equal(result.total_amount, 20100);
});

test("FOUNDRY10 gives 10% off product subtotal, shipping not discounted", () => {
  const result = recalculateInvoice(
    {
      items: [{ product_name: "Semaglutide 5mg", unit_price_amount: 10000, quantity: 1 }],
      promoCode: "FOUNDRY10",
      shippingAmount: 1500,
    },
    testPromotions
  );

  assert.equal(result.subtotal_before_discount, 10000);
  assert.equal(result.discount_amount, 1000); // 10%
  assert.equal(result.subtotal_after_discount, 9000);
  assert.equal(result.shipping_amount, 1500);
  assert.equal(result.total_amount, 10500); // 9000 + 1500
});

test("RESEARCH25 gives $25 off when subtotal >= $200", () => {
  const eligible = recalculateInvoice(
    {
      items: [{ product_name: "Bulk Tirzepatide", unit_price_amount: 25000, quantity: 1 }],
      promoCode: "RESEARCH25",
      shippingAmount: 0,
    },
    testPromotions
  );

  assert.equal(eligible.discount_amount, 2500);
  assert.equal(eligible.total_amount, 22500);

  const ineligible = recalculateInvoice(
    {
      items: [{ product_name: "Single Vial", unit_price_amount: 5000, quantity: 1 }],
      promoCode: "RESEARCH25",
      shippingAmount: 1500,
    },
    testPromotions
  );

  assert.equal(ineligible.discount_amount, 0);
  assert.equal(ineligible.total_amount, 6500);
});

test("affiliate commission calculation excludes shipping from commission base", () => {
  const comm = recalculateAffiliateCommission(
    {
      productSubtotalCents: 10000,
      shippingCents: 1500,
      rateBps: 1000, // 10%
    }
  );

  assert.equal(comm.affiliate_commission_rate_bps, 1000);
  assert.equal(comm.affiliate_product_subtotal, 10000);
  assert.equal(comm.affiliate_commission_amount, 1000);
  assert.equal(comm.shippingExcluded, true);
});

test("CashApp / Crypto 5% payment method discount applies to subtotal after promo", () => {
  // $200 subtotal, 5% payment discount (500 bps) -> $10 discount
  const cryptoOnly = recalculateInvoice(
    {
      items: [{ product_name: "Tirzepatide", unit_price_amount: 20000, quantity: 1 }],
      paymentMethodDiscountRateBps: 500,
      shippingAmount: 0,
    },
    testPromotions
  );

  assert.equal(cryptoOnly.subtotal_before_discount, 20000);
  assert.equal(cryptoOnly.payment_discount_amount, 1000); // 5% of 20000 = 1000 cents
  assert.equal(cryptoOnly.discount_amount, 1000);
  assert.equal(cryptoOnly.total_amount, 19000);

  // Stacked: $200 subtotal, FOUNDRY10 (10% = $20 off -> $180), then 5% crypto ($9 off -> $171)
  const stacked = recalculateInvoice(
    {
      items: [{ product_name: "Tirzepatide", unit_price_amount: 20000, quantity: 1 }],
      promoCode: "FOUNDRY10",
      paymentMethodDiscountRateBps: 500,
      shippingAmount: 1500,
    },
    testPromotions
  );

  assert.equal(stacked.subtotal_before_discount, 20000);
  assert.equal(stacked.discount_amount, 2900); // 2000 promo + 900 payment
  assert.equal(stacked.subtotal_after_discount, 17100);
  assert.equal(stacked.total_amount, 18600); // 17100 + 1500 shipping
});

test("discount amount cannot exceed product subtotal", () => {
  const result = recalculateInvoice(
    {
      items: [{ product_name: "Small Sample", unit_price_amount: 1000, quantity: 1 }],
      promoCode: "RESEARCH25", // Ineligible because minSubtotal is 20000
      shippingAmount: 1500,
    },
    testPromotions
  );

  assert.equal(result.discount_amount, 0);
  assert.equal(result.total_amount, 2500);
});

