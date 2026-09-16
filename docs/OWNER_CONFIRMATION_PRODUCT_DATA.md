# Owner Confirmation: Product Technical Data & Operational Claims Audit

## Purpose
This document audits all public product fields in `src/data/products.ts`.
Technical data is classified strictly into:
- **REFERENCE IDENTITY DATA**: Chemical identity constants (CAS numbers, molecular formulas, molecular weights, sequences, and standard RUO product descriptions).
- **SUPPLIER-CONFIRMED DATA**: Data confirmed against supplier specification sheets or laboratory certificates once physical documentation is held.
- **OWNER CONFIRMATION REQUIRED**: Physical attributes, lot numbers, packaging sizes, and solubility characteristics requiring owner confirmation against physical inventory and supplier documentation.

---

## 1. REFERENCE IDENTITY DATA
The following catalog fields represent standard chemical nomenclature and sequence specifications. No therapeutic or clinical claims are made:
- **CAS Numbers**: Chemical Abstracts Service registry numbers assigned to catalog compounds (e.g., BPC-157: 137525-51-0; Semaglutide: 910463-68-2; Tirzepatide: 2023788-19-2).
- **Molecular Weights & Chemical Formulas**: Stoichiometric molecular weights and elemental formulas.
- **Primary Amino Acid Sequences**: Standard single-letter / three-letter peptide sequences.
- **Product Descriptions**: Concise, factual descriptions indicating research chemical identity and laboratory research use only (RUO).

---

## 2. SUPPLIER-CONFIRMED DATA
The following fields reflect data that must be backed by supplier documentation or authentic analytical certificates:
- **Purity Figures & Chromatographic Data**: Currently, 0 analytical certificates are loaded in `src/data/verified-batch-records.ts`. No purity percentages or peak integrations are published on the storefront.
- **Issuing Laboratory Attribution**: When certificates are uploaded, the issuing third-party analytical laboratory must be explicitly named.

---

## 3. OWNER CONFIRMATION REQUIRED

The following operational characteristics must be cross-referenced by the site owner against physical inventory and supplier specification sheets:

### A. Lot Numbers Across All 20 SKUs
Confirm that the lot numbers listed in `src/data/products.ts` match the physical vial labels:
- `vf-std-001` (BPC-157 5mg): `LOT-VF-8842`
- `vf-std-002` (TB-500 10mg): `LOT-VF-9921`
- `vf-std-003` (Semaglutide 5mg): `LOT-VF-7731`
- `vf-std-004` (Tirzepatide 10mg): `LOT-VF-6619`
- `vf-std-005` (CJC-1295 5mg): `LOT-VF-5544`
- `vf-std-006` (Ipamorelin 5mg): `LOT-VF-4432`
- `vf-std-007` (NAD+ 500mg): `LOT-VF-3321`
- `vf-std-008` (Glutathione 600mg): `LOT-VF-2210`
- `vf-std-009` (Bacteriostatic Water 10ml): `LOT-VF-1199`
- `vf-std-010` (Bacteriostatic Water 30ml): `LOT-VF-1198` *(Withheld from public catalog)*
- `vf-std-011` (GHK-Cu 50mg): `LOT-VF-8877`
- `vf-std-012` (PT-141 10mg): `LOT-VF-7766`
- `vf-std-013` (Melanotan II 10mg): `LOT-VF-6655`
- `vf-std-014` (Epithalon 10mg): `LOT-VF-5545`
- `vf-std-015` (Sermorelin 5mg): `LOT-VF-4433`
- `vf-std-016` (MOTS-c 10mg): `LOT-VF-3322`
- `vf-std-017` (BPC-157 / TB-500 Blend 10mg): `LOT-VF-2211`
- `vf-std-018` (Retatrutide 10mg): `LOT-VF-1100`
- `vf-std-019` (AOD-9604 5mg): `LOT-VF-9988`
- `vf-std-020` (Acetonitrile 1L): `LOT-VF-3560` *(Withheld from public catalog)*

### B. Packaging & Container-Accurate Photography
- **VF-SKU-1010 (Bacteriostatic Water 30ml)**: Withheld from public storefront because current image asset depicts a 10 mL vial. Requires authentic 30 mL multi-dose container photography.
- **VF-SKU-1020 (Acetonitrile HPLC Grade 1L)**: Withheld from public storefront because current image asset depicts a 10 mL vial. Requires authentic 1 L amber glass bottle photography.

### C. Specific Solubility & Storage Notes
Confirm the following item-specific technical notes against supplier specification sheets:
- **VF-SKU-991 (BPC-157)**: Reconstitution in sterile ultra-pure water (up to 10 mg/mL).
- **VF-SKU-996 (CJC-1295 no DAC)**: Reconstitution guidance (>5 mg/mL).
- **VF-SKU-998 (NAD+)**: Solubility limit (50 mg/mL).
- **VF-SKU-999 (GHK-Cu)**: Storage temperature guidance (4°C vs -20°C for lyophilized powder).
- **VF-SKU-1011 (Sermorelin)**: Solubility guidance (>2 mg/mL).
- **VF-SKU-1012 (Tesamorelin)**: Solubility buffer requirement (dilute aqueous acetic acid vs sterile water).
