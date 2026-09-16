import test from "node:test";
import assert from "node:assert/strict";
import { PRODUCTS } from "../src/data/products.ts";
import { vialFoundryBrandConfig } from "../src/config/brand.ts";
import { calculateShipping, getFreeShippingMessage } from "../src/lib/manual-orders/shipping.mjs";
import { recalculateInvoice } from "../src/lib/admin/order-math.mjs";
import { resolvePromoCodeWithConfig } from "../src/lib/promotions/promotions.mjs";
import { buildStripeCheckoutAmounts } from "../src/lib/adapters/stripe-amounts.mjs";

test("authoritative product catalog contains exact launch prices", () => {
  const pMap = new Map(PRODUCTS.map((p) => [p.sku, p]));

  // 5 updated launch SKUs
  const bpc = pMap.get("VF-SKU-991");
  assert.ok(bpc);
  assert.equal(bpc.price, 54.99);

  const cjc = pMap.get("VF-SKU-996");
  assert.ok(cjc);
  assert.equal(cjc.price, 49.99);

  const tesa = pMap.get("VF-SKU-1012");
  assert.ok(tesa);
  assert.equal(tesa.price, 59.99);

  const pt141 = pMap.get("VF-SKU-1013");
  assert.ok(pt141);
  assert.equal(pt141.price, 54.99);

  const aod = pMap.get("VF-SKU-1019");
  assert.ok(aod);
  assert.equal(aod.price, 59.99);

  // Retained SKUs
  assert.equal(pMap.get("VF-SKU-992")?.price, 88.00); // TB-500
  assert.equal(pMap.get("VF-SKU-997")?.price, 48.00); // Ipamorelin
  assert.equal(pMap.get("VF-SKU-998")?.price, 75.00); // NAD+
  assert.equal(pMap.get("VF-SKU-999")?.price, 58.00); // GHK-Cu
  assert.equal(pMap.get("VF-SKU-1011")?.price, 54.00); // Sermorelin
  assert.equal(pMap.get("VF-SKU-1014")?.price, 46.00); // Selank
  assert.equal(pMap.get("VF-SKU-1015")?.price, 49.00); // Semax
  assert.equal(pMap.get("VF-SKU-1016")?.price, 42.00); // Epithalon
  assert.equal(pMap.get("VF-SKU-1017")?.price, 96.00); // Thymosin Alpha-1

  // Withheld SKUs
  assert.equal(pMap.get("VF-SKU-1000")?.price, 14.00); // Bac Water
  assert.equal(pMap.get("VF-SKU-1020")?.price, 38.00); // Acetonitrile

  // GLP-1 SKUs awaiting owner cost confirmation
  assert.equal(pMap.get("VF-SKU-993")?.price, 112.00); // Semaglutide
  assert.equal(pMap.get("VF-SKU-994")?.price, 145.00); // Tirzepatide
  assert.equal(pMap.get("VF-SKU-995")?.price, 168.00); // Retatrutide
});

test("brand shipping configuration specifies launch rates exactly", () => {
  const options = vialFoundryBrandConfig.shippingOptions;
  const standard = options.find((o) => o.id === "standard");
  const priority = options.find((o) => o.id === "priority");
  const express = options.find((o) => o.id === "express");

  assert.ok(standard);
  assert.equal(standard.costCents, 999);
  assert.equal(standard.freeShippingThresholdCents, 20000);

  assert.ok(priority);
  assert.equal(priority.costCents, 2499);

  assert.ok(express);
  assert.equal(express.costCents, 4999);
});

test("shipping calculation enforces $199.99 vs $200.00 boundary conditions", () => {
  const brandOptions = vialFoundryBrandConfig.shippingOptions;

  // $199.99 standard order charges standard shipping ($9.99)
  const under = calculateShipping(19999, "standard", brandOptions);
  assert.equal(under.amountCents, 999);
  assert.equal(under.displayPrice, "$9.99");

  // $200.00 standard order ships free
  const threshold = calculateShipping(20000, "standard", brandOptions);
  assert.equal(threshold.amountCents, 0);
  assert.equal(threshold.displayPrice, "FREE");

  // Priority still charges $24.99 at $200.00
  const priorityAtThreshold = calculateShipping(20000, "priority", brandOptions);
  assert.equal(priorityAtThreshold.amountCents, 2499);
  assert.equal(priorityAtThreshold.displayPrice, "$24.99");

  // Overnight still charges $49.99 at $200.00
  const expressAtThreshold = calculateShipping(20000, "express", brandOptions);
  assert.equal(expressAtThreshold.amountCents, 4999);
  assert.equal(expressAtThreshold.displayPrice, "$49.99");
});

