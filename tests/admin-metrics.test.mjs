import test from "node:test";
import assert from "node:assert/strict";
import {
  computeDashboardMetrics, netCollectedCents, computePendingCommissionCents,
  revenueByDay, revenueByPaymentMethod, topProducts, isCountableOrder,
} from "../src/lib/admin/metrics.mjs";

const NOW = new Date("2026-09-10T12:00:00Z");
const today = "2026-09-10T09:00:00Z";
const yesterday = "2026-09-09T09:00:00Z";

const o = (over = {}) => ({
  id: "o", is_test: false, archived_at: null, payment_status: "paid", status: "paid",
  total_amount: 10000, amount_refunded: 0, paid_at: today, shipped_at: null,
  affiliate_status: null, affiliate_commission_amount: 0, payment_provider: "stripe", ...over,
});

test("test and archived orders never count toward revenue", () => {
  assert.equal(isCountableOrder(o({ is_test: true })), false);
  assert.equal(isCountableOrder(o({ archived_at: today })), false);
  const m = computeDashboardMetrics([o({ is_test: true }), o({ archived_at: today })], NOW);
  assert.equal(m.netRevenueCents, 0);
  assert.equal(m.paidOrders, 0);
});

test("unpaid orders contribute no revenue but are counted as awaiting payment", () => {
  const m = computeDashboardMetrics([o({ payment_status: "unpaid", status: "pending_payment" })], NOW);
  assert.equal(m.netRevenueCents, 0);
  assert.equal(m.awaitingPayment, 1);
  assert.equal(m.paidOrders, 0);
});

test("refunds are subtracted from collected revenue", () => {
  assert.equal(netCollectedCents(o({ amount_refunded: 2500, payment_status: "partially_refunded" })), 7500);
  assert.equal(netCollectedCents(o({ amount_refunded: 10000, payment_status: "refunded" })), 0);
});

test("a fully refunded order stops counting as revenue", () => {
  const m = computeDashboardMetrics([o({ payment_status: "refunded", status: "refunded", amount_refunded: 10000 })], NOW);
  assert.equal(m.netRevenueCents, 0);
  assert.equal(m.paidOrders, 0);
});

test("today's revenue only includes orders paid today", () => {
  const m = computeDashboardMetrics([o({ paid_at: today }), o({ paid_at: yesterday })], NOW);
  assert.equal(m.todayRevenueCents, 10000);
  assert.equal(m.netRevenueCents, 20000);
});

test("orders to fulfil are paid but not yet shipped", () => {
  const m = computeDashboardMetrics([
    o({ status: "paid" }), o({ status: "preparing" }), o({ status: "packed" }),
    o({ status: "shipped" }), o({ status: "fulfilled" }),
  ], NOW);
  assert.equal(m.toFulfil, 3);
});

test("shipped today counts only today's dispatches", () => {
  const m = computeDashboardMetrics([
    o({ status: "shipped", shipped_at: today }), o({ status: "shipped", shipped_at: yesterday }),
  ], NOW);
  assert.equal(m.shippedToday, 1);
});

test("average order value divides collected revenue by paid orders", () => {
  const m = computeDashboardMetrics([o({ total_amount: 10000 }), o({ total_amount: 20000 })], NOW);
  assert.equal(m.averageOrderValueCents, 15000);
});

test("empty input produces honest zeros, not fabricated numbers", () => {
  const m = computeDashboardMetrics([], NOW);
  assert.equal(m.netRevenueCents, 0);
  assert.equal(m.averageOrderValueCents, 0);
  assert.equal(m.totalCountableOrders, 0);
});

test("commission is only pending on orders that were actually paid", () => {
  const paidWithAff = o({ affiliate_status: "pending_payout", affiliate_commission_amount: 1000 });
  const unpaidWithAff = o({ payment_status: "unpaid", affiliate_status: "pending_payout", affiliate_commission_amount: 9999 });
  const reversed = o({ affiliate_status: "reversed", affiliate_commission_amount: 5000 });
  assert.equal(computePendingCommissionCents([paidWithAff, unpaidWithAff, reversed]), 1000);
});

test("revenue by day buckets only paid orders into the right date", () => {
  const days = revenueByDay([o({ paid_at: today }), o({ paid_at: yesterday }), o({ payment_status: "unpaid" })], 7, NOW);
  assert.equal(days.length, 7);
  assert.equal(days[days.length - 1].date, "2026-09-10");
  assert.equal(days[days.length - 1].revenueCents, 10000);
  assert.equal(days[days.length - 2].revenueCents, 10000);
});

test("revenue by payment method splits providers", () => {
  const rows = revenueByPaymentMethod([
    o({ payment_provider: "stripe" }), o({ payment_provider: "stripe" }),
    o({ payment_provider: "manual_invoice", total_amount: 5000 }),
  ]);
  assert.equal(rows[0].method, "stripe");
  assert.equal(rows[0].revenueCents, 20000);
  assert.equal(rows[1].revenueCents, 5000);
});

test("top products rank by collected revenue and ignore unpaid orders", () => {
  const paid = o({ id: "p1" });
  const unpaid = o({ id: "p2", payment_status: "unpaid" });
  const items = {
    p1: [{ sku: "A", product_name: "BPC-157", quantity: 2, line_total_amount: 12800 }],
    p2: [{ sku: "B", product_name: "TB-500", quantity: 9, line_total_amount: 99999 }],
  };
  const top = topProducts([paid, unpaid], items);
  assert.equal(top.length, 1);
  assert.equal(top[0].sku, "A");
  assert.equal(top[0].units, 2);
});
