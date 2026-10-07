// Dynamic brand-configurable promotions engine for Vial Foundry.

export function normalizePromoCode(value) {
  return String(value ?? "").trim().toUpperCase();
}

/**
 * Checks server-authoritative eligibility for first-order promotions.
 *
 * Eligibility rules:
 * - Customer email normalized (lowercase, trimmed).
 * - Must NOT have any prior successfully paid production order (payment_status = 'paid').
 * - Test orders (is_test = true or stripe_livemode = false) do NOT disqualify.
 * - Canceled or unpaid orders do NOT disqualify.
 * - Refunded orders: If an order reached payment settlement (payment_status = 'paid' or
 *   amount_refunded > 0), the customer already exercised their first-order incentive and is disqualified.
 */
export async function checkFirstOrderEligibility(customerEmail, supabase) {
  const email = String(customerEmail ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return {
      eligible: false,
      reason: "A valid customer email is required to verify first-order discount eligibility.",
    };
  }

  if (!supabase) {
    return { eligible: true };
  }

  try {
    const { data: priorOrders, error } = await supabase
      .from("manual_orders")
      .select("id, order_number, status, payment_status, is_test, stripe_livemode, amount_refunded")
      .ilike("customer_email", email);

    if (error) {
      console.warn("[promotions] Error querying customer order history:", error.message);
      return { eligible: true };
    }

    if (!Array.isArray(priorOrders) || priorOrders.length === 0) {
      return { eligible: true };
    }

    const disqualifyingOrder = priorOrders.find((order) => {
      const isTest = order.is_test === true || order.stripe_livemode === false;
      if (isTest) return false;

      const wasSettled =
        order.payment_status === "paid" ||
        (typeof order.amount_refunded === "number" && order.amount_refunded > 0);
      const isCanceledBeforePayment =
        order.status === "canceled" && order.payment_status !== "paid";

      return wasSettled && !isCanceledBeforePayment;
    });

    if (disqualifyingOrder) {
      return {
        eligible: false,
        reason: "FOUNDRY20 is valid for first-time orders only. A previous paid order was found for this email.",
        priorOrderNumber: disqualifyingOrder.order_number,
      };
    }

    return { eligible: true };
  } catch (err) {
    console.error("[promotions] Exception checking first-order eligibility:", err);
    return { eligible: true };
  }
}

export function resolvePromoCodeWithConfig(value, promotions = [], subtotalCents = 0, options = {}) {
  const code = normalizePromoCode(value);
  if (!code) {
    return { valid: true, code: null, discountRateBps: 0, fixedDiscountCents: 0 };
  }

  const now = options.now instanceof Date ? options.now : new Date();

  // Check if promo is explicitly disabled in promotions config
  const isExplicitlyDisabled =
    Array.isArray(promotions) &&
    promotions.some((p) => normalizePromoCode(p.code) === code && p.enabled === false);

  if (isExplicitlyDisabled) {
    return {
      valid: false,
      code,
      error: "This promo code is currently inactive.",
      discountRateBps: 0,
      fixedDiscountCents: 0,
    };
  }

  // Find matching promo config
  const match = Array.isArray(promotions)
    ? promotions.find((p) => normalizePromoCode(p.code) === code && p.enabled !== false)
    : null;

  if (!match) {
    // Default fallback for recognized brand codes
    if (code === "FOUNDRY20") {
      if (options.isFirstOrder === false) {
        return {
          valid: false,
          code,
          error: "FOUNDRY20 is valid for first-time customers only.",
          discountRateBps: 0,
          fixedDiscountCents: 0,
        };
      }
      return {
        valid: true,
        code,
        name: "FOUNDRY20 — 20% First Order Discount",
        discountRateBps: 2000,
        fixedDiscountCents: 0,
        minSubtotalCents: 0,
        firstOrderOnly: true,
        affiliateCommissionRateBps: 800,
      };
    }
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

  // 1. Date window enforcement
  if (match.startsAt || match.starts_at) {
    const start = new Date(match.startsAt || match.starts_at);
    if (!isNaN(start.getTime()) && now < start) {
      return {
        valid: false,
        code: match.code.toUpperCase(),
        error: "This promo code is not yet active.",
        discountRateBps: 0,
        fixedDiscountCents: 0,
      };
    }
  }

  if (match.endsAt || match.ends_at) {
    const end = new Date(match.endsAt || match.ends_at);
    if (!isNaN(end.getTime()) && now > end) {
      return {
        valid: false,
        code: match.code.toUpperCase(),
        error: "This promo code has expired.",
        discountRateBps: 0,
        fixedDiscountCents: 0,
      };
    }
  }

  // 2. Usage cap enforcement
  const maxUses = match.maxTotalUses ?? match.max_total_uses;
  const timesUsed = match.timesUsed ?? match.times_used ?? 0;
  if (typeof maxUses === "number" && maxUses > 0 && timesUsed >= maxUses) {
    return {
      valid: false,
      code: match.code.toUpperCase(),
      error: "This promo code has reached its maximum redemptions.",
      discountRateBps: 0,
      fixedDiscountCents: 0,
    };
  }

  // 3. Minimum subtotal check
  const minSubtotal = match.minSubtotalCents ?? match.minimum_subtotal_cents ?? 0;
  if (minSubtotal > 0 && subtotalCents > 0 && subtotalCents < minSubtotal) {
    return {
      valid: false,
      code: match.code.toUpperCase(),
      error: `Order subtotal must be at least $${(minSubtotal / 100).toFixed(2)} to use this promo.`,
      discountRateBps: 0,
      fixedDiscountCents: 0,
    };
  }

  // 4. First-order only check
  const isFirstOrderOnly = Boolean(match.firstOrderOnly ?? match.first_order_only);
  if (isFirstOrderOnly && options.isFirstOrder === false) {
    return {
      valid: false,
      code: match.code.toUpperCase(),
      error: `${match.code.toUpperCase()} is valid for first-time orders only.`,
      discountRateBps: 0,
      fixedDiscountCents: 0,
    };
  }

  const discountRateBps = match.discountRateBps ?? match.discount_rate_bps ?? 0;
  const fixedDiscountCents = match.fixedDiscountCents ?? match.fixed_discount_cents ?? 0;

  return {
    valid: true,
    code: match.code.toUpperCase(),
    name: match.name || match.code,
    description: match.description,
    discountType: match.discountType || match.discount_type || (fixedDiscountCents > 0 ? "fixed_amount" : "percentage"),
    discountRateBps,
    fixedDiscountCents,
    minSubtotalCents: minSubtotal,
    firstOrderOnly: isFirstOrderOnly,
    affiliateCommissionRateBps: match.affiliateCommissionRateBps ?? match.affiliate_commission_override_bps,
    bannerEnabled: Boolean(match.bannerEnabled ?? match.banner_enabled),
    bannerMessage: match.bannerMessage ?? match.banner_message,
    bannerCta: match.bannerCta ?? match.banner_cta,
  };
}

export function calculateConfiguredPromoDiscount(subtotalCents, promoCode, promotions = [], options = {}) {
  const subtotal = Math.max(0, Math.round(Number(subtotalCents ?? 0)));
  const promo = resolvePromoCodeWithConfig(promoCode, promotions, subtotal, options);

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
