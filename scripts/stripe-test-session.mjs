#!/usr/bin/env node
/**
 * Creates a Stripe TEST Checkout Session and asserts amount_total equals
 * the server-authoritative invoice total. Never prints secret values.
 *
 * Refuses to run against live keys.
 */
import fs from "fs";
import path from "path";
import Stripe from "stripe";
import { buildStripeCheckoutAmounts, assertStripeTotalMatches } from "../src/lib/adapters/stripe-amounts.mjs";
import { recalculateInvoice } from "../src/lib/admin/order-math.mjs";
import { calculateShipping } from "../src/lib/manual-orders/shipping.mjs";
import { stripeSecretMode, stripePublishableMode } from "../src/lib/adapters/stripe-gating.mjs";

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

loadEnv();

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
if (!secret) {
  console.error("FAIL: STRIPE_SECRET_KEY missing");
  process.exit(1);
}

const SHIPPING = [
  { id: "standard", name: "Standard Shipping (3-5 days)", costCents: 1500, freeShippingThresholdCents: 20000 },
];
const PROMOS = [{ code: "FOUNDRY10", discountRateBps: 1000, enabled: true }];

const items = [
  { productName: "BPC-157 Reference Standard", sku: "VF-SKU-991", unit_price_amount: 6400, quantity: 1, price_status: "fixed" },
];
const subtotal = 6400;
const ship = calculateShipping(subtotal, "standard", SHIPPING);
const invoice = recalculateInvoice({ items, shippingAmount: ship.amountCents, taxAmount: 0 }, PROMOS);
const built = buildStripeCheckoutAmounts({ items, invoice, currency: "USD", shippingLabel: ship.label || "Shipping" });

const stripe = new Stripe(secret);
const session = await stripe.checkout.sessions.create({
  mode: "payment",
  payment_method_types: ["card"],
  line_items: built.line_items,
  customer_email: "stripe-test@vialfoundry.com",
  success_url: "https://www.vialfoundry.com/order-confirmation/VF-TEST?session_id={CHECKOUT_SESSION_ID}",
  cancel_url: "https://www.vialfoundry.com/checkout?canceled=1",
  metadata: { purpose: "launch_amount_integrity_test" },
});

try {
  assertStripeTotalMatches(session.amount_total ?? -1, built.expectedTotalCents);
} catch (err) {
  console.error("FAIL amount equality:", err.message);
  process.exit(1);
}

console.log("OK test session created");
console.log("session_id", session.id);
console.log("amount_total_cents", session.amount_total);
console.log("expected_cents", built.expectedTotalCents);
console.log("amount_equality", session.amount_total === built.expectedTotalCents);
console.log("livemode", session.livemode);
console.log("has_url", Boolean(session.url));
