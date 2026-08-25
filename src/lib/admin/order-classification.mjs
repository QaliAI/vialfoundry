export const MANUAL_ORDER_STATUSES = [
  "new",
  "invoice_sent",
  "pending_payment",
  "paid",
  "preparing",
  "shipped",
  "fulfilled",
  "canceled",
  "cancelled",
  "refunded",
];

export const VALID_STATUS_TRANSITIONS = {
  new: ["invoice_sent", "pending_payment", "paid", "canceled", "cancelled"],
  invoice_sent: ["pending_payment", "paid", "canceled", "cancelled"],
  pending_payment: ["paid", "canceled", "cancelled"],
  paid: ["preparing", "shipped", "fulfilled", "refunded"],
  preparing: ["shipped", "fulfilled", "refunded"],
  shipped: ["fulfilled", "refunded"],
  fulfilled: ["refunded"],
  canceled: [],
  cancelled: [],
  refunded: [],
};

export function isCancelledStatus(status) {
  const norm = String(status || "").toLowerCase();
  return norm === "canceled" || norm === "cancelled";
}

export function isValidStatusTransition(currentStatus, nextStatus) {
  const cur = String(currentStatus || "").toLowerCase();
  const next = String(nextStatus || "").toLowerCase();

  if (cur === next) return true; // Idempotent same-status update
  const allowed = VALID_STATUS_TRANSITIONS[cur] || [];
  return allowed.includes(next);
}

export function isOrderReportableAsRevenue(order) {
  if (!order || order.is_test || order.archived_at) return false;
  const status = String(order.status || "").toLowerCase();
  return ["paid", "preparing", "shipped", "fulfilled"].includes(status);
}

export function isOrderPendingPayment(order) {
  if (!order || order.is_test || order.archived_at) return false;
  const status = String(order.status || "").toLowerCase();
  return ["new", "invoice_sent", "pending_payment"].includes(status);
}
