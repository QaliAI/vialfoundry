# Goldmine / Vial Foundry Catalog Parity Report

Audit date: 2026-09-17

## Sources and outcome

- Primary source: `QaliAI/goldmine-official/data/goldmine-products.json` at commit `3618e2e`.
- Secondary source: `data/imports/goldmine-inventory-price-list.xlsx`.
- Publication check: the live Goldmine catalog remains public and lists the audited families.
- Current authoritative total: **21 product families / 26 sellable configurations**. This matches the prior 21/26 baseline.
- The JSON is newer than the spreadsheet and wins where price or inventory differs.
- Pre-implementation Vial result: **8 exact matches / 18 missing configurations**.

## Configuration comparison before implementation

| Goldmine configuration | Vial configuration before sprint | Status |
| --- | --- | --- |
| Semaglutide — 5 mg | Semaglutide — 5 mg (`VF-SKU-993`) | EXACT MATCH |
| Semaglutide — 10 mg | None | MISSING |
| Tirzepatide — 30 mg | Tirzepatide — 10 mg only (`VF-SKU-994`) | WRONG SIZE |
| Tirzepatide — 60 mg | Tirzepatide — 10 mg only (`VF-SKU-994`) | WRONG SIZE |
| Retatrutide — 10 mg | Retatrutide — 10 mg (`VF-SKU-995`) | EXACT MATCH |
| Retatrutide — 20 mg | Retatrutide — 10 mg only (`VF-SKU-995`) | WRONG SIZE |
| Retatrutide — 30 mg | Retatrutide — 10 mg only (`VF-SKU-995`) | WRONG SIZE |
| Tesamorelin — 10 mg | Tesamorelin — 5 mg only (`VF-SKU-1012`) | WRONG SIZE |
| CJC-1295 No DAC + Ipamorelin — 10 mg total (5 mg + 5 mg) | Separate 5 mg CJC-1295 and 5 mg Ipamorelin products only | WRONG CONFIGURATION |
| BPC-157 + TB-500 — Wolverine — 20 mg total (10 mg + 10 mg) | Separate BPC-157 and TB-500 products only | WRONG CONFIGURATION |
| Thymosin Alpha-1 — 10 mg | Thymosin Alpha-1 — 10 mg (`VF-SKU-1017`) | EXACT MATCH |
| GHK-Cu — 50 mg | GHK-Cu — 50 mg (`VF-SKU-999`) | EXACT MATCH |
| MT-2 — 10 mg | None | MISSING |
| Selank — 10 mg | Selank — 10 mg (`VF-SKU-1014`) | EXACT MATCH |
| Semax — 10 mg | Semax — 10 mg (`VF-SKU-1015`) | EXACT MATCH |
| PT-141 — 10 mg | PT-141 — 10 mg (`VF-SKU-1013`) | EXACT MATCH |
| Kisspeptin — 10 mg | None | MISSING |
| NAD+ — 500 mg | NAD+ — 1,000 mg only (`VF-SKU-998`) | WRONG SIZE |
| MOTS-C — 40 mg | MOTS-C — 10 mg only (`VF-SKU-1018`) | WRONG SIZE |
| SS-31 — 50 mg | None | MISSING |
| Epithalon — 10 mg | Epithalon — 10 mg (`VF-SKU-1016`) | EXACT MATCH |
| GLOW — 70 mg total (BPC-157 10 mg + TB-500 10 mg + GHK-Cu 50 mg) | None | MISSING |
| KLOW — 80 mg total (BPC-157 10 mg + TB-500 10 mg + GHK-Cu 50 mg + KPV 10 mg) | None | MISSING |
| KPV — 10 mg | None | MISSING |
| Bacteriostatic Water — 10 mL | 30 mL hidden record only | WRONG SIZE |
| Bacteriostatic Water — 3 mL | 30 mL hidden record only | WRONG SIZE |

## Legacy and Vial-only records

| Vial configuration | Status | Treatment |
| --- | --- | --- |
| Bacteriostatic Water — 30 mL (`VF-SKU-1000`) | LEGACY | Retain for historical identity; retired and non-purchasable. |
| BPC-157 — 5 mg | INTENTIONALLY VIAL-ONLY | Keep public. |
| TB-500 — 10 mg | INTENTIONALLY VIAL-ONLY | Keep public. |
| Tirzepatide — 10 mg | INTENTIONALLY VIAL-ONLY | Keep public. |
| CJC-1295 No DAC — 5 mg | INTENTIONALLY VIAL-ONLY | Keep public. |
| Ipamorelin — 5 mg | INTENTIONALLY VIAL-ONLY | Keep public. |
| NAD+ — 1,000 mg | INTENTIONALLY VIAL-ONLY | Keep public. |
| Sermorelin — 5 mg | INTENTIONALLY VIAL-ONLY | Keep public. |
| Tesamorelin — 5 mg | INTENTIONALLY VIAL-ONLY | Keep public. |
| MOTS-C — 10 mg | INTENTIONALLY VIAL-ONLY | Keep public. |
| AOD-9604 — 5 mg | INTENTIONALLY VIAL-ONLY | Keep public. |
| Acetonitrile — 1 L | INTENTIONALLY VIAL-ONLY / HIDDEN | Keep internal and non-purchasable. |

## Inventory authority

For new Vial SKUs, the initial production quantity will use the primary JSON inventory count. The spreadsheet contains older counts and prices and is retained as provenance, not as the winning value. Existing Vial-only and already-matched SKUs retain their approved Vial pricing and production inventory.

## Required implementation result

- Add 18 sellable Vial configurations.
- Group configurations into customer-facing families without changing SKU-level order or inventory identity.
- Keep the 30 mL BAC SKU as retired and non-purchasable.
- Preserve all legitimate Vial-only records.
- Final assertions: `MISSING GOLDMINE SELLABLE FAMILIES = 0` and `MISSING GOLDMINE SELLABLE CONFIGURATIONS = 0`.
