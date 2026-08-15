-- Seed data for Vial Foundry Database (seed.sql)

-- Insert Categories
INSERT INTO public.categories (id, slug, name, description, sort_order) VALUES
('c1111111-1111-1111-1111-111111111111', 'reference-materials', 'Reference Materials', 'Purified peptide and chemical reference standards', 1),
('c2222222-2222-2222-2222-222222222222', 'analytical-standards', 'Analytical Standards', 'Chromatographic calibration and HPLC standards', 2),
('c3333333-3333-3333-3333-333333333333', 'single-compounds', 'Single Compounds', 'Purified single molecule research compounds', 3),
('c4444444-4444-4444-4444-444444444444', 'specialty-materials', 'Specialty Materials', 'Specialized biochemical research compounds', 4),
('c5555555-5555-5555-5555-555555555555', 'lab-supplies', 'Lab Supplies', 'Ultra-pure solvents and laboratory reconstitution media', 5)
ON CONFLICT (slug) DO NOTHING;

-- Insert Products
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
    'High-purity synthetic peptide fragment reference standard prepared via solid-phase synthesis.',
    'Purity verified by RP-HPLC (>99.5% area). Mass confirmed via ESI-MS. White lyophilized cake.',
    'c1111111-1111-1111-1111-111111111111',
    true, true, 64.00, 142,
    '/assets/vials/single-vial-dark.webp',
    '/assets/vials/vial-transparent.webp',
    '137525-51-0',
    'Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val',
    'C62H98N16O22',
    '1419.56 g/mol',
    'Store at -20°C in a dry environment.',
    'White to off-white lyophilized cake',
    'Soluble in sterile water'
),
(
    '22222222-2222-2222-2222-222222222222',
    'tb-500-thymosin-beta-4-standard',
    'VF-SKU-992',
    'TB-500 (Thymosin Beta-4 Fragment) Standard',
    'Purified N-terminal acetylated synthetic peptide fragment standard intended for calibration.',
    'RP-HPLC Purity: 99.48% peak area. ESI-MS m/z [M+4H]4+ = 1241.88.',
    'c1111111-1111-1111-1111-111111111111',
    true, true, 88.00, 96,
    '/assets/vials/single-vial-dark.webp',
    '/assets/vials/vial-transparent.webp',
    '77591-33-4',
    'Ac-Ser-Asp-Lys-Pro-Asp-Met-Ala-Glu-Ile-Glu-Lys-Phe-Asp-Lys-Ser-Lys-Leu-Lys-Lys-Thr-Glu-Thr-Gln-Glu-Lys-Asn-Pro-Leu-Pro-Ser-Lys-Glu-Thr-Ile-Glu-Gln-Glu-Lys-Gln-Ala-Gly-Glu-Ser',
    'C212H350N56O78S',
    '4963.50 g/mol',
    'Store desiccated at -20°C.',
    'Fluffy white powder',
    'Soluble in aqueous buffers'
),
(
    '33333333-3333-3333-3333-333333333333',
    'semaglutide-analytical-standard',
    'VF-SKU-993',
    'Semaglutide Analytical Standard',
    'Ultra-pure acylated peptide reference standard manufactured for chromatography and spectrometry.',
    'HPLC Purity: 99.78%. Mass matches structural identity. Karl Fischer water content < 3.8%.',
    'c2222222-2222-2222-2222-222222222222',
    true, true, 112.00, 68,
    '/assets/vials/single-vial-dark.webp',
    '/assets/vials/vial-transparent.webp',
    '910463-68-2',
    'His-Aib-Glu-Gly-Thr-Phe-Thr-Ser-Asp-Val-Ser-Ser-Tyr-Leu-Glu-Gly-Gln-Ala-Ala-Lys-Glu-Phe-Ile-Ala-Trp-Leu-Val-Arg-Gly-Arg-Gly',
    'C187H291N45O59',
    '4113.58 g/mol',
    'Store desiccated at -20°C',
    'Dense white powder',
    'Soluble in PBS pH 7.4'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert Batches
INSERT INTO public.batches (
    id, product_id, lot_number, manufacturing_date, testing_date, expiry_date,
    status, testing_lab, reported_purity, identity_method, identity_verified, lab_notes
) VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'LOT-VF-8842',
    '2026-06-04', '2026-07-14', '2028-06-04',
    'verified', 'Janoshik Analytical Laboratories', 99.64,
    'HPLC-UV / ESI-MS', true,
    'RP-HPLC integration demonstrates single dominant chromatographic peak at RT 14.28 min. Mass verified at 1419.56 Da.'
),
(
    'a2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'LOT-VF-9921',
    '2026-05-18', '2026-06-28', '2028-05-18',
    'verified', 'Alliance Analytical Services', 99.48,
    'UHPLC-MS/MS', true,
    'Gradient UHPLC analysis. Mass spectrum quadruply charged ion peak [M+4H]4+ at m/z 1241.88 matches sequence composition.'
)
ON CONFLICT (lot_number) DO NOTHING;

-- Insert Sample Discount Code
INSERT INTO public.discounts (code, description, discount_type, discount_value, min_order_amount, active) VALUES
('FOUNDRY10', '10% discount on initial institutional orders', 'percentage', 10.00, 100.00, true),
('RESEARCH25', '$25 off orders above $200', 'fixed_amount', 25.00, 200.00, true)
ON CONFLICT (code) DO NOTHING;
