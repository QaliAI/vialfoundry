# Quantity Pricing Architecture Specification

## Overview
Competitors in the research chemical and peptide space frequently offer tiered volume pricing (e.g., 3+, 6+, 12+ units).
This module establishes the architectural configuration schema in `src/lib/pricing/quantity-tiers.ts` while keeping all discounts strictly **INACTIVE** by default.

## Safety & Inactive State Rules
1. `DEFAULT_QUANTITY_PRICING_CONFIG.enabled` is set to `false`.
2. All tier `discountRateBps` are set to `0`.
3. All tier `active` flags are set to `false`.
4. No percentage discounts will be chosen or activated until business owners review product unit economics and margin thresholds.

## Proposed Configuration Schema

```typescript
export interface QuantityTier {
  minQuantity: number;      // e.g. 3, 6, 12
  discountRateBps: number;  // basis points: 500 = 5.00%, 1000 = 10.00%
  active: boolean;          // individual tier gate
  label?: string;           // e.g. "Tier 1 (3+ vials)"
}

export interface QuantityPricingConfig {
  enabled: boolean;         // Global toggle: must be true to apply any tier discounts
  tiers: QuantityTier[];
}
```

## Future Activation Guide (Post-Margin Approval)
To safely enable volume pricing in production once margin approvals are complete:
1. Determine approved gross margin floor per SKU or catalogue tier.
2. In `src/config/brand.ts` or database configuration, populate `quantityPricingConfig` with approved bps (e.g. 3+ vials: 500 bps [5%], 6+ vials: 1000 bps [10%], 12+ vials: 1500 bps [15%]).
3. Set `enabled: true` and `active: true` for the approved tiers.
4. The server-authoritative invoice calculation in `src/lib/admin/order-math.mjs` will factor the line-item quantity tier discount directly into line totals prior to promotional coupon and payment-method discount evaluation.
