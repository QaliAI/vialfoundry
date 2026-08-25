import test from "node:test";
import assert from "node:assert/strict";
import { computeFinancialReport } from "../src/lib/admin/reporting.mjs";

test("excludes test and archived orders from collected revenue", () => {
  const orders = [
    { id: "1", status: "paid", total_amount: 10000, is_test: false },
    { id: "2", status: "paid", total_amount: 50000, is_test: true }, // test order
    { id: "3", status: "paid", total_amount: 20000, is_test: false, archived_at: new Date().toISOString() }, // archived
    { id: "4", status: "pending_payment", total_amount: 15000, is_test: false },
    { id: "5", status: "refunded", total_amount: 5000, is_test: false },
    { id: "6", status: "canceled", total_amount: 8000, is_test: false },
  ];

  const report = computeFinancialReport(orders);

  assert.equal(report.netCollectedRevenueCents, 10000);
  assert.equal(report.netCollectedRevenueDollars, "100.00");
  assert.equal(report.paidOrdersCount, 1);
  assert.equal(report.pendingPaymentTotalCents, 15000);
  assert.equal(report.pendingOrdersCount, 1);
  assert.equal(report.refundedTotalCents, 5000);
  assert.equal(report.cancelledOrdersCount, 1);
  assert.equal(report.testOrdersCount, 1);
  assert.equal(report.totalOrdersCount, 6);
});
