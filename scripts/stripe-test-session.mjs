#!/usr/bin/env node
/**
 * Stripe Checkout amount-integrity QA.
 *
 * Creates a Stripe TEST Checkout Session for a real catalogue SKU and asserts
 *
 *     Stripe amount_total === server-authoritative invoice total
 *
 * exactly, to the cent — the same invariant `stripe-amounts.mjs` enforces in
 * production.
 *
 * NOTHING HERE IS HARD-CODED. Price, shipping, the free-shipping threshold and
 * promotions are all read from the same authoritative modules the production
 * checkout route reads:
 *
 *   price / purchasability  src/data/products.ts        (via checkout-catalog)
 *   shipping + threshold    src/config/brand.ts         (via calculateShipping)
 *   promotions              src/config/brand.ts         (via recalculateInvoice)
 *
 * So if launch economics change, this script tracks them automatically; and if
 * the catalogue and the charge ever disagree, it fails instead of passing on a
 * stale constant. It also refuses to build a charge for a SKU that the public
 * checkout route would itself refuse.
 *
 * Refuses to run against live keys. Never prints secret values.
 *
 * Usage:
 *   node scripts/stripe-test-session.mjs
 *   node scripts/stripe-test-session.mjs --sku VF-SKU-1038 --qty 2
 *   node scripts/stripe-test-session.mjs --sku VF-SKU-1033 --shipping priority --promo FOUNDRY10
 */
import fs from "fs";
import path from "path";
import Stripe from "stripe";
import { buildStripeCheckoutAmounts, assertStripeTotalMatches } from "../src/lib/adapters/stripe-amounts.mjs";
import { recalculateInvoice } from "../src/lib/admin/order-math.mjs";
import { calculateShipping } from "../src/lib/manual-orders/shipping.mjs";
import { stripeSecretMode, stripePublishableMode } from "../src/lib/adapters/stripe-gating.mjs";
import { validateCheckoutItem, isPubliclyPurchasable } from "../src/lib/manual-orders/checkout-catalog.mjs";
import { vialFoundryBrandConfig } from "../src/config/brand.ts";
import { PRODUCTS } from "../src/data/products.ts";

/** Default QA subject: the cheapest publicly purchasable SKU, so the QA charge
 *  is always the smallest one the live catalogue can produce. */
const DEFAULT_SKU = null;

