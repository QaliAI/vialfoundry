import { createAdminClient } from "../supabase/admin";

export async function logAdminAudit(params: {
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: any;
  after?: any;
}) {
  try {
    const supabase = createAdminClient();
    if (!supabase) return;

    await supabase.from("admin_audit_log").insert({
      actor_identifier: params.actor,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      before_json: params.before || null,
      after_json: params.after || null,
    });
  } catch (err) {
    console.error("[audit] audit log error:", err);
  }
}
