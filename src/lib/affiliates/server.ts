import { createAdminClient } from "../supabase/admin";
import { resolveAliasCode, normalizeAffiliateCode, DEFAULT_AFFILIATE_COMMISSION_RATE_BPS } from "./utils.mjs";
import { getBrandConfig } from "../../config/brand";

export interface ResolvedAffiliate {
  id: string;
  code: string;
  name: string;
  email?: string;
  commissionRateBps: number;
  status: string;
}

export async function lookupAffiliateByCode(rawCode?: string | null): Promise<ResolvedAffiliate | null> {
  if (!rawCode) return null;

  const normalized = normalizeAffiliateCode(rawCode);
  const resolvedCode = resolveAliasCode(normalized);
  const brand = getBrandConfig();
  const defaultRate = brand.affiliateSettings?.defaultCommissionRateBps || DEFAULT_AFFILIATE_COMMISSION_RATE_BPS;

  try {
    const supabase = createAdminClient();
    if (!supabase) {
      // Fallback in-memory
      return {
        id: `mock-${resolvedCode.toLowerCase()}`,
        code: resolvedCode,
        name: resolvedCode,
        commissionRateBps: defaultRate,
        status: "active",
      };
    }

    // 1. Direct affiliate lookup
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("*")
      .ilike("referral_code", resolvedCode)
      .single();

    if (affiliate) {
      const rateBps = affiliate.commission_rate_bps || (affiliate.commission_rate ? Math.round(affiliate.commission_rate * 100) : defaultRate);
      return {
        id: affiliate.id,
        code: affiliate.referral_code || resolvedCode,
        name: affiliate.name || resolvedCode,
        email: affiliate.email,
        commissionRateBps: rateBps,
        status: affiliate.status || (affiliate.active ? "active" : "paused"),
      };
    }

    // 2. Alias lookup
    const { data: alias } = await supabase
      .from("affiliate_aliases")
      .select("*, affiliates(*)")
      .ilike("alias_code", resolvedCode)
      .single();

    if (alias?.affiliates) {
      const parent = alias.affiliates;
      const rateBps = parent.commission_rate_bps || (parent.commission_rate ? Math.round(parent.commission_rate * 100) : defaultRate);
      return {
        id: parent.id,
        code: parent.referral_code || resolvedCode,
        name: parent.name || resolvedCode,
        email: parent.email,
        commissionRateBps: rateBps,
        status: parent.status || "active",
      };
    }

    return null;
  } catch (err) {
    console.error("[affiliates] lookup error:", err);
    return null;
  }
}
