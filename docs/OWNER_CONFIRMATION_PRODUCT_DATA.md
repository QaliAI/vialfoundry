# Owner Confirmation: Product Technical Data & Operational Claims Audit

## Purpose
This document audits all public product fields in `src/data/products.ts` across all 20 catalog SKUs.
Technical data is classified strictly into:
- **REFERENCE IDENTITY DATA**: Factual chemical constants (CAS registry numbers, elemental formulas, molecular weights, amino acid sequences, standard RUO category designations).
- **SUPPLIER SPECIFICATION DATA**: Data based on manufacturer specification sheets pending physical inventory verification.
- **OWNER CONFIRMATION REQUIRED**: Physical batch lots, container packaging sizes, on-hand physical stock counts, and observed appearance/solubility properties requiring direct owner verification against supplier documentation and warehouse stock.

---

## 1. Product Catalog Audit Table (All 20 SKUs)

| ID | SKU | Display Name | Size / Presentation | Lot Number | Stock Count | Storage Requirement | Observed Appearance | Solubility Spec | Confirmation Status |
|:---|:---|:---|:---|:---|:---:|:---|:---|:---|:---:|
| `vf-std-001` | `VF-SKU-991` | **BPC-157** | 5 mg Lyophilized Vial | `LOT-VF-8842` | 142 | Store at -20°C in a dry environment. Protect from ambient light. | White to off-white lyophilized cake / powder | Soluble in sterile ultra-pure water (18.2 MΩ·cm) up to 10 mg/mL | **OWNER CONFIRMATION REQUIRED** |
| `vf-std-002` | `VF-SKU-992` | **TB-500** | 10 mg Lyophilized Vial | `LOT-VF-9921` | 96 | Store at -20°C long term. Keep container sealed tightly. | Fluffy white lyophilized powder | Soluble in aqueous buffers (pH 6.5–7.4) | **OWNER CONFIRMATION REQUIRED** |
| `vf-std-003` | `VF-SKU-993` | **Semaglutide** | 5 mg Lyophilized Vial | `LOT-VF-7734` | 68 | Store desiccated at -20°C | Dense white powder | Soluble in 0.1M PBS pH 7.4 | **OWNER CONFIRMATION REQUIRED** |
| `vf-std-004` | `VF-SKU-994` | **Tirzepatide** | 10 mg Lyophilized Vial | `LOT-VF-8819` | 54 | Store at -20°C in dark vacuum container | White amorphous powder | Soluble in phosphate buffer pH 7.2 | **OWNER CONFIRMATION REQUIRED** |
| `vf-std-005` | `VF-SKU-995` | **Retatrutide** | 10 mg Lyophilized Vial | `LOT-VF-6612` | 31 | Store at -20°C | White crystalline solid | Soluble in aqueous buffers | **OWNER CONFIRMATION REQUIRED** |
| `vf-std-006` | `VF-SKU-996` | **CJC-1295 (No DAC)** | 5 mg Lyophilized Vial | `LOT-VF-5590` | 110 | Store at -20°C | White powder | Water soluble (>5 mg/mL) | **OWNER CONFIRMATION REQUIRED** |
| `vf-std-007` | `VF-SKU-997` | **Ipamorelin** | 5 mg Lyophilized Vial | `LOT-VF-4431` | 125 | Store at -20°C | White powder | Soluble in water and saline solutions | **OWNER CONFIRMATION REQUIRED** |
| `vf-std-008` | `VF-SKU-998` | **NAD+** | 1000 mg (1g) Crystalline Powder | `LOT-VF-3310` | 210 | Store at -20°C desiccated | White to pale yellow powder | Soluble in water (50 mg/mL) | **OWNER CONFIRMATION REQUIRED** |
| `vf-std-009` | `VF-SKU-999` | **GHK-Cu** | 50 mg Powder Vial | `LOT-VF-2209` | 88 | Store at 4°C in dark container | Deep blue powder | Highly soluble in water | **OWNER CONFIRMATION REQUIRED** |
| `vf-std-010` | `VF-SKU-1000` | **Bacteriostatic Water** | 30 mL Sealed Glass Vial | `LOT-VF-1105` | 520 | Store at 15–25°C | Clear, colorless liquid | Miscible in all aqueous media | **WITHHELD FROM CATALOG (Owner packaging photo required)** |
| `vf-std-011` | `VF-SKU-1011` | **Sermorelin** | 5 mg Lyophilized Vial | `LOT-VF-3021` | 102 | Store at -20°C, protect from moisture. | White lyophilized powder | Soluble in sterile water (>2 mg/mL) | **OWNER CONFIRMATION REQUIRED** |
| `vf-std-012` | `VF-SKU-1012` | **Tesamorelin** | 5 mg Lyophilized Vial | `LOT-VF-3088` | 44 | Store at -20°C in dark, sealed vial. | White to off-white powder | Soluble in dilute acetic acid / water | **OWNER CONFIRMATION REQUIRED** |
| `vf-std-013` | `VF-SKU-1013` | **PT-141** | 10 mg Lyophilized Vial | `LOT-VF-3140` | 96 | Store at -20°C. | White to slightly yellow powder | Water soluble | **OWNER CONFIRMATION REQUIRED** |
| `vf-std-014` | `VF-SKU-1014` | **Selank** | 10 mg Lyophilized Vial | `LOT-VF-3202` | 118 | Store at -20°C. | White powder | Freely soluble in water | **OWNER CONFIRMATION REQUIRED** |
| `vf-std-015` | `VF-SKU-1015` | **Semax** | 10 mg Lyophilized Vial | `LOT-VF-3277` | 90 | Store desiccated at -20°C. | White amorphous powder | Soluble in water | **OWNER CONFIRMATION REQUIRED** |
| `vf-std-016` | `VF-SKU-1016` | **Epithalon** | 10 mg Lyophilized Vial | `LOT-VF-3315` | 140 | Store at -20°C. | White powder | Water soluble | **OWNER CONFIRMATION REQUIRED** |
| `vf-std-017` | `VF-SKU-1017` | **Thymosin Alpha-1** | 10 mg Lyophilized Vial | `LOT-VF-3390` | 58 | Store at -20°C, protect from light. | White lyophilized cake | Soluble in aqueous buffers pH 6-7 | **OWNER CONFIRMATION REQUIRED** |
| `vf-std-018` | `VF-SKU-1018` | **MOTS-c** | 10 mg Lyophilized Vial | `LOT-VF-3444` | 0 | Store at -20°C. | White to off-white powder | Soluble in water and dilute acetic acid | **OWNER CONFIRMATION REQUIRED** |
| `vf-std-019` | `VF-SKU-1019` | **AOD-9604** | 5 mg Lyophilized Vial | `LOT-VF-3501` | 74 | Store at -20°C. | White lyophilized powder | Soluble in sterile water | **OWNER CONFIRMATION REQUIRED** |
| `vf-std-020` | `VF-SKU-1020` | **Acetonitrile** | 1 L Amber Glass Bottle | `LOT-VF-3560` | 260 | Store at 15-25°C, away from ignition sources. | Clear, colorless liquid | Miscible with water and most organic solvents | **WITHHELD FROM CATALOG (Owner packaging photo required)** |

