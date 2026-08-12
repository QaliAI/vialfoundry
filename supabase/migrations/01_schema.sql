-- Vial Foundry Supabase Schema Migration (01_schema.sql)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_description TEXT,
    technical_description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    base_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    compare_at_price NUMERIC(10, 2),
    inventory_tracking_enabled BOOLEAN DEFAULT true,
    inventory_quantity INT DEFAULT 100,
    low_stock_threshold INT DEFAULT 10,
    image_url TEXT,
    transparent_image_url TEXT,
    cas_number VARCHAR(100),
    sequence TEXT,
    chemical_formula VARCHAR(200),
    molecular_weight VARCHAR(100),
    storage_conditions TEXT,
    appearance TEXT,
    solubility TEXT,
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    size VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    compare_at_price NUMERIC(10, 2),
    inventory_quantity INT DEFAULT 50,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BATCHES / LOTS TABLE
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    lot_number VARCHAR(100) UNIQUE NOT NULL,
    manufacturing_date DATE,
    testing_date DATE,
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'verified',
    testing_lab VARCHAR(255) NOT NULL,
    reported_purity NUMERIC(5, 2) NOT NULL,
    identity_method VARCHAR(100) DEFAULT 'HPLC-UV / ESI-MS',
    identity_verified BOOLEAN DEFAULT true,
    lab_notes TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COAS / DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.coas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    document_type VARCHAR(100) DEFAULT 'Certificate of Analysis',
    storage_path TEXT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    is_public BOOLEAN DEFAULT true,
    verification_url TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE, -- References auth.users(id) if registered
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    guest_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, cancelled
    payment_status VARCHAR(50) DEFAULT 'unpaid', -- unpaid, paid, refunded
    fulfillment_status VARCHAR(50) DEFAULT 'unfulfilled', -- unfulfilled, processing, shipped, delivered
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    shipping_amount NUMERIC(10, 2) DEFAULT 0.00,
    tax_amount NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    shipping_address JSONB,
    billing_address JSONB,
    tracking_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    variant_title VARCHAR(255),
    sku VARCHAR(100) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_price NUMERIC(10, 2) NOT NULL
);

-- 9. INVENTORY TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL, -- sale, manual_adjustment, restock, cancellation, refund, damaged
    quantity_change INT NOT NULL,
    previous_quantity INT NOT NULL,
    new_quantity INT NOT NULL,
    reason TEXT,
    reference_id VARCHAR(100),
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. DISCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(50) NOT NULL DEFAULT 'percentage', -- percentage, fixed_amount
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_amount NUMERIC(10, 2) DEFAULT 0.00,
    max_discount_amount NUMERIC(10, 2),
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    usage_limit INT,
    usage_count INT DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AFFILIATES TABLE
CREATE TABLE IF NOT EXISTS public.affiliates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    referral_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    commission_rate NUMERIC(5, 2) DEFAULT 10.00,
    total_conversions INT DEFAULT 0,
    total_earned NUMERIC(10, 2) DEFAULT 0.00,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AFFILIATE CONVERSIONS TABLE
CREATE TABLE IF NOT EXISTS public.affiliate_conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    order_amount NUMERIC(10, 2) NOT NULL,
    commission_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, paid, rejected
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. EMAIL SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.email_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    source VARCHAR(100) DEFAULT 'footer_form',
    consent_timestamp TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'subscribed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. CONTACT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.contact_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    institution VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. RESTOCK REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.restock_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
