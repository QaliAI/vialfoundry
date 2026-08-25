// Dynamic brand-configurable promotions engine for Vial Foundry.

export function normalizePromoCode(value) {
  return String(value ?? "").trim().toUpperCase();
}

export function resolvePromoCodeWithConfig(value, promotions = [], subtotalCents = 0) {
  const code = normalizePromoCode(value);
  if (!code) {
    return { valid: true, code: null, discountRateBps: 0, fixedDiscountCents: 0 };
  }

  // Find matching promo config
  const match = Array.isArray(promotions)
    ? promotions.find((p) => normalizePromoCode(p.code) === code && p.enabled !== false)
    : null;

  if (!match) {
    // Default fallback for legacy codes
    if (code === "FOUNDRY10" || code === "SAVE10") {
      return {
        valid: true,
        code,
        name: `${code} 10% Discount`,
        discountRateBps: 1000,
        fixedDiscountCents: 0,
        minSubtotalCents: 0,
        affiliateCommissionRateBps: 800,
      };
    }
    if (code === "RESEARCH25") {
      const minSub = 20000;
      if (subtotalCents > 0 && subtotalCents < minSub) {
        return {
          valid: false,
          code,
          error: "Subtotal must be at least $200.00 for RESEARCH25.",
          discountRateBps: 0,
          fixedDiscountCents: 0,
        };
      }
      return {
        valid: true,
        code,
        name: "Research $25 Discount",
        discountRateBps: 0,
        fixedDiscountCents: 2500,
        minSubtotalCents: minSub,
      };
    }
    return { valid: false, code, discountRateBps: 0, fixedDiscountCents: 0 };
  }

  const minSubtotal = match.minSubtotalCents || 0;
  if (minSubtotal > 0 && subtotalCents > 0 && subtotalCents < minSubtotal) {
    return {
      valid: false,
      code: match.code.toUpperCase(),
      error: `Order subtotal must be at least $${(minSubtotal / 100).toFixed(2)} to use this promo.`,
      discountRateBps: 0,
      fixedDiscountCents: 0,
    };
  }

  return {
    valid: true,
    code: match.code.toUpperCase(),
    name: match.name || match.code,
    discountRateBps: match.discountRateBps || 0,
    fixedDiscountCents: match.fixedDiscountCents || 0,
    minSubtotalCents: minSubtotal,
    affiliateCommissionRateBps: match.affiliateCommissionRateBps,
  };
}

export function calculateConfiguredPromoDiscount(subtotalCents, promoCode, promotions = []) {
  const subtotal = Math.max(0, Math.round(Number(subtotalCents ?? 0)));
  const promo = resolvePromoCodeWithConfig(promoCode, promotions, subtotal);

  let discountCents = 0;
  if (promo.valid && promo.code) {
    if (promo.discountRateBps > 0) {
      discountCents += Math.round(subtotal * (promo.discountRateBps / 10000));
    }
    if (promo.fixedDiscountCents > 0) {
      discountCents += promo.fixedDiscountCents;
    }
    discountCents = Math.min(subtotal, Math.max(0, discountCents));
  }

  return {
    ...promo,
    subtotalBeforeDiscountCents: subtotal,
    discountCents,
    subtotalAfterDiscountCents: Math.max(0, subtotal - discountCents),
  };
}
