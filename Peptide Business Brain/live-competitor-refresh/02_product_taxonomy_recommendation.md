# 02 — Product Taxonomy Recommendation

Prepared: 2026-06-07  
Goal: replace repetitive `RPP-001…RPP-010` placeholder feel with a credible documentation-first taxonomy that avoids human-use, medical, protocol, dosing, and outcome claims.

## Evidence base

Competitors generally organize products in one of three ways:

1. **Compound/category ecommerce:** broad peptide pages with prices/cart/sort. Evidence: Core Peptides catalog with 103 results and sorting; Apex Laboratory 64 peptide results with prices/Add to Cart. Sources: https://www.corepeptides.com/ ; https://apexlaboratory.org/product-category/peptides/
2. **Research category trees:** categories by research area or compound class. Evidence: Limitless Biotech “Shop by Research Category”; Lone Star product categories. Sources: https://limitlesslifenootropics.com/ ; https://lonestarpeptideco.com/
3. **Documentation-led access:** lot-specific COA, HPLC/MS, batch status, account/inquiry/qualified researcher gating. Evidence: PeptideResearches, BioLongevity Labs, Ion Peptide, Lone Star. Sources: https://www.peptideresearches.com/en/shop ; https://biolongevitylabs.com/ ; https://ionpeptide.com/lab-results/ ; https://lonestarpeptideco.com/

Recommendation: use a hybrid taxonomy that looks like a technical catalog, not a supplement/body-outcome catalog.

## Recommended public product categories

| Category | Use | Why safe / credible | Avoid saying |
|---|---|---|---|
| **Reference Standards** | Highly documented single-compound records, identity/purity focused. | Sounds analytical/procurement-oriented and avoids outcome framing. | Do not imply drug, clinical, or human use. |
| **Research Peptides** | Main catalog category for peptide materials. | Clear, neutral, familiar to buyers. | Do not organize by health/body outcomes. |
| **Specialty References** | Less common or higher-documentation materials; useful for non-core/limited items. | Gives room for less commodity SKUs without hype. | Do not use “advanced therapy,” “longevity,” or “performance.” |
| **Analytical Reference Materials** | Items positioned around QA/testing/reference use. | Strongest trust lane; pairs naturally with COA/HPLC/MS. | Do not overclaim certification unless real. |
| **Custom / Bulk Inquiry** | Future B2B category for large quotes or custom synthesis. | Inquiry-first and procurement-native. | Do not promise fulfillment, synthesis capability, or lead times unless real. |
| **Documentation Library** | Not a product category; linked asset category for COAs/batch docs. | Makes documentation the differentiator. | Do not fabricate COAs or test results. |

## Categories to avoid or only use internally

| Avoid / internal only | Reason |
|---|---|
| Weight / metabolic outcomes | High regulatory and processor risk. |
| Muscle / recovery / injury categories | Typical enforcement and claim risk around peptide marketing. |
| Anti-aging / longevity category labels | Outcome framing; too close to consumer benefit marketing. |
| Clinical / therapeutic categories | Implies regulated health use. |
| Injection supplies / bacteriostatic water category | Existing risk brief treats this as a hard exclusion because FDA has cited cart context. |
| GLP-1 category | Highest enforcement/payment risk; if ever considered, counsel and processor review first. |

## Recommended product status fields

These fields can replace placeholder heaviness while staying truthful.

### Documentation status

| Value | Meaning | UI label example |
|---|---|---|
| `documentation_available` | Documentation packet exists and can be reviewed. | Documentation available |
| `coa_available_on_request` | COA exists or is expected but not public. | COA available on request |
| `batch_docs_pending` | Batch documentation not ready. | Batch documentation pending |
| `client_review_required` | Data placeholder pending client approval. | Record pending client approval |
| `not_public` | Hidden/internal only. | Do not show |

### Availability status

| Value | Meaning | UI label example |
|---|---|---|
| `inquiry_required` | No direct checkout; request required. | Inquiry required |
| `reviewed_availability` | Availability confirmed manually. | Reviewed after inquiry |
| `limited_review` | Limited availability or prioritized inquiries. | Limited inquiry review |
| `coming_soon` | Public teaser only. | Coming soon |
| `inactive` | Not visible / not available. | Do not show |

### COA status

| Value | Meaning | UI label example |
|---|---|---|
| `public_coa` | Public downloadable/visible COA exists. | Public COA |
| `coa_on_request` | Available after request or qualified review. | COA on request |
| `sample_coa_only` | Sample/format only, not batch-specific. | Sample COA only — not batch-specific |
| `pending_batch_coa` | Awaiting current lot. | Current batch COA pending |
| `not_available` | No COA. | COA unavailable — do not list as ready |

### Testing method status

| Value | Use |
|---|---|
| `hplc_reference` | HPLC purity reference exists. |
| `lcms_reference` | LC-MS/MS identity reference exists. |
| `hplc_lcms_reference` | Both are available. |
| `third_party_verified` | Only if independent lab documentation exists. |
| `not_yet_verified` | Use for placeholders / pending docs. |

### Storage status

| Value | UI label |
|---|---|
| `controlled_cold_storage` | Controlled cold storage |
| `sealed_dry_storage` | Sealed dry storage |
| `ambient_shipping_review` | Ambient shipping reviewed case-by-case |
| `storage_data_pending` | Storage data pending |

### Batch/lot status

