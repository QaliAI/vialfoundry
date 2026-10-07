# Vial Rewards Operating System — Phase 2 Architecture Specification

**Status:** Phase 2 Scheduled Architecture (Implementation Deferred)  
**Brand Descriptor:** RESEARCH MATERIALS  
**Scope:** Customer Retention, Point Ledger, Tiered Research Incentives, Anti-Fraud & Unit Economics Guardrails  

---

## 1. Executive Summary & Economics Guardrails

Vial Rewards is an optional loyalty and repeat-purchase incentive system designed for institutional researchers, analytical laboratories, and independent biochemical investigators.

### Strict Economics Guardrails:
1. **Maximum Effective Loyalty Discount:** 15.0% maximum aggregate discount from points redemption.
2. **Margin Floor Safeguard:** Points may only discount product subtotals. Non-discountable items:
   - Shipping fees (standard or expedited)
   - Cold-chain handling
   - Analytical documentation / COA archival requests
3. **No Discount Stacking:**
   - A customer cannot stack a promotional code (e.g., `FOUNDRY20` or partner coupon) with points redemption on the same checkout.
   - Server resolves either promotional coupon OR points discount, never both simultaneously.
4. **Non-Transferable & Zero Cash Value:** Points cannot be cashed out, refunded, or transferred between accounts.

---

## 2. Earning Mechanics & Points Valuation

- **Standard Earning Rate:** 1 Point per \$1.00 USD spent on verified, paid order subtotals (excluding shipping and tax).
- **Points Value:** 100 Points = \$5.00 USD research materials credit (equivalent to a 5.0% baseline rebate).
- **Point Expiration:** Points remain active for 365 days from the date of the customer's last paid order.

---

## 3. Tiered Research Status (Annual Spend)

| Tier | Annual Spend Qualification | Earning Multiplier | Benefits |
|---|---|---|---|
| **Investigator (Bronze)** | \$0 – \$999 | 1.0x (1 pt / \$1) | Standard points earning, order history tracking |
| **Fellow (Silver)** | \$1,000 – \$2,999 | 1.25x (1.25 pts / \$1) | Priority batch reservation, expedited fulfillment queue |
| **Principal (Gold)** | \$3,000+ | 1.50x (1.50 pts / \$1) | Complimentary cold pack packaging, dedicated account representative |

---

## 4. Dual-Sided Customer Referral Program

- **Referral Invitation:** Existing customers receive a unique referral link (`https://www.vialfoundry.com/r/c/[code]`) or code.
- **Invited Colleague Benefit:** 20% off first research order (enforced with server-side first-order verification identical to `FOUNDRY20`).
- **Referrer Reward:** 400 Points (\$20.00 credit) awarded to the referring customer only after the colleague's initial order reaches confirmed payment (`payment_status = 'paid'`).

### Anti-Fraud & Self-Referral Prevention:
1. **Device / IP / Fingerprint Correlation:** Prohibits referrals originating from the same device, subnet, or billing address.
2. **Name / Payment Instrument Matching:** Prohibits referring an account utilizing the same credit card fingerprint, shipping address, or surname.
3. **Refund Clawback:** If an attributed referred order is refunded or charged back, the unspent referral points are automatically clawed back; if already spent, the account enters a negative point balance.

---

## 5. Proposed Database Schema (Supabase Migration 11)

```sql
-- CUSTOMER REWARDS LEDGER & TIERS
CREATE TABLE IF NOT EXISTS public.customer_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    customer_email TEXT UNIQUE NOT NULL,
    referral_code TEXT UNIQUE NOT NULL,
    current_tier TEXT NOT NULL DEFAULT 'investigator', -- investigator, fellow, principal
    points_balance INTEGER NOT NULL DEFAULT 0,
    lifetime_points_earned INTEGER NOT NULL DEFAULT 0,
    lifetime_points_redeemed INTEGER NOT NULL DEFAULT 0,
    annual_spend_cents INTEGER NOT NULL DEFAULT 0,
    tier_qualifying_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customer_rewards_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    manual_order_id UUID REFERENCES public.manual_orders(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- order_earned, referral_awarded, redemption, clawback, expiration
    points INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rewards_customer_idx ON public.customer_rewards (customer_id);
CREATE INDEX IF NOT EXISTS rewards_referral_code_idx ON public.customer_rewards (referral_code);
CREATE INDEX IF NOT EXISTS rewards_ledger_customer_idx ON public.customer_rewards_ledger (customer_id);
```

---

## 6. Implementation Phasing Roadmap

1. **Step 1: Point Accumulation Shadow Mode:**
   - Deploy schema. Begin accruing points silently in the background on all paid customer orders.
2. **Step 2: Customer Account Rewards Tab:**
   - Expose Points Balance and Tier Status in `/account`.
3. **Step 3: Checkout Redemption Slider:**
   - Allow redemption at checkout in 100-point increments (\$5, \$10, \$15, \$20), bounded by the 15% maximum discount floor.
