-- Vial Foundry Reviews / Social Proof (03_reviews.sql)

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    product_slug VARCHAR(255),
    reviewer_name VARCHAR(255) NOT NULL,
    reviewer_org VARCHAR(255),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    body TEXT NOT NULL,
    verified BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read published reviews" ON public.reviews
    FOR SELECT USING (status = 'published');

CREATE POLICY "Allow admin full access reviews" ON public.reviews
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
