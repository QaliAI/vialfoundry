import { isOrderReportableAsRevenue, isOrderPendingPayment, isCancelledStatus } from "./order-classification.mjs";

export function computeFinancialReport(orders = []) {
  let netCollectedRevenueCents = 0;
  let pendingPaymentTotalCents = 0;
  let refundedTotalCents = 0;
  let paidOrdersCount = 0;
  let pendingOrdersCount = 0;
  let cancelledOrdersCount = 0;
  let testOrdersCount = 0;
  let totalOrdersCount = 0;

  for (const order of orders) {
    totalOrdersCount++;

    if (order.is_test) {
      testOrdersCount++;
      continue;
    }
    if (order.archived_at) {
      continue;
    }

    const status = String(order.status || "").toLowerCase();
    const amount = Number(order.total_amount) || 0;

    if (isOrderReportableAsRevenue(order)) {
      netCollectedRevenueCents += amount;
      paidOrdersCount++;
    } else if (isOrderPendingPayment(order)) {
      pendingPaymentTotalCents += amount;
      pendingOrdersCount++;
    } else if (status === "refunded") {
      refundedTotalCents += amount;
    } else if (isCancelledStatus(status)) {
      cancelledOrdersCount++;
    }
  }

  return {
    netCollectedRevenueCents,
    pendingPaymentTotalCents,
    refundedTotalCents,
    paidOrdersCount,
    pendingOrdersCount,
    cancelledOrdersCount,
    testOrdersCount,
    totalOrdersCount,
    netCollectedRevenueDollars: (netCollectedRevenueCents / 100).toFixed(2),
    pendingPaymentTotalDollars: (pendingPaymentTotalCents / 100).toFixed(2),
    refundedTotalDollars: (refundedTotalCents / 100).toFixed(2),
  };
}
