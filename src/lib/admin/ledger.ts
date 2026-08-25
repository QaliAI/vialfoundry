export function calculateLedgerSummary(orders: any[] = [], affiliates: any[] = []) {
  let grossSalesCents = 0;
  let netSalesCents = 0;
  let totalCommissionsCents = 0;
  let pendingPayoutsCents = 0;
  let paidPayoutsCents = 0;

  for (const order of orders) {
    if (order.is_test || order.archived_at) continue;
    const status = String(order.status || "").toLowerCase();
    const isPaid = ["paid", "preparing", "shipped", "fulfilled"].includes(status);
    if (isPaid) {
      grossSalesCents += Number(order.total_amount) || 0;
      netSalesCents += Number(order.subtotal_amount) || 0;
      if (order.affiliate_commission_amount) {
        totalCommissionsCents += Number(order.affiliate_commission_amount) || 0;
        if (order.affiliate_status === "paid") {
          paidPayoutsCents += Number(order.affiliate_commission_amount) || 0;
        } else {
          pendingPayoutsCents += Number(order.affiliate_commission_amount) || 0;
        }
      }
    }
  }

  return {
    grossSalesCents,
    netSalesCents,
    totalCommissionsCents,
    pendingPayoutsCents,
    paidPayoutsCents,
  };
}