function loadEnv() {
  const envPath = path.resolve(".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const idx = t.indexOf("=");
    const key = t.slice(0, idx).trim();
    const val = t.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

loadEnv();

// ---------------------------------------------------------------- key safety
// Unchanged safeguard: this script must never touch live money.
const mode = stripeSecretMode(process.env);
const pubMode = stripePublishableMode(process.env);
if (mode !== "test") {
  console.error("REFUSED: STRIPE_SECRET_KEY is not a test key. Aborting.");
  process.exit(1);
}
if (pubMode && pubMode !== "test") {
  console.error("REFUSED: publishable key is not test mode. Aborting.");
  process.exit(1);
}

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) fail("STRIPE_SECRET_KEY missing");

// ------------------------------------------------- authoritative configuration
const shippingOptions = vialFoundryBrandConfig.shippingOptions;
const promotions = vialFoundryBrandConfig.promotions;
const currency = vialFoundryBrandConfig.currency || "USD";

if (!Array.isArray(shippingOptions) || shippingOptions.length === 0) {
  fail("brand config exposes no shipping options — cannot derive shipping cost");
}
if (!Array.isArray(promotions)) {
  fail("brand config exposes no promotions array — cannot derive discounts");
}

const shippingMethodId = arg("shipping", "standard");
const shippingOption = shippingOptions.find((o) => o.id === shippingMethodId);
if (!shippingOption) {
  fail(
    `shipping method "${shippingMethodId}" is not in the brand configuration ` +
      `(have: ${shippingOptions.map((o) => o.id).join(", ")})`,
  );
}

// ------------------------------------------------------------- catalogue SKU
const requestedSku = arg("sku", DEFAULT_SKU);
const purchasable = PRODUCTS.filter(isPubliclyPurchasable);
if (purchasable.length === 0) fail("no publicly purchasable products in the catalogue");

const product = requestedSku
  ? PRODUCTS.find((p) => String(p.sku || "").toUpperCase() === requestedSku.toUpperCase())
  : purchasable.reduce((cheapest, p) => (p.price < cheapest.price ? p : cheapest), purchasable[0]);

if (!product) fail(`SKU "${requestedSku}" is not in the authoritative catalogue`);

const quantity = Math.max(1, Math.round(Number(arg("qty", "1"))));

// Resolve through the SAME validator the public checkout route uses, so this
// script cannot charge for something production would reject.
const validated = validateCheckoutItem(
  { productId: product.id, sku: product.sku, quantity },
  PRODUCTS,
);
if (!validated.ok) {
  fail(`the public checkout route would reject ${product.sku}: ${validated.error}`);
}

const items = [
  {
    productName: `${product.displayName || product.name} — ${product.displaySize || product.size}`,
    sku: product.sku,
    quantity: validated.quantity,
    unit_price_amount: validated.unit_price_amount,
    line_total_amount: validated.line_total_amount,
    price_status: "fixed",
  },
];

// The unit price must equal the catalogue price. A drift here means the
// catalogue and the charge have diverged.
const catalogCents = Math.round(Number(product.price) * 100);
if (validated.unit_price_amount !== catalogCents) {
  fail(
    `catalogue price drift for ${product.sku}: checkout resolved ` +
      `${validated.unit_price_amount} cents but the catalogue lists ${catalogCents}`,
  );
}

// ------------------------------------------------------ server-authoritative math
const subtotal = validated.line_total_amount;
const shipping = calculateShipping(subtotal, shippingMethodId, shippingOptions);
const promoCode = arg("promo", null);

const invoice = recalculateInvoice(
  { items, promoCode, shippingAmount: shipping.amountCents, taxAmount: 0 },
  promotions,
);
if (invoice.pricingPending) fail("invoice pricing is pending — refusing to charge");

// Re-derive shipping independently of calculateShipping and require agreement,
// so a regression in either the brand config or the shipping rule is caught
// rather than silently charged.
const threshold =
  shippingOption.freeShippingThresholdCents ?? Number.POSITIVE_INFINITY;
const expectedShipping =
  shippingOption.id === "standard" && subtotal >= threshold
    ? 0
    : shippingOption.costCents ?? shippingOption.priceCents ?? 0;
if (shipping.amountCents !== expectedShipping) {
  fail(
    `shipping math diverged for "${shippingMethodId}": calculateShipping returned ` +
      `${shipping.amountCents} but the brand configuration implies ${expectedShipping} ` +
      `(subtotal ${subtotal}, free-shipping threshold ${threshold})`,
  );
}
if (invoice.shipping_amount !== shipping.amountCents) {
  fail(
    `invoice shipping ${invoice.shipping_amount} != resolved shipping ${shipping.amountCents}`,
  );
}

// If a promo code was requested it must actually have been applied; a silently
// ignored code would otherwise let a wrong total pass unnoticed.
if (promoCode && !invoice.promo_code) {
  fail(`promo code "${promoCode}" was not accepted by the promotions configuration`);
}
if (promoCode && invoice.discount_amount <= 0) {
  fail(`promo code "${promoCode}" applied but produced a zero discount`);
}

const built = buildStripeCheckoutAmounts({
  items,
  invoice,
  currency,
  shippingLabel: shippingOption.name || shipping.label || "Shipping",
});

if (built.expectedTotalCents !== invoice.total_amount) {
  fail(
    `built total ${built.expectedTotalCents} != server invoice total ${invoice.total_amount}`,
  );
}

// ------------------------------------------------------------------- Stripe
const stripe = new Stripe(secret);
const session = await stripe.checkout.sessions.create({
  mode: "payment",
  payment_method_types: ["card"],
  line_items: built.line_items,
  ...(built.discountCents > 0
    ? {
        discounts: [
          {
            coupon: (
              await stripe.coupons.create({
                amount_off: built.discountCents,
                currency: currency.toLowerCase(),
                duration: "once",
                name: invoice.promo_code ? `Discount (${invoice.promo_code})` : "Order discount",
              })
            ).id,
          },
        ],
      }
    : {}),
  customer_email: "stripe-test@vialfoundry.com",
  success_url: "https://www.vialfoundry.com/order-confirmation/VF-TEST?session_id={CHECKOUT_SESSION_ID}",
  cancel_url: "https://www.vialfoundry.com/checkout?canceled=1",
  metadata: { purpose: "launch_amount_integrity_test", sku: product.sku },
});

try {
  assertStripeTotalMatches(session.amount_total ?? -1, built.expectedTotalCents);
} catch (err) {
  console.error("FAIL amount equality:", err.message);
  process.exit(1);
}

if (session.livemode !== false) {
  fail("Stripe returned a livemode session from a test key — aborting");
}

console.log("OK test session created");
console.log("sku", product.sku);
console.log("product", `${product.displayName || product.name} — ${product.displaySize || product.size}`);
console.log("quantity", validated.quantity);
console.log("unit_price_cents", validated.unit_price_amount, "(catalogue authority)");
console.log("shipping_method", shippingMethodId);
console.log("shipping_cents", invoice.shipping_amount, "(brand configuration authority)");
console.log("free_shipping_threshold_cents", Number.isFinite(threshold) ? threshold : "n/a");
console.log("promo_code", invoice.promo_code || "(none)");
console.log("discount_cents", invoice.discount_amount || 0);
console.log("session_id", session.id);
console.log("amount_total_cents", session.amount_total);
console.log("expected_cents", built.expectedTotalCents);
console.log("amount_equality", session.amount_total === built.expectedTotalCents);
console.log("livemode", session.livemode);
console.log("has_url", Boolean(session.url));
