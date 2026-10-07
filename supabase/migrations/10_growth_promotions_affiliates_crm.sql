-- 10_growth_promotions_affiliates_crm.sql
-- Revenue Growth, CRO, Affiliate System & Marketing OS Migration

-- 1. PROMOTIONS TABLE
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' | 'fixed_amount'
    discount_rate_bps INTEGER DEFAULT 0,              -- e.g. 2000 = 20.00%
    fixed_discount_cents INTEGER DEFAULT 0,           -- e.g. 2500 = $25.00
    minimum_subtotal_cents INTEGER DEFAULT 0,         -- cents
    first_order_only BOOLEAN NOT NULL DEFAULT false,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    enabled BOOLEAN NOT NULL DEFAULT true,
    max_total_uses INTEGER,
    max_uses_per_customer INTEGER DEFAULT 1,
    times_used INTEGER NOT NULL DEFAULT 0,
    banner_enabled BOOLEAN NOT NULL DEFAULT false,
    banner_message TEXT,
    banner_cta TEXT,
    affiliate_stack_policy TEXT NOT NULL DEFAULT 'exclusive', -- 'exclusive' | 'allow_override'
    affiliate_commission_override_bps INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS promotions_code_idx ON public.promotions (code);
CREATE INDEX IF NOT EXISTS promotions_enabled_idx ON public.promotions (enabled);

-- Enable RLS on promotions
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active promotions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'promotions' AND policyname = 'Allow public read active promotions'
  ) THEN
    CREATE POLICY "Allow public read active promotions" ON public.promotions
      FOR SELECT USING (enabled = true);
  END IF;
END $$;

-- 2. SEED DEFAULT PROMOTIONS (IDEMPOTENT)
INSERT INTO public.promotions (
    code, name, description, discount_type, discount_rate_bps, fixed_discount_cents,
    minimum_subtotal_cents, first_order_only, enabled, banner_enabled, banner_message,
    banner_cta, affiliate_stack_policy, affiliate_commission_override_bps
) VALUES
(
    'FOUNDRY20',
    'FOUNDRY20 — 20% First Order Discount',
    '20% off your first research order. Valid for new customers with no prior paid orders.',
    'percentage',
    2000,
    0,
    0,
    true,
    true,
    true,
    '20% OFF YOUR FIRST ORDER · CODE FOUNDRY20 · APPLY OFFER',
    'APPLY OFFER',
    'exclusive',
    800
),
(
    'FOUNDRY10',
    'Vial Foundry 10% Off',
    '10% off institutional research orders.',
    'percentage',
    1000,
    0,
    0,
    false,
    true,
    false,
    null,
    null,
    'exclusive',
    800
),
(
    'RESEARCH25',
    'Research $25 off orders $200+',
    '$25 off orders with subtotal of $200.00 or more.',
    'fixed_amount',
    0,
    2500,
    20000,
    false,
    false,
    false,
    null,
    null,
    'exclusive',
    null
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    discount_type = EXCLUDED.discount_type,
    discount_rate_bps = EXCLUDED.discount_rate_bps,
    fixed_discount_cents = EXCLUDED.fixed_discount_cents,
    minimum_subtotal_cents = EXCLUDED.minimum_subtotal_cents,
    first_order_only = EXCLUDED.first_order_only,
    banner_enabled = EXCLUDED.banner_enabled,
    banner_message = EXCLUDED.banner_message,
    banner_cta = EXCLUDED.banner_cta,
    affiliate_commission_override_bps = EXCLUDED.affiliate_commission_override_bps,
    updated_at = NOW();

-- 3. UPGRADE AFFILIATES TABLE
ALTER TABLE public.affiliates
    ADD COLUMN IF NOT EXISTS customer_discount_bps INTEGER DEFAULT 1000,
    ADD COLUMN IF NOT EXISTS password_hash TEXT,
    ADD COLUMN IF NOT EXISTS password_salt TEXT,
    ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS invite_token_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS payout_method TEXT,
    ADD COLUMN IF NOT EXISTS payout_details JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS lifetime_earnings_cents INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS pending_commission_cents INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS paid_commission_cents INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_orders_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_clicks_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS affiliates_invite_token_idx ON public.affiliates (invite_token)
    WHERE invite_token IS NOT NULL;

-- 4. ORDER ATTRIBUTION SNAPSHOTS & RECOVERY
ALTER TABLE public.manual_orders
    ADD COLUMN IF NOT EXISTS first_touch_source TEXT,
    ADD COLUMN IF NOT EXISTS first_touch_medium TEXT,
    ADD COLUMN IF NOT EXISTS first_touch_campaign TEXT,
    ADD COLUMN IF NOT EXISTS first_touch_content TEXT,
    ADD COLUMN IF NOT EXISTS first_touch_term TEXT,
    ADD COLUMN IF NOT EXISTS last_touch_source TEXT,
    ADD COLUMN IF NOT EXISTS last_touch_medium TEXT,
    ADD COLUMN IF NOT EXISTS last_touch_campaign TEXT,
    ADD COLUMN IF NOT EXISTS last_touch_content TEXT,
    ADD COLUMN IF NOT EXISTS last_touch_term TEXT,
    ADD COLUMN IF NOT EXISTS landing_page TEXT,
    ADD COLUMN IF NOT EXISTS referrer_url TEXT,
    ADD COLUMN IF NOT EXISTS customer_affiliate_discount_amount INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS payment_recovery_email_sent_at TIMESTAMPTZ;

-- 5. EMAIL MARKETING SUBSCRIBERS CONSENT & CAMPAIGNS
ALTER TABLE public.email_subscribers
    ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS marketing_opt_in_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS marketing_source TEXT DEFAULT 'footer_form',
    ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS email_subscribers_token_idx ON public.email_subscribers (unsubscribe_token)
    WHERE unsubscribe_token IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    preheader TEXT,
    audience_type TEXT NOT NULL DEFAULT 'marketing_subscribers',
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft', -- draft, scheduled, sending, sent, canceled
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    recipient_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- 6. CUSTOMER ACCOUNT AUTH & REORDER
ALTER TABLE public.customers
    ADD COLUMN IF NOT EXISTS password_hash TEXT,
    ADD COLUMN IF NOT EXISTS password_salt TEXT,
    ADD COLUMN IF NOT EXISTS login_token_hash TEXT,
    ADD COLUMN IF NOT EXISTS login_token_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS default_shipping_address JSONB;
