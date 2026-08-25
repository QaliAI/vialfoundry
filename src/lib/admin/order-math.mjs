// Server-side authoritative invoice math for Vial Foundry.
// All invoice edits and affiliate assignments must recalculate amounts through
// these functions. Client-supplied totals are never trusted; the server always
// derives subtotals, discounts, shipping, tax, totals, and affiliate
// commission from line items + promo + shipping + tax inputs.

import { resolvePromoCodeWithConfig } from "../promotions/promotions.mjs";
import { DEFAULT_AFFILIATE_COMMISSION_RATE_BPS } from "../affiliates/utils.mjs";

export function cents(value = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : 0;
}

export function resolveAffiliateRateBps(promoCode, affiliateRateBps = DEFAULT_AFFILIATE_COMMISSION_RATE_BPS, promoOverrides = {}) {
  const code = String(promoCode || "").trim().toUpperCase();
  if (code && promoOverrides && promoOverrides[code]) {
    return promoOverrides[code];
  }
  if (code === "FOUNDRY10" || code === "SAVE10") {
    return 800; // 8% commission on promo orders
  }
  return Math.max(0, Math.min(10000, Math.round(Number(affiliateRateBps ?? DEFAULT_AFFILIATE_COMMISSION_RATE_BPS))));
}

export function recalculateInvoice(input = {}, promotions = []) {
  const items = Array.isArray(input.items) ? input.items : [];
  const shippingAmount = cents(input.shippingAmount);
  const taxAmount = cents(input.taxAmount);
  const paymentMethodDiscountRateBps = cents(input.paymentMethodDiscountRateBps ?? 0);

  let subtotalBeforeDiscount = 0;
  let pricingPending = false;

  const lineItems = items.map((item) => {
    const quantity = Math.max(0, Math.round(Number(item.quantity) || 0));
    const unitPrice = item.unit_price_amount === null || item.unit_price_amount === undefined ? null : cents(item.unit_price_amount);
    if (unitPrice === null || item.price_status === "pending_confirmation") {
      pricingPending = true;
      return {
        ...item,
        quantity,
        unit_price_amount: unitPrice,
        line_total_amount: null,
      };
    }
    const lineTotal = unitPrice * quantity;
    if (!pricingPending) {
      subtotalBeforeDiscount += lineTotal;
    }
    return {
      ...item,
      quantity,
      unit_price_amount: unitPrice,
      line_total_amount: lineTotal,
    };
  });

  if (pricingPending) {
    return {
      lineItems,
      pricingPending: true,
      subtotal_amount: null,
      subtotal_before_discount: null,
      discount_amount: null,
      subtotal_after_discount: null,
      shipping_amount: shippingAmount,
      tax_amount: taxAmount,
      total_amount: null,
    };
  }

  const promoCode = String(input.promoCode || "").trim().toUpperCase() || null;
  const promo = resolvePromoCodeWithConfig(promoCode, promotions, subtotalBeforeDiscount);

  let discountAmount = 0;
  if (promo.valid && promo.code) {
    if (promo.discountRateBps > 0) {
      discountAmount += Math.round(subtotalBeforeDiscount * (promo.discountRateBps / 10000));
    }
    if (promo.fixedDiscountCents > 0) {
      discountAmount += promo.fixedDiscountCents;
    }
    discountAmount = Math.min(subtotalBeforeDiscount, Math.max(0, discountAmount));
  }

  // Apply payment-method discount (e.g. 5% off for CashApp/Crypto)
  const subtotalAfterPromo = Math.max(0, subtotalBeforeDiscount - discountAmount);
  const paymentDiscountAmount = Math.round(subtotalAfterPromo * (paymentMethodDiscountRateBps / 10000));
  const subtotalAfterDiscount = Math.max(0, subtotalAfterPromo - paymentDiscountAmount);
  const totalAmount = subtotalAfterDiscount + shippingAmount + taxAmount;

  return {
    lineItems,
    pricingPending: false,
    subtotal_before_discount: subtotalBeforeDiscount,
    discount_amount: discountAmount + paymentDiscountAmount,
    promo_code: promo.valid ? promo.code : null,
    subtotal_after_discount: subtotalAfterDiscount,
    subtotal_amount: subtotalAfterDiscount,
    shipping_amount: shippingAmount,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    payment_discount_amount: paymentDiscountAmount,
  };
}

export function recalculateAffiliateCommission(input = {}, promoOverrides = {}) {
  const productSubtotalCents = cents(input.productSubtotalCents);
  const rateBps = resolveAffiliateRateBps(input.promoCode, input.rateBps, promoOverrides);
  return {
    affiliate_commission_rate_bps: rateBps,
    affiliate_product_subtotal: productSubtotalCents,
    affiliate_commission_amount: Math.round(productSubtotalCents * (rateBps / 10000)),
    shippingExcluded: true,
  };
}
