-- Vial Foundry — Payment method + Affiliate applications (04_payments_affiliates.sql)

-- Payment method chosen at inquiry checkout
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- Affiliate program applications
CREATE TABLE IF NOT EXISTS public.affiliate_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    audience TEXT,
    payout_method VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.affiliate_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert affiliate applications" ON public.affiliate_applications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin full access affiliate applications" ON public.affiliate_applications
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
