-- Explicit catalog lifecycle and family grouping for SKU-level configurations.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS family_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS display_size VARCHAR(255),
  ADD COLUMN IF NOT EXISTS catalog_status VARCHAR(20) NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS purchasable BOOLEAN NOT NULL DEFAULT true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_catalog_status_check'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_catalog_status_check
      CHECK (catalog_status IN ('public', 'hidden', 'retired'));
  END IF;
END $$;

INSERT INTO public.categories (id, slug, name, description, sort_order, active)
VALUES (
  'c6666666-6666-6666-6666-666666666666',
  'research-blends',
  'Research Blends',
  'Multi-component research materials with exact configurations',
  4,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  active = true;

UPDATE public.products
SET catalog_status = 'retired', purchasable = false, active = false
WHERE id = 'vf-std-010';

UPDATE public.products
SET catalog_status = 'hidden', purchasable = false, active = false
WHERE id = 'vf-std-020';
