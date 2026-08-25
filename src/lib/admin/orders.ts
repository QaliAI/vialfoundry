import { createAdminClient } from "../supabase/admin";
import { isValidStatusTransition, isCancelledStatus } from "./order-classification.mjs";
import { recalculateInvoice } from "./order-math.mjs";
import { logAdminAudit } from "./audit";

export async function fetchAdminOrders(options: {
  includeArchived?: boolean;
  status?: string;
} = {}) {
  const supabase = createAdminClient();
  if (!supabase) return [];

  let query = supabase
    .from("manual_orders")
    .select(`
      *,
      manual_order_items(*),
      affiliates(*)
    `)
    .order("created_at", { ascending: false });

  if (!options.includeArchived) {
    query = query.is("archived_at", null);
  }
  if (options.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[admin/orders] fetch error:", error);
    return [];
  }
  return data || [];
}

export async function updateAdminOrderStatus(params: {
  orderId: string;
  nextStatus: string;
  actor: string;
  trackingNumber?: string;
  notes?: string;
}) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase admin client unavailable");

  // 1. Get current order
  const { data: order, error: fetchErr } = await supabase
    .from("manual_orders")
    .select("*")
    .eq("id", params.orderId)
    .single();

  if (fetchErr || !order) {
    throw new Error(`Order ${params.orderId} not found`);
  }

  // 2. Validate transition
  if (!isValidStatusTransition(order.status, params.nextStatus)) {
    throw new Error(`Invalid status transition from "${order.status}" to "${params.nextStatus}"`);
  }

  const updates: Record<string, any> = {
    status: params.nextStatus,
    updated_at: new Date().toISOString(),
  };

  if (params.trackingNumber !== undefined) {
    updates.tracking_number = params.trackingNumber;
  }
  if (params.notes !== undefined) {
    updates.notes = params.notes;
  }

  // 3. Update order
  const { data: updated, error: updateErr } = await supabase
    .from("manual_orders")
    .update(updates)
    .eq("id", params.orderId)
    .select()
    .single();

  if (updateErr) {
    throw new Error(`Failed to update order: ${updateErr.message}`);
  }

  // 4. Audit log
  await logAdminAudit({
    actor: params.actor,
    action: "ORDER_STATUS_UPDATE",
    entityType: "manual_order",
    entityId: params.orderId,
    before: { status: order.status, tracking_number: order.tracking_number },
    after: { status: params.nextStatus, tracking_number: updates.tracking_number },
  });

  return updated;
}

export async function performBulkOrderAction(params: {
  orderIds: string[];
  action: "mark_test" | "unmark_test" | "archive" | "unarchive" | "set_status";
  statusValue?: string;
  actor: string;
}) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase admin client unavailable");

  const results: { orderId: string; success: boolean; error?: string }[] = [];

  for (const id of params.orderIds) {
    try {
      if (params.action === "mark_test") {
        await supabase.from("manual_orders").update({ is_test: true }).eq("id", id);
      } else if (params.action === "unmark_test") {
        await supabase.from("manual_orders").update({ is_test: false }).eq("id", id);
      } else if (params.action === "archive") {
        await supabase.from("manual_orders").update({ archived_at: new Date().toISOString() }).eq("id", id);
      } else if (params.action === "unarchive") {
        await supabase.from("manual_orders").update({ archived_at: null }).eq("id", id);
      } else if (params.action === "set_status" && params.statusValue) {
        await updateAdminOrderStatus({
          orderId: id,
          nextStatus: params.statusValue,
          actor: params.actor,
        });
      }
      results.push({ orderId: id, success: true });
    } catch (err: any) {
      results.push({ orderId: id, success: false, error: err.message });
    }
  }

  return results;
}
