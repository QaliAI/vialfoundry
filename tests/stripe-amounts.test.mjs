import test from "node:test";
import assert from "node:assert/strict";
import { buildStripeCheckoutAmounts, assertStripeTotalMatches } from "../src/lib/adapters/stripe-amounts.mjs";
import { recalculateInvoice } from "../src/lib/admin/order-math.mjs";
import { calculateShipping } from "../src/lib/manual-orders/shipping.mjs";

const SHIPPING_OPTIONS = [
  { id: "standard", name: "Standard", costCents: 1500, freeShippingThresholdCents: 20000 },
  { id: "priority", name: "Priority", costCents: 3500 },
];

const PROMOS = [
  { code: "FOUNDRY10", discountRateBps: 1000, enabled: true },
  { code: "RESEARCH25", fixedDiscountCents: 2500, minSubtotalCents: 20000, enabled: true },
];

function items(...lines) {
  return lines.map(([name, unit, qty]) => ({
    productName: name,
    sku: `SKU-${name}`,
    unit_price_amount: unit,
    quantity: qty,
    price_status: "fixed",
  }));
}

/** Sum what Stripe would actually charge for a built payload. */
function stripeTotal({ line_items, discountCents }) {
  const lines = line_items.reduce((s, li) => s + li.price_data.unit_amount * li.quantity, 0);
  return lines - discountCents;
}

/** The invariant, exercised end to end through the real server math. */
function assertInvariant({ lines, shippingId, promoCode, paymentBps = 0 }) {
  const validated = items(...lines);
  const subtotal = validated.reduce((s, i) => s + i.unit_price_amount * i.quantity, 0);
  const ship = calculateShipping(subtotal, shippingId, SHIPPING_OPTIONS);
  const invoice = recalculateInvoice(
    {
      items: validated,
      promoCode,
      shippingAmount: ship.amountCents,
      taxAmount: 0,
      paymentMethodDiscountRateBps: paymentBps,
    },
    PROMOS,
  );
  const built = buildStripeCheckoutAmounts({ items: validated, invoice, currency: "USD" });

  assert.equal(built.expectedTotalCents, invoice.total_amount, "builder total must equal invoice total");
  assert.equal(stripeTotal(built), invoice.total_amount, "Stripe charge must equal invoice total");
  assert.ok(assertStripeTotalMatches(stripeTotal(built), invoice.total_amount));
  return { invoice, built };
}

test("simple order: products + paid shipping matches to the cent", () => {
  const { invoice } = assertInvariant({ lines: [["BPC-157", 6400, 1]], shippingId: "standard" });
  assert.equal(invoice.total_amount, 6400 + 1500);
});

test("percentage promo is reproduced exactly", () => {
  const { invoice, built } = assertInvariant({
    lines: [["BPC-157", 6400, 2]],
    shippingId: "standard",
    promoCode: "FOUNDRY10",
  });
  assert.equal(built.discountCents, 1280); // 10% of 12800
  assert.equal(invoice.total_amount, 12800 - 1280 + 1500);
});

test("fixed-amount promo is reproduced exactly", () => {
  const { built } = assertInvariant({
    lines: [["Tirzepatide", 14500, 2]],
    shippingId: "standard",
    promoCode: "RESEARCH25",
  });
  assert.equal(built.discountCents, 2500);
});

test("free-shipping threshold produces no shipping line", () => {
  const { invoice, built } = assertInvariant({ lines: [["TB-500", 8800, 3]], shippingId: "standard" });
  assert.equal(invoice.shipping_amount, 0);
  assert.equal(built.line_items.length, 1, "no shipping line when shipping is free");
});

test("payment-method discount is included in the Stripe amount", () => {
  const { invoice, built } = assertInvariant({
    lines: [["Semaglutide", 11200, 1]],
    shippingId: "priority",
    paymentBps: 500,
  });
  assert.ok(built.discountCents > 0);
  assert.equal(invoice.total_amount, 11200 - 560 + 3500);
});

test("stacked promo + payment discount + shipping still matches", () => {
  assertInvariant({
    lines: [["BPC-157", 6400, 1], ["TB-500", 8800, 2]],
    shippingId: "priority",
    promoCode: "FOUNDRY10",
    paymentBps: 500,
  });
});

test("many mixed baskets all reconcile exactly", () => {
  const prices = [6400, 8800, 11200, 14500, 5200, 7500, 4200, 11800];
  for (let i = 0; i < prices.length; i++) {
    for (const shippingId of ["standard", "priority"]) {
      for (const promoCode of [null, "FOUNDRY10", "RESEARCH25"]) {
        for (const paymentBps of [0, 500]) {
          assertInvariant({
            lines: [["A", prices[i], (i % 3) + 1], ["B", prices[(i + 3) % prices.length], 1]],
            shippingId,
            promoCode,
            paymentBps,
          });
        }
      }
    }
  }
});

test("rounding: odd-cent prices with a percentage promo still reconcile", () => {
  // 10% of 3 x 3333 = 999.9 -> the server rounds; Stripe must charge the rounded value
  assertInvariant({ lines: [["Odd", 3333, 3]], shippingId: "standard", promoCode: "FOUNDRY10" });
  assertInvariant({ lines: [["Odd", 1, 7]], shippingId: "priority", promoCode: "FOUNDRY10" });
});

test("shipping appears as its own Stripe line item", () => {
  const validated = items(["BPC-157", 6400, 1]);
  const invoice = recalculateInvoice(
    { items: validated, shippingAmount: 1500, taxAmount: 0 }, PROMOS,
  );
  const built = buildStripeCheckoutAmounts({
    items: validated, invoice, currency: "USD", shippingLabel: "Standard Shipping",
  });
  const shippingLine = built.line_items.find((li) => li.price_data.product_data.name === "Standard Shipping");
  assert.ok(shippingLine, "shipping must be an explicit line item");
  assert.equal(shippingLine.price_data.unit_amount, 1500);
});

test("refuses to build when the invoice total disagrees with the parts", () => {
  const validated = items(["BPC-157", 6400, 1]);
  const tampered = {
    ...recalculateInvoice({ items: validated, shippingAmount: 1500, taxAmount: 0 }, PROMOS),
    total_amount: 100, // as if a client had supplied the total
  };
  assert.throws(
    () => buildStripeCheckoutAmounts({ items: validated, invoice: tampered, currency: "USD" }),
    /refusing to charge/,
  );
});

test("refuses pending pricing and non-positive totals", () => {
  assert.throws(
    () => buildStripeCheckoutAmounts({ items: [], invoice: { pricingPending: true }, currency: "USD" }),
    /pending pricing/,
  );
  const zero = recalculateInvoice({ items: items(["Free", 0, 1]), shippingAmount: 0, taxAmount: 0 }, PROMOS);
  assert.throws(
    () => buildStripeCheckoutAmounts({ items: items(["Free", 0, 1]), invoice: zero, currency: "USD" }),
    /non-positive total/,
  );
});

test("assertStripeTotalMatches rejects any mismatch from Stripe itself", () => {
  assert.throws(() => assertStripeTotalMatches(7899, 7900), /amount_total/);
  assert.throws(() => assertStripeTotalMatches(7901, 7900), /amount_total/);
  assert.ok(assertStripeTotalMatches(7900, 7900));
});
