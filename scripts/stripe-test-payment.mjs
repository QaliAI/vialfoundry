#!/usr/bin/env node
/**
 * Stripe TEST-mode payment + webhook signature checks.
 * Refuses live keys. Never prints secrets.
 */
import fs from "fs";
import path from "path";
import Stripe from "stripe";
import { stripeSecretMode } from "../src/lib/adapters/stripe-gating.mjs";

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

if (stripeSecretMode(process.env) !== "test") {
  console.error("REFUSED: not test mode");
  process.exit(1);
}

const secret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!secret) {
  console.error("FAIL: STRIPE_SECRET_KEY missing");
  process.exit(1);
}

const stripe = new Stripe(secret);
const results = {
  payment: false,
  declined: false,
  refund: false,
  webhookValid: false,
  webhookInvalid: false,
};

// Successful test card.
const ok = await stripe.paymentIntents.create({
  amount: 7900,
  currency: "usd",
  payment_method: "pm_card_visa",
  confirm: true,
  automatic_payment_methods: { enabled: true, allow_redirects: "never" },
  metadata: { purpose: "launch_test_payment" },
});
results.payment = ok.status === "succeeded" && ok.amount === 7900 && ok.livemode === false;
console.log("payment_status", ok.status);
console.log("payment_amount", ok.amount);
console.log("payment_livemode", ok.livemode);

// Declined test card.
try {
  await stripe.paymentIntents.create({
    amount: 7900,
    currency: "usd",
    payment_method: "pm_card_chargeDeclined",
    confirm: true,
    automatic_payment_methods: { enabled: true, allow_redirects: "never" },
  });
  console.log("declined_unexpected_success");
} catch (err) {
  results.declined = /declined|card_declined|generic_decline/i.test(err.message || err.code || "");
  console.log("declined_error_code", err.code || err.raw?.code || "set");
}

if (ok.id) {
  const refund = await stripe.refunds.create({ payment_intent: ok.id });
  results.refund = refund.status === "succeeded" || refund.status === "pending";
  console.log("refund_status", refund.status);
  console.log("refund_amount", refund.amount);
}

if (webhookSecret) {
  const payload = JSON.stringify({
    id: "evt_launch_test",
    object: "event",
    type: "payment_intent.succeeded",
    data: { object: { id: ok.id, metadata: { orderId: "test" } } },
  });
  const validHeader = stripe.webhooks.generateTestHeaderString({ payload, secret: webhookSecret });
  try {
    stripe.webhooks.constructEvent(payload, validHeader, webhookSecret);
    results.webhookValid = true;
    console.log("webhook_valid_signature", true);
  } catch (err) {
    console.log("webhook_valid_signature", false);
  }
  try {
    stripe.webhooks.constructEvent(payload, "t=1,v1=deadbeef", webhookSecret);
    console.log("webhook_invalid_accepted", true);
  } catch {
    results.webhookInvalid = true;
    console.log("webhook_invalid_rejected", true);
  }
} else {
  console.log("webhook_secret_missing");
}

const all = results.payment && results.declined && results.refund && results.webhookValid && results.webhookInvalid;
console.log("RESULTS", JSON.stringify(results));
process.exit(all ? 0 : 1);
