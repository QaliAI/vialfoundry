/**
 * Quantity Tier Pricing Architecture for Vial Foundry.
 *
 * NOTE: Discounts are INACTIVE by default (enabled: false, discountRateBps: 0).
 * Do NOT activate discounts or set percentage rates until owner margins are
 * explicitly approved.
 */

export interface QuantityTier {
  /** Minimum unit quantity required to qualify for this tier (e.g. 3, 6, 12). */
  minQuantity: number;
  /** Discount in basis points (100 bps = 1.00%, 500 bps = 5.00%). */
  discountRateBps: number;
  /** Whether this specific tier is active. */
  active: boolean;
  /** Optional customer-facing tier label (e.g. "Buy 3+", "Buy 6+"). */
  label?: string;
}

export interface QuantityPricingConfig {
  /** Master switch. Must remain FALSE until owner margin review. */
  enabled: boolean;
  /** Ordered list of quantity tiers, from lowest to highest minQuantity. */
  tiers: QuantityTier[];
}

/**
 * Default inactive configuration.
 * Prepared for future tiers (3+, 6+, 12+) with 0% discount and inactive state.
 */
export const DEFAULT_QUANTITY_PRICING_CONFIG: QuantityPricingConfig = {
  enabled: false,
  tiers: [
    { minQuantity: 3, discountRateBps: 0, active: false, label: '3+ units' },
    { minQuantity: 6, discountRateBps: 0, active: false, label: '6+ units' },
    { minQuantity: 12, discountRateBps: 0, active: false, label: '12+ units' },
  ],
};

export interface ResolvedQuantityDiscount {
  active: boolean;
  minQuantity: number;
  discountRateBps: number;
  discountCents: number;
  tierLabel: string | null;
}

/**
 * Resolves the quantity tier discount for a given line item.
 * Always returns 0 discount when configuration is disabled or inactive.
 */
export function resolveQuantityTierDiscount(
  unitPriceCents: number,
  quantity: number,
  config: QuantityPricingConfig = DEFAULT_QUANTITY_PRICING_CONFIG
): ResolvedQuantityDiscount {
  if (!config.enabled || !Array.isArray(config.tiers) || config.tiers.length === 0) {
    return {
      active: false,
      minQuantity: 0,
      discountRateBps: 0,
      discountCents: 0,
      tierLabel: null,
    };
  }

  // Find the highest qualifying active tier
  const eligibleTiers = config.tiers
    .filter((t) => t.active && t.discountRateBps > 0 && quantity >= t.minQuantity)
    .sort((a, b) => b.minQuantity - a.minQuantity);

  if (eligibleTiers.length === 0) {
    return {
      active: false,
      minQuantity: 0,
      discountRateBps: 0,
      discountCents: 0,
      tierLabel: null,
    };
  }

  const matchedTier = eligibleTiers[0];
  const grossLineTotal = Math.max(0, unitPriceCents) * Math.max(0, quantity);
  const discountCents = Math.round(grossLineTotal * (matchedTier.discountRateBps / 10000));

  return {
    active: true,
    minQuantity: matchedTier.minQuantity,
    discountRateBps: matchedTier.discountRateBps,
    discountCents,
    tierLabel: matchedTier.label || `${matchedTier.minQuantity}+ units`,
  };
}
