# Quantity Tier Pricing Strategy & Owner Margin Approval Matrix

**Status:** TIERS CURRENTLY DISABLED (Awaiting Owner Landed-Cost Validation)  
**Date:** September 2026  
**Architecture:** `src/lib/pricing/quantity-tiers.ts` (`DEFAULT_QUANTITY_PRICING_CONFIG.enabled = false`)  
**Target Margin Floor:** Minimum 30% Gross Margin on all transactions  

---

## 1. Executive Summary & Policy

Vial Foundry's quantity tier discounting engine is fully built and tested. However, because no authoritative Cost of Goods Sold (COGS) or landed-cost data currently resides in the repository or database, **quantity tier discounts are kept DISABLED for launch**.

Discounts will not be enabled globally or per SKU until the owner confirms that the supplier landed cost (including synthesis, purification, fill/finish, testing, and inbound shipping) does not breach the **30.0% gross-margin floor** at the highest tier.

### Proposed 3-Tier Volume Model
- **Tier 1 (1–2 units):** Standard retail price (0% discount)
- **Tier 2 (3–5 units):** 5% discount (`discountRateBps: 500`)
- **Tier 3 (6–9 units):** 8% discount (`discountRateBps: 800`)
- **Tier 4 (10+ units):** 10% discount (`discountRateBps: 1000`)

### Mathematical Margin Formula
$$\text{Gross Margin} = \frac{\text{Unit Revenue} - \text{Landed Cost}}{\text{Unit Revenue}} \ge 30\%$$

To safely offer the **10% volume discount** (Tier 4) while preserving a 30% margin floor:
$$\text{Max Landed Cost} \le (\text{Retail Price} \times 0.90) \times 0.70 = \text{Retail Price} \times 0.63$$

---

## 2. SKU-by-SKU Quantity Pricing & Landed-Cost Ceiling Matrix

All figures in USD ($).

| SKU | Product | Base Retail | Tier 2 (3–5 units, 5% off) | Tier 3 (6–9 units, 8% off) | Tier 4 (10+ units, 10% off) | Max Landed Cost (Single Unit 30% Margin) | Max Landed Cost (10+ Unit Tier 30% Margin) | Owner Decision |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `VF-SKU-991` | **BPC-157 5 mg** | $54.99 | $52.24 | $50.59 | $49.49 | **$38.49** | **$34.64** | [ ] Approve / [ ] Keep Disabled |
| `VF-SKU-992` | **TB-500 10 mg** | $88.00 | $83.60 | $80.96 | $79.20 | **$61.60** | **$55.44** | [ ] Approve / [ ] Keep Disabled |
| `VF-SKU-993` | **Semaglutide 5 mg** | $112.00 | $106.40 | $103.04 | $100.80 | **$78.40** | **$70.56** | [ ] Approve / [ ] Keep Disabled |
| `VF-SKU-994` | **Tirzepatide 10 mg** | $145.00 | $137.75 | $133.40 | $130.50 | **$101.50** | **$91.35** | [ ] Approve / [ ] Keep Disabled |
| `VF-SKU-995` | **Retatrutide 10 mg** | $168.00 | $159.60 | $154.56 | $151.20 | **$117.60** | **$105.84** | [ ] Approve / [ ] Keep Disabled |
| `VF-SKU-996` | **CJC-1295 (No DAC) 5 mg** | $49.99 | $47.49 | $45.99 | $44.99 | **$34.99** | **$31.49** | [ ] Approve / [ ] Keep Disabled |
| `VF-SKU-997` | **Ipamorelin 5 mg** | $48.00 | $45.60 | $44.16 | $43.20 | **$33.60** | **$30.24** | [ ] Approve / [ ] Keep Disabled |
| `VF-SKU-998` | **NAD+ 1 g** | $75.00 | $71.25 | $69.00 | $67.50 | **$52.50** | **$47.25** | [ ] Approve / [ ] Keep Disabled |
| `VF-SKU-999` | **GHK-Cu 50 mg** | $58.00 | $55.10 | $53.36 | $52.20 | **$40.60** | **$36.54** | [ ] Approve / [ ] Keep Disabled |
| `VF-SKU-1000`| **Bacteriostatic Water 30 mL** | $14.00 | $13.30 | $12.88 | $12.60 | **$9.80** | **$8.82** | [ ] Catalog Withheld |
| `VF-SKU-1011`| **Sermorelin 5 mg** | $54.00 | $51.30 | $49.68 | $48.60 | **$37.80** | **$34.02** | [ ] Approve / [ ] Keep Disabled |
| `VF-SKU-1012`| **Tesamorelin 5 mg** | $59.99 | $56.99 | $55.19 | $53.99 | **$41.99** | **$37.79** | [ ] Approve / [ ] Keep Disabled |
| `VF-SKU-1013`| **PT-141 10 mg** | $54.99 | $52.24 | $50.59 | $49.49 | **$38.49** | **$34.64** | [ ] Approve / [ ] Keep Disabled |
| `VF-SKU-1014`| **Selank 10 mg** | $46.00 | $43.70 | $42.32 | $41.40 | **$32.20** | **$28.98** | [ ] Approve / [ ] Keep Disabled |
| `VF-SKU-1015`| **Semax 10 mg** | $49.00 | $46.55 | $45.08 | $44.10 | **$34.30** | **$30.87** | [ ] Approve / [ ] Keep Disabled |
| `VF-SKU-1016`| **Epithalon 10 mg** | $42.00 | $39.90 | $38.64 | $37.80 | **$29.40** | **$26.46** | [ ] Approve / [ ] Keep Disabled |
| `VF-SKU-1017`| **Thymosin Alpha-1 10 mg** | $96.00 | $91.20 | $88.32 | $86.40 | **$67.20** | **$60.48** | [ ] Approve / [ ] Keep Disabled |
| `VF-SKU-1018`| **MOTS-c 10 mg** | $118.00 | $112.10 | $108.56 | $106.20 | **$82.60** | **$74.34** | [ ] Out of Stock |
| `VF-SKU-1019`| **AOD-9604 5 mg** | $59.99 | $56.99 | $55.19 | $53.99 | **$41.99** | **$37.79** | [ ] Approve / [ ] Keep Disabled |
| `VF-SKU-1020`| **Acetonitrile 1 L** | $38.00 | $36.10 | $34.96 | $34.20 | **$26.60** | **$23.94** | [ ] Catalog Withheld |

---

## 3. Activation Protocol for Owner
Once landed costs are verified:
1. Confirm that actual supplier landed cost per vial is $\le$ the figure in **Max Landed Cost (10+ Unit Tier 30% Margin)**.
2. If confirmed, set `enabled: true` and activate corresponding tiers in `src/lib/pricing/quantity-tiers.ts`:
```ts
export const DEFAULT_QUANTITY_PRICING_CONFIG: QuantityPricingConfig = {
  enabled: true,
  tiers: [
    { minQuantity: 3, discountRateBps: 500, active: true, label: '3+ units (5% off)' },
    { minQuantity: 6, discountRateBps: 800, active: true, label: '6+ units (8% off)' },
    { minQuantity: 10, discountRateBps: 1000, active: true, label: '10+ units (10% off)' },
  ],
};
```
3. Run `npm test` and commit.
