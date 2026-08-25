-- Vial Foundry — Portable Commerce Core Schema Migration (05_commerce_core.sql)
-- Reconciles peptide-commerce-core order math, manual payments, affiliate tracking, and audit logging.

-- 1. MANUAL ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.manual_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    submission_key TEXT UNIQUE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'new', -- new, invoice_sent, pending_payment, paid, preparing, shipped, fulfilled, canceled, refunded
    checkout_mode TEXT DEFAULT 'manual_invoice',
    preferred_payment_method TEXT DEFAULT 'manual_invoice',
    currency TEXT DEFAULT 'USD',
    subtotal_amount INTEGER NOT NULL DEFAULT 0, -- cents
    shipping_amount INTEGER NOT NULL DEFAULT 0, -- cents
    tax_amount INTEGER NOT NULL DEFAULT 0,      -- cents
    discount_amount INTEGER NOT NULL DEFAULT 0, -- cents
    total_amount INTEGER NOT NULL DEFAULT 0,    -- cents
    promo_code TEXT,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    acknowledgement_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE SET NULL,
    affiliate_code TEXT,
    affiliate_commission_rate_bps INTEGER DEFAULT 1000,
    affiliate_commission_amount INTEGER DEFAULT 0, -- cents
    affiliate_status TEXT DEFAULT 'pending_payment', -- pending_payment, pending_payout, paid, void, reversed
    tracking_number TEXT,
    notes TEXT,
    is_test BOOLEAN NOT NULL DEFAULT false,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. MANUAL ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.manual_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manual_order_id UUID NOT NULL REFERENCES public.manual_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    configuration_label TEXT,
    sku TEXT,
    lot_number TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price_amount INTEGER, -- cents (null if pending confirmation)
    line_total_amount INTEGER,  -- cents (null if pending confirmation)
    price_status TEXT DEFAULT 'fixed', -- fixed, pending_confirmation
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. MANUAL PAYMENT NOTES TABLE
CREATE TABLE IF NOT EXISTS public.manual_payment_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manual_order_id UUID NOT NULL REFERENCES public.manual_orders(id) ON DELETE CASCADE,
    admin_identifier TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. AFFILIATE ALIASES TABLE
CREATE TABLE IF NOT EXISTS public.affiliate_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    alias_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. AFFILIATE CLICKS TABLE
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE SET NULL,
    raw_code TEXT NOT NULL,
    resolved_code TEXT NOT NULL,
    ip_hash TEXT,
    user_agent TEXT,
    referer TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. REFERRAL REVENUE LEDGER
CREATE TABLE IF NOT EXISTS public.referral_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    manual_order_id UUID REFERENCES public.manual_orders(id) ON DELETE SET NULL,
    order_number TEXT NOT NULL,
    gross_revenue_cents INTEGER NOT NULL DEFAULT 0,
    product_subtotal_cents INTEGER NOT NULL DEFAULT 0,
    commission_rate_bps INTEGER NOT NULL DEFAULT 1000,
    commission_amount_cents INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending_payment',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ADMIN AUDIT LOG
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_identifier TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    before_json JSONB,
    after_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. RATE LIMIT EVENTS
CREATE TABLE IF NOT EXISTS public.rate_limit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL,
    ip_address TEXT,
    endpoint TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_manual_orders_status ON public.manual_orders(status);
CREATE INDEX IF NOT EXISTS idx_manual_orders_customer_email ON public.manual_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_manual_orders_affiliate_id ON public.manual_orders(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_manual_orders_submission_key ON public.manual_orders(submission_key);
CREATE INDEX IF NOT EXISTS idx_manual_order_items_order_id ON public.manual_order_items(manual_order_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_aliases_code ON public.affiliate_aliases(alias_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON public.affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referral_revenue_affiliate_id ON public.referral_revenue(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON public.admin_audit_log(created_at);

-- ROW LEVEL SECURITY
ALTER TABLE public.manual_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_payment_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;

-- Public can submit new orders
CREATE POLICY "Public insert manual orders" ON public.manual_orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public insert manual order items" ON public.manual_order_items
    FOR INSERT WITH CHECK (true);

-- Public can log referral clicks
CREATE POLICY "Public insert affiliate clicks" ON public.affiliate_clicks
    FOR INSERT WITH CHECK (true);

-- Admin service role has full access to all commerce tables
CREATE POLICY "Service role full access manual orders" ON public.manual_orders
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role');

CREATE POLICY "Service role full access manual order items" ON public.manual_order_items
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role');

CREATE POLICY "Service role full access manual payment notes" ON public.manual_payment_notes
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role');

CREATE POLICY "Service role full access affiliate aliases" ON public.affiliate_aliases
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role');

CREATE POLICY "Service role full access affiliate clicks" ON public.affiliate_clicks
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role');

CREATE POLICY "Service role full access referral revenue" ON public.referral_revenue
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role');

CREATE POLICY "Service role full access admin audit log" ON public.admin_audit_log
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role');

CREATE POLICY "Service role full access rate limit events" ON public.rate_limit_events
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role');
