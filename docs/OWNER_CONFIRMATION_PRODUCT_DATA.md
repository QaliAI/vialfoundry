# Owner Confirmation: Product Technical Data & Operational Claims Audit

## Purpose
This document audits all public product fields in `src/data/products.ts` per Phase 14 specifications.
Technical data has been classified into:
- **Category A**: Supported by supplier/batch documentation (when physical COA is held)
- **Category B**: Stable reference identity data (CAS, MW, Formula, Sequence, RUO Description)
- **Category C**: Operational or physical characteristics requiring owner confirmation against manufacturer specification sheets.

---

## 1. Stable Reference Identity Data (Category B — Verified Stable)
The following fields across all 20 SKUs represent established chemical reference constants from PubChem, IUPAC, and standard peptide registries. They have been verified and retained without modification:
- **CAS Numbers**: Standard Chemical Abstracts Service registry numbers (e.g., BPC-157: 137525-51-0; Semaglutide: 910463-68-2; Tirzepatide: 2023788-19-2).
- **Molecular Weights & Chemical Formulas**: Stoichiometrically derived molecular weights and elemental formulas.
- **Primary Amino Acid Sequences**: Standard FASTA/IUPAC 3-letter sequences for single compounds.
- **Product Descriptions**: Factual, concise descriptions stating physical peptide fragment identity and RUO laboratory use. No therapeutic or clinical claims are made.

---

## 2. Items Requiring Owner / Supplier Confirmation (Category C)

The following operational values are commonly provided on manufacturer Certificates of Analysis or technical data sheets. The site owner should cross-reference these against supplier specifications upon receipt of physical batch lots:

### A. Specific Solubility Figures
- **VF-SKU-991 (BPC-157)**: `Soluble in sterile ultra-pure water (18.2 MO·cm) up to 10 mg/mL` &rarr; Confirm if 10 mg/mL ceiling is standard across current manufacturing lots.
- **VF-SKU-996 (CJC-1295 no DAC)**: `Water soluble (>5 mg/mL)` &rarr; Confirm reconstitution buffer recommendation.
- **VF-SKU-998 (NAD+)**: `Soluble in water (50 mg/mL)` &rarr; Confirm solubility concentration limit for reagent handling.
- **VF-SKU-1011 (Sermorelin)**: `Soluble in sterile water (>2 mg/mL)` &rarr; Confirm reconstitution concentration.
- **VF-SKU-1012 (Tesamorelin)**: `Soluble in dilute acetic acid / water` &rarr; Confirm acid molarity guidance (e.g., 0.1% AcOH vs sterile water).

### B. Storage Temperature Nuances
- **VF-SKU-999 (GHK-Cu)**: `Store at 4°C in dark container` &rarr; Confirm if supplier specifies 4°C or standard peptide -20°C storage for lyophilized powder.
- **VF-SKU-994 (Tirzepatide)**: `Store at -20°C in dark vacuum container` &rarr; Confirm packaging seal requirement.

### C. Appearance Notes
- All peptides are currently described with variants of `White to off-white lyophilized cake / powder` or `Fluffy white lyophilized powder`, and GHK-Cu as `Deep blue powder`. These are physically standard for lyophilized salts but should be visually verified against physical vial stock.
