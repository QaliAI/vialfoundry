-- Vial Foundry Row Level Security Policies (02_rls.sql)

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restock_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. PUBLIC READ POLICIES
CREATE POLICY "Allow public read active categories" ON public.categories
    FOR SELECT USING (active = true);

CREATE POLICY "Allow public read active products" ON public.products
    FOR SELECT USING (active = true);

CREATE POLICY "Allow public read active product variants" ON public.product_variants
    FOR SELECT USING (status = 'active');

CREATE POLICY "Allow public read active batches" ON public.batches
    FOR SELECT USING (active = true);

CREATE POLICY "Allow public read public COAs" ON public.coas
    FOR SELECT USING (is_public = true);

CREATE POLICY "Allow public read active discounts" ON public.discounts
    FOR SELECT USING (active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- 2. PUBLIC INSERT POLICIES
CREATE POLICY "Allow public insert email subscribers" ON public.email_subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert contact requests" ON public.contact_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert restock requests" ON public.restock_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert guest orders" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

-- 3. CUSTOMER POLICIES
CREATE POLICY "Allow customers read own profile" ON public.customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow customers update own profile" ON public.customers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow customers read own orders" ON public.orders
    FOR SELECT USING (
        customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
    );

-- 4. SERVICE ROLE / ADMIN FULL ACCESS POLICIES
-- Service-role bypasses RLS automatically.
-- For authenticated admin users with role='admin' in auth.users app_metadata:
CREATE POLICY "Allow admin full access categories" ON public.categories
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access products" ON public.products
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access variants" ON public.product_variants
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access batches" ON public.batches
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access coas" ON public.coas
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access orders" ON public.orders
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access order items" ON public.order_items
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access inventory" ON public.inventory_transactions
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access discounts" ON public.discounts
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access affiliates" ON public.affiliates
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access conversions" ON public.affiliate_conversions
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access subscribers" ON public.email_subscribers
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access contact requests" ON public.contact_requests
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access restock requests" ON public.restock_requests
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access audit logs" ON public.admin_audit_logs
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
