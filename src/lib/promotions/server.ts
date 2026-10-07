import { getBrandConfig } from "@/config/brand";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  normalizePromoCode,
  resolvePromoCodeWithConfig,
  checkFirstOrderEligibility,
} from "./promotions.mjs";

export interface PromotionRecord {
  id?: string;
  code: string;
  name: string;
  description?: string | null;
  discount_type: "percentage" | "fixed_amount";
  discount_rate_bps: number;
  fixed_discount_cents: number;
  minimum_subtotal_cents: number;
  first_order_only: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  enabled: boolean;
  max_total_uses?: number | null;
  max_uses_per_customer?: number | null;
  times_used?: number;
  banner_enabled: boolean;
  banner_message?: string | null;
  banner_cta?: string | null;
  affiliate_stack_policy: "exclusive" | "allow_override";
  affiliate_commission_override_bps?: number | null;
}

export interface PromotionValidationResult {
  valid: boolean;
  code: string | null;
  name?: string;
  description?: string | null;
  discountType?: "percentage" | "fixed_amount";
  discountRateBps: number;
  fixedDiscountCents: number;
  discountCents: number;
  firstOrderOnly?: boolean;
  error?: string;
  minSubtotalCents?: number;
  affiliateCommissionRateBps?: number | null;
  bannerEnabled?: boolean;
  bannerMessage?: string | null;
  bannerCta?: string | null;
}

/**
 * Fetches all promotions from the database, falling back gracefully to brand config.
 */
export async function getAllPromotions(supabase = createAdminClient()): Promise<PromotionRecord[]> {
  const brand = getBrandConfig();
  if (!supabase) {
    return brand.promotions.map((p) => ({
      code: p.code,
      name: p.name || p.code,
      description: p.description || null,
      discount_type: (p.discountType as any) || (p.fixedDiscountCents ? "fixed_amount" : "percentage"),
      discount_rate_bps: p.discountRateBps || 0,
      fixed_discount_cents: p.fixedDiscountCents || 0,
      minimum_subtotal_cents: p.minSubtotalCents || 0,
      first_order_only: Boolean(p.firstOrderOnly),
      starts_at: p.startsAt || null,
      ends_at: p.endsAt || null,
      enabled: p.enabled !== false,
      banner_enabled: Boolean(p.bannerEnabled),
      banner_message: p.bannerMessage || null,
      banner_cta: p.bannerCta || null,
      affiliate_stack_policy: (p.affiliateStackPolicy as any) || "exclusive",
      affiliate_commission_override_bps: p.affiliateCommissionRateBps || null,
    }));
  }

  try {
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !Array.isArray(data) || data.length === 0) {
      if (error) console.warn("[promotions] Supabase read error, using fallback config:", error.message);
      return getAllPromotions(null);
    }

    return data as PromotionRecord[];
  } catch (err) {
    console.warn("[promotions] Exception loading promotions, using fallback:", err);
    return getAllPromotions(null);
  }
}

/**
 * Returns the currently active banner campaign (if any), or null.
 */
export async function getActiveBannerCampaign(supabase = createAdminClient()) {
  const all = await getAllPromotions(supabase);
  const now = new Date();

  const activeBanner = all.find((p) => {
    if (!p.enabled || !p.banner_enabled) return false;
    if (p.starts_at && new Date(p.starts_at) > now) return false;
    if (p.ends_at && new Date(p.ends_at) < now) return false;
    if (typeof p.max_total_uses === "number" && (p.times_used || 0) >= p.max_total_uses) return false;
    return true;
  });

  if (!activeBanner) return null;

  return {
    code: activeBanner.code,
    name: activeBanner.name,
    message: activeBanner.banner_message || `${(activeBanner.discount_rate_bps / 100).toFixed(0)}% OFF YOUR FIRST ORDER · CODE ${activeBanner.code}`,
    cta: activeBanner.banner_cta || "APPLY OFFER",
    discountRateBps: activeBanner.discount_rate_bps,
    fixedDiscountCents: activeBanner.fixed_discount_cents,
    firstOrderOnly: activeBanner.first_order_only,
    endsAt: activeBanner.ends_at || null,
  };
}

/**
 * Validates a promo code with full server-side authority, checking first-order eligibility if needed.
 */
export async function validatePromotionServerSide(
  code: string,
  subtotalCents: number,
  customerEmail?: string | null,
  supabase = createAdminClient(),
): Promise<PromotionValidationResult> {
  const normalized = normalizePromoCode(code);
  if (!normalized) {
    return { valid: true, code: null, discountRateBps: 0, fixedDiscountCents: 0, discountCents: 0 };
  }

  const allPromos = await getAllPromotions(supabase);
  const promoRecord = allPromos.find((p) => normalizePromoCode(p.code) === normalized);

  let isFirstOrder: boolean | undefined = undefined;
  if (promoRecord?.first_order_only) {
    if (!customerEmail) {
      // If customer email has not yet been supplied, note that it requires first order verification at checkout
      isFirstOrder = undefined;
    } else {
      const eligibility = await checkFirstOrderEligibility(customerEmail, supabase);
      if (!eligibility.eligible) {
        return {
          valid: false,
          code: normalized,
          error: eligibility.reason || "This promo is valid for first-time orders only.",
          discountRateBps: 0,
          fixedDiscountCents: 0,
          discountCents: 0,
        };
      }
      isFirstOrder = true;
    }
  }

  const resolved = resolvePromoCodeWithConfig(normalized, allPromos, subtotalCents, {
    isFirstOrder,
    now: new Date(),
  });

  let discountCents = 0;
  if (resolved.valid && resolved.code) {
    if (resolved.discountRateBps > 0) {
      discountCents += Math.round(subtotalCents * (resolved.discountRateBps / 10000));
    }
    if (resolved.fixedDiscountCents > 0) {
      discountCents += resolved.fixedDiscountCents;
    }
    discountCents = Math.min(subtotalCents, Math.max(0, discountCents));
  }

  return {
    ...resolved,
    discountCents,
  };
}
