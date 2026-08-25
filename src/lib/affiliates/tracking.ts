import { createAdminClient } from "../supabase/admin";
import { resolveAliasCode, normalizeAffiliateCode } from "./utils.mjs";

export async function logAffiliateClick(code: string, metadata: Record<string, any> = {}) {
  try {
    const supabase = createAdminClient();
    if (!supabase) return;

    const normalized = normalizeAffiliateCode(code);
    const resolvedCode = resolveAliasCode(normalized);

    // Look up affiliate
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id")
      .ilike("referral_code", resolvedCode)
      .single();

    if (affiliate?.id) {
      await supabase.from("affiliate_clicks").insert({
        affiliate_id: affiliate.id,
        raw_code: code,
        resolved_code: resolvedCode,
        ip_hash: metadata.ipHash || null,
        user_agent: metadata.userAgent || null,
        referer: metadata.referer || null,
      });
    }
  } catch (err) {
    console.error("[affiliate] error logging click:", err);
  }
}
