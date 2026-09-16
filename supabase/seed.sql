-- Seed data for Vial Foundry Database (seed.sql)
-- Clean production-ready baseline seeds: standard categories, product catalogue, and active promotional discounts.
-- NO synthetic researcher reviews, NO fake purity metrics, and NO fake batch certificates.

-- Insert Categories
INSERT INTO public.categories (id, slug, name, description, sort_order) VALUES
('c1111111-1111-1111-1111-111111111111', 'reference-materials', 'Reference Materials', 'Purified peptide and chemical reference standards', 1),
('c2222222-2222-2222-2222-222222222222', 'analytical-standards', 'Analytical Standards', 'Chromatographic calibration and HPLC standards', 2),
('c3333333-3333-3333-3333-333333333333', 'single-compounds', 'Single Compounds', 'Purified single molecule research compounds', 3),
('c4444444-4444-4444-4444-444444444444', 'specialty-materials', 'Specialty Materials', 'Specialized biochemical research compounds', 4),
('c5555555-5555-5555-5555-555555555555', 'lab-supplies', 'Lab Supplies', 'Ultra-pure solvents and laboratory reconstitution media', 5)
ON CONFLICT (slug) DO NOTHING;

-- Insert Base Products (Reference Identity Data)
INSERT INTO public.products (
    id, slug, sku, name, short_description, technical_description, category_id,
    active, featured, base_price, inventory_quantity, image_url, transparent_image_url,
    cas_number, sequence, chemical_formula, molecular_weight, storage_conditions, appearance, solubility
) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'bpc-157-reference-standard',
    'VF-SKU-991',
    'BPC-157 Reference Standard',
    'Synthetic 15-amino-acid peptide fragment reference standard prepared via solid-phase synthesis for research use only.',
    'Desiccated white lyophilized powder.',
    'c1111111-1111-1111-1111-111111111111',
    true, true, 64.00, 142,
    '/assets/vials/products/bpc-157.webp',
    '/assets/vials/products/bpc-157-transparent.webp',
    '137525-51-0',
    'Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val',
    'C62H98N16O22',
    '1419.56 g/mol',
    'Store at -20°C in a dry environment. Protect from ambient light.',
    'White to off-white lyophilized cake / powder',
    'Soluble in sterile ultra-pure water (18.2 MΩ·cm) up to 10 mg/mL'
),
(
    '22222222-2222-2222-2222-222222222222',
    'tb-500-thymosin-beta-4-standard',
    'VF-SKU-992',
    'TB-500 (Thymosin Beta-4 Fragment) Standard',
    'Synthetic N-terminal acetylated peptide fragment standard intended for laboratory research use.',
    'Lyophilized powder.',
    'c1111111-1111-1111-1111-111111111111',
    true, false, 88.00, 96,
    '/assets/vials/products/tb-500.webp',
    '/assets/vials/products/tb-500-transparent.webp',
    '77591-33-4',
    'Ac-Ser-Asp-Lys-Pro-Asp-Met-Ala-Glu-Ile-Glu-Lys-Phe-Asp-Lys-Ser-Lys-Leu-Lys-Lys-Thr-Glu-Thr-Gln-Glu-Lys-Asn-Pro-Leu-Pro-Ser-Lys-Glu-Thr-Ile-Glu-Gln-Glu-Lys-Gln-Ala-Gly-Glu-Ser',
    'C212H350N56O78S',
    '4963.50 g/mol',
    'Store at -20°C long term. Keep container sealed tightly.',
    'Fluffy white lyophilized powder',
    'Soluble in aqueous buffers (pH 6.5–7.4)'
),
(
    '33333333-3333-3333-3333-333333333333',
    'semaglutide-analytical-standard',
    'VF-SKU-993',
    'Semaglutide Analytical Standard',
    'Synthetic acylated GLP-1 receptor agonist reference standard manufactured for chromatography, spectrometry, and assay validation.',
    'Dense white powder.',
    'c2222222-2222-2222-2222-222222222222',
    true, true, 112.00, 68,
    '/assets/vials/products/semaglutide.webp',
    '/assets/vials/products/semaglutide-transparent.webp',
    '910463-68-2',
    'His-Aib-Glu-Gly-Thr-Phe-Thr-Ser-Asp-Val-Ser-Ser-Tyr-Leu-Glu-Gly-Gln-Ala-Ala-Lys(AEEAc-AEEAc-gamma-Glu-17-carboxyheptadecanoyl)-Glu-Phe-Ile-Ala-Trp-Leu-Val-Arg-Gly-Arg-Gly',
    'C187H291N45O59',
    '4113.58 g/mol',
    'Store desiccated at -20°C',
    'Dense white powder',
    'Soluble in 0.1M PBS pH 7.4'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert Standard Promotional Discount Codes
INSERT INTO public.discounts (code, description, discount_type, discount_value, min_order_amount, active) VALUES
('FOUNDRY10', '10% discount on initial institutional orders', 'percentage', 10.00, 100.00, true),
('RESEARCH25', '$25 off orders above $200', 'fixed_amount', 25.00, 200.00, true)
ON CONFLICT (code) DO NOTHING;