test("promotions configuration keeps FOUNDRY10 active and RESEARCH25 disabled", () => {
  const promos = vialFoundryBrandConfig.promotions;

  const f10 = promos.find((p) => p.code === "FOUNDRY10");
  assert.ok(f10);
  assert.equal(f10.name, "Vial Foundry 10% Off");
  assert.equal(f10.enabled, true);
  assert.equal(f10.discountRateBps, 1000);

  const r25 = promos.find((p) => p.code === "RESEARCH25");
  assert.ok(r25);
  assert.equal(r25.enabled, false);

  // Resolution of active FOUNDRY10
  const resolvedF10 = resolvePromoCodeWithConfig("foundry10", promos, 10000);
  assert.equal(resolvedF10.valid, true);
  assert.equal(resolvedF10.discountRateBps, 1000);

  // Resolution of disabled RESEARCH25 fails cleanly
  const resolvedR25 = resolvePromoCodeWithConfig("research25", promos, 25000);
  assert.equal(resolvedR25.valid, false);
  assert.match(resolvedR25.error || "", /inactive/i);
});

test("order math and Stripe reconciliation for repriced products with launch shipping", () => {
  // Scenario 1: 1 BPC-157 5mg ($54.99 = 5499 cents) + Standard Shipping ($9.99 = 999 cents)
  const items1 = [
    {
      product_name: "BPC-157 5mg",
      sku: "VF-SKU-991",
      unit_price_amount: 5499,
      quantity: 1,
      price_status: "fixed",
    },
  ];
  const invoice1 = recalculateInvoice(
    {
      items: items1,
      shippingAmount: 999,
      taxAmount: 0,
    },
    vialFoundryBrandConfig.promotions
  );

  assert.equal(invoice1.subtotal_amount, 5499);
  assert.equal(invoice1.shipping_amount, 999);
  assert.equal(invoice1.total_amount, 6498); // $64.98

  // Stripe line items match exactly
  const stripe1 = buildStripeCheckoutAmounts({
    items: [{ productName: "BPC-157 5mg", sku: "VF-SKU-991", quantity: 1, unit_price_amount: 5499 }],
    invoice: {
      subtotal_before_discount: invoice1.subtotal_before_discount || 0,
      discount_amount: invoice1.discount_amount || 0,
      shipping_amount: invoice1.shipping_amount || 0,
      tax_amount: invoice1.tax_amount || 0,
      total_amount: invoice1.total_amount || 0,
    },
    currency: "USD",
    shippingLabel: "Standard Shipping (3-5 business days)",
  });
  assert.equal(stripe1.expectedTotalCents, 6498);
  assert.equal(stripe1.discountCents, 0);

  // Scenario 2: 1 Tesamorelin 5mg ($59.99) + FOUNDRY10 (10% off) + Standard Shipping ($9.99)
  // Subtotal = 5999
  // 10% discount = round(5999 * 0.10) = 600 cents ($6.00)
  // Subtotal after discount = 5399
  // Total = 5399 + 999 = 6398 ($63.98)
  const items2 = [
    {
      product_name: "Tesamorelin 5mg",
      sku: "VF-SKU-1012",
      unit_price_amount: 5999,
      quantity: 1,
      price_status: "fixed",
    },
  ];
  const invoice2 = recalculateInvoice(
    {
      items: items2,
      promoCode: "FOUNDRY10",
      shippingAmount: 999,
      taxAmount: 0,
    },
    vialFoundryBrandConfig.promotions
  );
  assert.equal(invoice2.subtotal_before_discount, 5999);
  assert.equal(invoice2.subtotal_amount, 5399);
  assert.equal(invoice2.discount_amount, 600);
  assert.equal(invoice2.subtotal_after_discount, 5399);
  assert.equal(invoice2.total_amount, 6398);

  const stripe2 = buildStripeCheckoutAmounts({
    items: [{ productName: "Tesamorelin 5mg", sku: "VF-SKU-1012", quantity: 1, unit_price_amount: 5999 }],
    invoice: {
      subtotal_before_discount: invoice2.subtotal_before_discount || 0,
      discount_amount: invoice2.discount_amount || 0,
      shipping_amount: invoice2.shipping_amount || 0,
      tax_amount: invoice2.tax_amount || 0,
      total_amount: invoice2.total_amount || 0,
      promo_code: "FOUNDRY10",
    },
    currency: "USD",
    shippingLabel: "Standard Shipping (3-5 business days)",
  });
  assert.equal(stripe2.expectedTotalCents, 6398);
  assert.equal(stripe2.discountCents, 600);
});
