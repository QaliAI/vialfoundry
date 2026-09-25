export const MANUAL_ORDER_STATUSES = [
  "new",
  "invoice_sent",
  "pending_payment",
  "paid",
  "waiting_inventory",
  "waiting_documentation",
  "preparing",
  "packed",
  "shipped",
  "fulfilled",
  "canceled",
  "cancelled",
  "refunded",
];

export const PAYMENT_STATUSES = [
  "unpaid",
  "paid",
  "failed",
  "expired",
  "refunded",
  "partially_refunded",
];

export const VALID_STATUS_TRANSITIONS = {
  new: ["invoice_sent", "pending_payment", "paid", "canceled", "cancelled"],
  invoice_sent: ["pending_payment", "paid", "canceled", "cancelled"],
  pending_payment: ["paid", "canceled", "cancelled"],
  paid: [
    "waiting_inventory",
    "waiting_documentation",
    "preparing",
    "packed",
    "shipped",
    "fulfilled",
    "refunded",
    "canceled",
    "cancelled",
  ],
  waiting_inventory: [
    "paid",
    "waiting_documentation",
    "preparing",
    "packed",
    "shipped",
    "refunded",
    "canceled",
    "cancelled",
  ],
  waiting_documentation: [
    "paid",
    "waiting_inventory",
    "preparing",
    "packed",
    "shipped",
    "refunded",
    "canceled",
    "cancelled",
  ],
  preparing: ["waiting_inventory", "waiting_documentation", "packed", "shipped", "fulfilled", "refunded"],
  packed: ["shipped", "fulfilled", "refunded"],
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
  return [
    "paid",
    "waiting_inventory",
    "waiting_documentation",
    "preparing",
    "packed",
    "shipped",
    "fulfilled",
  ].includes(status);
}

export function isOrderPendingPayment(order) {
  if (!order || order.is_test || order.archived_at) return false;
  const status = String(order.status || "").toLowerCase();
  return ["new", "invoice_sent", "pending_payment"].includes(status);
}

export const FULFILLMENT_QUEUES = [
  { id: "PAID_NEEDS_FULFILLMENT", label: "PAID — NEEDS FULFILLMENT" },
  { id: "WAITING_ON_INVENTORY", label: "WAITING ON INVENTORY" },
  { id: "WAITING_ON_DOCUMENTATION", label: "WAITING ON DOCUMENTATION" },
  { id: "SHIPPED", label: "SHIPPED" },
  { id: "DELIVERED_COMPLETED", label: "DELIVERED/COMPLETED" },
  { id: "REFUND_EXCEPTION", label: "REFUND/EXCEPTION" },
];

/**
 * Classifies an order into exactly one operational fulfillment exception queue.
 *
 * @param {object} order
 * @returns {"PAID_NEEDS_FULFILLMENT" | "WAITING_ON_INVENTORY" | "WAITING_ON_DOCUMENTATION" | "SHIPPED" | "DELIVERED_COMPLETED" | "REFUND_EXCEPTION" | "AWAITING_PAYMENT"}
 */
export function classifyFulfillmentQueue(order) {
  if (!order) return "AWAITING_PAYMENT";

  const status = String(order.status || "").toLowerCase();
  const paymentStatus = String(order.payment_status || "").toLowerCase();
  const hasRefund = Number(order.amount_refunded || 0) > 0 || paymentStatus.includes("refund");

  // 1. Exceptions & Refunds
  if (
    status === "refunded" ||
    isCancelledStatus(status) ||
    paymentStatus === "failed" ||
    hasRefund
  ) {
    return "REFUND_EXCEPTION";
  }

  // 2. Delivered / Completed
  if (status === "fulfilled" || status === "delivered" || status === "completed") {
    return "DELIVERED_COMPLETED";
  }

  // 3. Shipped
  if (status === "shipped") {
    return "SHIPPED";
  }

  // 4. Waiting on Inventory (explicit status or flagged oversell)
  if (
    status === "waiting_inventory" ||
    order.inventory_status === "oversell" ||
    order.has_oversell === true
  ) {
    return "WAITING_ON_INVENTORY";
  }

  // 5. Waiting on Documentation
  if (status === "waiting_documentation" || order.documentation_status === "pending") {
    return "WAITING_ON_DOCUMENTATION";
  }

  // 6. Paid — Needs Fulfillment
  if (paymentStatus === "paid" || ["paid", "preparing", "packed"].includes(status)) {
    return "PAID_NEEDS_FULFILLMENT";
  }

  // 7. Awaiting Payment
  return "AWAITING_PAYMENT";
}