---

## 2. Detailed Breakdown of Confirmation Requirements

### A. Lot Numbers & Physical Vial Labels
Confirm that each lot number configured in `src/data/products.ts` matches the current active physical lot in inventory:
- **`VF-SKU-991` (BPC-157)**: Configured lot is `LOT-VF-8842`. Status: **OWNER CONFIRMATION REQUIRED**.
- **`VF-SKU-992` (TB-500)**: Configured lot is `LOT-VF-9921`. Status: **OWNER CONFIRMATION REQUIRED**.
- **`VF-SKU-993` (Semaglutide)**: Configured lot is `LOT-VF-7734`. Status: **OWNER CONFIRMATION REQUIRED**.
- **`VF-SKU-994` (Tirzepatide)**: Configured lot is `LOT-VF-8819`. Status: **OWNER CONFIRMATION REQUIRED**.
- **`VF-SKU-995` (Retatrutide)**: Configured lot is `LOT-VF-6612`. Status: **OWNER CONFIRMATION REQUIRED**.
- **`VF-SKU-996` (CJC-1295 (No DAC))**: Configured lot is `LOT-VF-5590`. Status: **OWNER CONFIRMATION REQUIRED**.
- **`VF-SKU-997` (Ipamorelin)**: Configured lot is `LOT-VF-4431`. Status: **OWNER CONFIRMATION REQUIRED**.
- **`VF-SKU-998` (NAD+)**: Configured lot is `LOT-VF-3310`. Status: **OWNER CONFIRMATION REQUIRED**.
- **`VF-SKU-999` (GHK-Cu)**: Configured lot is `LOT-VF-2209`. Status: **OWNER CONFIRMATION REQUIRED**.
- **`VF-SKU-1000` (Bacteriostatic Water)**: Configured lot is `LOT-VF-1105`. Status: **OWNER CONFIRMATION REQUIRED**.
- **`VF-SKU-1011` (Sermorelin)**: Configured lot is `LOT-VF-3021`. Status: **OWNER CONFIRMATION REQUIRED**.
- **`VF-SKU-1012` (Tesamorelin)**: Configured lot is `LOT-VF-3088`. Status: **OWNER CONFIRMATION REQUIRED**.
- **`VF-SKU-1013` (PT-141)**: Configured lot is `LOT-VF-3140`. Status: **OWNER CONFIRMATION REQUIRED**.
- **`VF-SKU-1014` (Selank)**: Configured lot is `LOT-VF-3202`. Status: **OWNER CONFIRMATION REQUIRED**.
- **`VF-SKU-1015` (Semax)**: Configured lot is `LOT-VF-3277`. Status: **OWNER CONFIRMATION REQUIRED**.
- **`VF-SKU-1016` (Epithalon)**: Configured lot is `LOT-VF-3315`. Status: **OWNER CONFIRMATION REQUIRED**.
- **`VF-SKU-1017` (Thymosin Alpha-1)**: Configured lot is `LOT-VF-3390`. Status: **OWNER CONFIRMATION REQUIRED**.
- **`VF-SKU-1018` (MOTS-c)**: Configured lot is `LOT-VF-3444`. Status: **OWNER CONFIRMATION REQUIRED**.
- **`VF-SKU-1019` (AOD-9604)**: Configured lot is `LOT-VF-3501`. Status: **OWNER CONFIRMATION REQUIRED**.
- **`VF-SKU-1020` (Acetonitrile)**: Configured lot is `LOT-VF-3560`. Status: **OWNER CONFIRMATION REQUIRED**.

### B. Packaging Photography & Container Accuracy
- **`VF-SKU-1010` (Bacteriostatic Water 30 mL)**: Withheld from public catalog. Current image depicts a 10 mL vial. Requires authentic 30 mL multi-dose container photography before publishing.
- **`VF-SKU-1020` (Acetonitrile HPLC Grade 1 L)**: Withheld from public catalog. Current image depicts a 10 mL vial. Requires authentic 1 L amber glass bottle photography before publishing.

### C. Chemical Identity Constants (Reference Standards)
The following fields represent standardized biochemical reference properties:
- **CAS Numbers**: Verified against Chemical Abstracts Service / PubChem registries.
- **Molecular Weights & Formulas**: Stoichiometric constants.
- **Sequences**: Standard FASTA peptide primary sequences.

### D. Analytical Certificates of Analysis (COAs)
- **Current Status**: 0 analytical certificates are currently loaded into `src/data/verified-batch-records.ts`.
- Storefront displays `Documentation: Pending Supplier File` across all active products.
- No synthetic purity figures (e.g. 99.8%) or fake laboratory affiliations are published on any public product page.

---
*Last audited and regenerated: 2026-09-16 during Final Operational Launch QA.*