| Value | UI label |
|---|---|
| `lot_linked` | Lot-linked documentation |
| `batch_id_available` | Batch ID available |
| `batch_pending` | Batch details pending |
| `not_batch_specific` | Documentation is not batch-specific |
| `sample_record` | Sample record only |

## Recommended schema for each product record

| Field | Example | Notes |
|---|---|---|
| Display name | `BPC-157 Research Reference` | Use compound name only if client approves final catalog. |
| Internal code | `ARP-BPC157-005` | Looks credible without pretending to be a lot number. |
| Category | `Research Peptides` | Public category. |
| Documentation status | `COA available on request` | One of the status values above. |
| Test methods | `HPLC purity reference; LC-MS identity reference` | Only if true. If pending, say pending. |
| Form | `Lyophilized research material` | Neutral material form. |
| Storage status | `Controlled cold storage` | Keep as documentation/status, not protocol. |
| Availability | `Reviewed after inquiry` | Keeps inquiry-first flow. |
| Batch/lot status | `Batch details pending` | More credible than blank. |
| Disclaimer | `For qualified laboratory research use only. Not for human or animal use.` | Keep short and repeated. |

## Replacing RPP-001…RPP-010 naming

### Problem

The current `RPP-001 Reference Peptide` style is safe but looks synthetic and unfinished. It proves the layout, but it does not build buyer trust.

### Option A — credible placeholder naming before client product list

Use category-coded placeholders that openly state their status:

| Current | Better placeholder |
|---|---|
| RPP-001 Reference Peptide | Research Peptide Reference Record A |
| RPP-002 Reference Peptide | Research Peptide Reference Record B |
| RPP-003 Reference Peptide | Specialty Reference Record A |
| RPP-004 Reference Peptide | Analytical Reference Material A |
| RPP-005 Reference Peptide | Research Peptide Documentation Record A |
| RPP-006 Reference Peptide | Research Peptide Documentation Record B |
| RPP-007 Reference Peptide | Specialty Reference Documentation Record B |
| RPP-008 Reference Peptide | Analytical Reference Material B |
| RPP-009 Reference Peptide | Technical Reference Material A |
| RPP-010 Reference Peptide | Technical Reference Material B |

Pros: safe and honest.  
Cons: still generic.

### Option B — client-preview credible sample records

Use clearly marked sample product records with realistic fields but no claim that they are for sale:

| Display name | Category | Code |
|---|---|---|
| BPC-157 Research Reference — Sample Record | Research Peptides | ARP-SAMPLE-BPC157 |
| TB-500 Research Reference — Sample Record | Research Peptides | ARP-SAMPLE-TB500 |
| GHK-Cu Copper Peptide Reference — Sample Record | Specialty References | ARP-SAMPLE-GHKCU |
| CJC-1295 Research Reference — Sample Record | Research Peptides | ARP-SAMPLE-CJC1295 |
| Ipamorelin Research Reference — Sample Record | Research Peptides | ARP-SAMPLE-IPAM |
| KPV Research Reference — Sample Record | Specialty References | ARP-SAMPLE-KPV |
| Semax Research Reference — Sample Record | Analytical Reference Materials | ARP-SAMPLE-SEMAX |
| Selank Research Reference — Sample Record | Analytical Reference Materials | ARP-SAMPLE-SELANK |
| MOTS-c Research Reference — Sample Record | Specialty References | ARP-SAMPLE-MOTSC |
| Custom Peptide Documentation Inquiry — Sample Record | Custom / Bulk Inquiry | ARP-SAMPLE-CUSTOM |

Pros: much more credible in screenshots.  
Cons: must be labeled clearly as sample/preview until client approves actual products and counsel reviews categories.

### Option C — final naming when client confirms catalog

Final product names should follow this formula:

```text
[Compound Name] — Research Reference, [Size/Form], [Documentation Status]
```

Examples:

- `BPC-157 — Research Reference, 5 mg, COA on Request`
- `GHK-Cu — Copper Peptide Research Reference, 50 mg, Batch Docs Pending`
- `CJC-1295 No DAC — Research Reference, 5 mg, COA on Request`

Do **not** include outcome phrases, protocol terms, administration terms, or consumer benefit language.

## Recommended filters/sort options

| Filter | Values |
|---|---|
| Category | Reference Standards, Research Peptides, Specialty References, Analytical Reference Materials, Custom/Bulk Inquiry |
| Documentation status | Available, COA on request, Pending, Sample record |
| COA status | Public, On request, Pending, Not available |
| Testing methods | HPLC, LC-MS, HPLC + LC-MS, Third-party verified, Pending |
| Availability | Inquiry required, Reviewed after inquiry, Coming soon |
| Storage status | Controlled cold, Sealed dry, Storage pending |
| Sort | Newest, A-Z, Documentation available first, COA available first |

## Product taxonomy implementation priority

1. Add `documentationStatus`, `coaStatus`, `testingMethods`, `batchLotStatus`, `storageStatus`, `availabilityStatus` as first-class fields.
2. Replace numbered generic names with either Option A or Option B for client preview.
3. Add product badges from those fields to cards.
4. Add filtering by documentation/COA status.
5. Add a future COA/batch lookup architecture, even if current state is request-only.

## Bottom-line recommendation

For tomorrow’s client-facing credibility, the best immediate path is **Option B**, with every record labeled as a **sample record**. It is more persuasive than `RPP-001` while staying honest that final products require client approval.
