export function getDashboardMetrics(orders = [], products = [], batches = []) {
  let activeProducts = products.length;
  let verifiedBatches = batches.length;
  let lowStockCount = 0;

  for (const p of products) {
    if ((p.stockCount ?? p.inventory_quantity ?? 100) < 50) {
      lowStockCount++;
    }
  }

  let pendingActionOrders = 0;
  let paidOrders = 0;

  for (const o of orders) {
    if (o.is_test || o.archived_at) continue;
    const status = String(o.status || "").toLowerCase();
    if (["new", "invoice_sent", "pending_payment"].includes(status)) {
      pendingActionOrders++;
    } else if (["paid", "preparing", "shipped", "fulfilled"].includes(status)) {
      paidOrders++;
    }
  }

  return {
    activeProducts,
    verifiedBatches,
    lowStockCount,
    pendingActionOrders,
    paidOrders,
  };
}
