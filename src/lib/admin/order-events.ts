import { createAdminClient } from "../supabase/admin";

/**
 * Append-only order timeline.
 *
 * Every meaningful change to an order writes a row here: who did it, when, and
 * what changed. This is what customer service and payment disputes are argued
 * from, so writes are best-effort and must never break the operation that
 * triggered them — a failed audit write is logged, not thrown.
 */

export type OrderEventType =
  | "order_created"
  | "checkout_session_created"
  | "checkout_expired"
  | "payment_succeeded"
  | "payment_failed"
  | "status_changed"
  | "tracking_added"
  | "email_sent"
  | "email_failed"
  | "refund_initiated"
  | "refund_completed"
  | "note_added"
  | "inventory_adjusted";

export interface OrderEventInput {
  orderId: string;
  type: OrderEventType;
  /** Admin email, "system", "stripe-webhook", "customer". */
  actor?: string;
  message?: string;
  metadata?: Record<string, unknown>;
}

export async function recordOrderEvent(input: OrderEventInput): Promise<void> {
  try {
    const supabase = createAdminClient();
    if (!supabase) return;

    const { error } = await supabase.from("order_events").insert({
      manual_order_id: input.orderId,
      event_type: input.type,
      actor: input.actor || "system",
      message: input.message || null,
      metadata: input.metadata || {},
    });

    if (error) {
      console.error(`[order-events] failed to record ${input.type} for ${input.orderId}:`, error.message);
    }
  } catch (err) {
    console.error(`[order-events] exception recording ${input.type}:`, err);
  }
}

export interface OrderEvent {
  id: string;
  event_type: string;
  actor: string;
  message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export async function fetchOrderEvents(orderId: string): Promise<OrderEvent[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("order_events")
    .select("id, event_type, actor, message, metadata, created_at")
    .eq("manual_order_id", orderId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[order-events] fetch failed:", error.message);
    return [];
  }
  return (data as OrderEvent[]) || [];
}
