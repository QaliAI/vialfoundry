# 03 — Product Page Template

Prepared: 2026-06-07  
Purpose: ideal product detail page architecture for a documentation-first, research-use-only peptide catalog and inquiry flow.

## Evidence base

- Competitors that look most trustworthy make testing and documentation visible: PeptideResearches claims HPLC/MS and batch COA documentation; Lone Star emphasizes batch-specific COAs and COA library; Ion Peptide maintains a lab-results repository; BioLongevity teaches how to evaluate COAs. Sources: https://www.peptideresearches.com/en/shop ; https://lonestarpeptideco.com/ ; https://ionpeptide.com/lab-results/ ; https://biolongevitylabs.com/quality/how-to-read-peptide-coa-quality/
- Commodity ecommerce competitors show price/add-to-cart, but our payment/compliance strategy favors request flow before underwriting. Sources: https://www.corepeptides.com/ ; https://www.blueskypeptide.com/ ; https://apexlaboratory.org/product-category/peptides/

## Product page principles

1. The product page is a **technical record**, not a sales pitch.
2. Documentation is the conversion engine.
3. Inquiry replaces checkout until payment processing is approved.
4. Every visible claim must map to a real field/document.
5. No medical, veterinary, human-use, dosing, protocol, administration, injection, or health-benefit language.

## Ideal page structure

### 1. Header / title block

**Fields**

- Product title
- SKU / internal code
- Category
- Status badges: documentation, COA, availability, batch/lot, storage
- Short research-use notice

**Example layout**

```text
BPC-157 — Research Reference
SKU: ARP-BPC157-005
Category: Research Peptides
Badges: COA on request · HPLC/LC-MS reference · Inquiry required · Batch details pending
```

**Copy pattern**

```text
Technical product record for qualified laboratory research review. Documentation and availability are reviewed through inquiry.
```

**Do not say**

- Buy now
- Best for [body/health outcome]
- Protocol, stack, dose, reconstitution, administration
- Any disease, recovery, performance, anti-aging, weight, or wellness outcome

### 2. Prominent research-use notice

**Purpose**: immediately constrain intended use and align with processor/legal expectations.

**Recommended block**

```text
Research-use-only notice
This material is listed for qualified laboratory research review only. It is not for human consumption, animal use, diagnostic use, therapeutic use, veterinary use, or household use. The company does not provide protocol, administration, or use guidance.
```

**Implementation notes**

- Place high on page and again near CTA.
- Keep plain, not legalistic-only.
- Link to `/research-use-policy`.

### 3. Product summary panel

| Field | Example | Rule |
|---|---|---|
| Product code | `ARP-BPC157-005` | Internal catalog code, not fake batch. |
| Compound / record name | `BPC-157 Research Reference` | Only if final catalog is approved. |
| Category | `Research Peptides` | Neutral. |
| Form | `Lyophilized research material` | Material form only. |
| Purity reference | `>=98% reference target` | Only if true / client-approved. |
| Documentation status | `COA available on request` | Must be truthful. |
| Availability status | `Reviewed after inquiry` | Do not imply stock unless real. |
| Storage status | `Controlled cold storage` | No protocol detail. |

### 4. Documentation status section

**Purpose**: make document readiness visible.

**Recommended subsections**

- Certificate of Analysis status
- HPLC purity reference status
- LC-MS / MS identity reference status
- Third-party lab status
- Documentation packet availability

**Status table**

| Documentation item | Status | Notes |
|---|---|---|
| COA | On request | Reviewed after inquiry. |
| HPLC purity reference | Available / Pending | Link when real. |
| LC-MS identity reference | Available / Pending | Link when real. |
| Batch/lot sheet | Pending | Update with lot ID when available. |
| SDS/MSDS | Available / Pending | Only if real. |

**CTA**

```text
Request documentation packet
```

### 5. COA / HPLC / MS section

**Purpose**: mirror the best competitor trust patterns without fabricating data.

**Evidence to emulate**

- PeptideResearches states products are HPLC/MS tested and may include lot-specific COAs. Source: https://www.peptideresearches.com/en/research
- Ion Peptide publishes a lab-results repository with batch-style identifiers and UPLC/MS statements. Source: https://ionpeptide.com/lab-results/
- BioLongevity’s COA guide explains why lot numbers, method details, chromatograms, and mass confirmation matter. Source: https://biolongevitylabs.com/quality/how-to-read-peptide-coa-quality/

**Recommended content block**

```text
Analytical documentation
This record is structured around purity, identity, and lot traceability documentation. When available, the documentation packet may include HPLC purity reference, LC-MS/MS identity reference, and lot-specific quality records.
```

**UI**

- Show “Available,” “On request,” “Pending,” or “Not available.”
- If a public COA exists, show a download/view button.
- If request-only, show a request button and explain review.
- Never show fake chromatograms or fake lab names.

### 6. Batch / lot documentation section

**Purpose**: make traceability a first-class feature.

**Fields**

| Field | Example |
|---|---|
| Current batch ID | `Pending client batch data` or real batch ID |
| Lot-linked COA | On request / Public / Pending |
| Test date | Pending / date if real |
| Lab name | Pending / named lab if real |
| Retest/review date | Pending / date if real |

**Pattern**

```text
Batch documentation is reviewed before availability confirmation. If a lot-linked COA is available, it will be included in the documentation response.
```

### 7. Form / storage section

**Purpose**: provide material-documentation info without giving protocol guidance.

**Recommended fields**

- Material form: lyophilized research material / powder / reference material
- Storage category: controlled cold storage / sealed dry / storage data pending
- Packaging status: sealed material / pending client data
- Shipping status: reviewed after inquiry

**Do not include**

- Preparation instructions
- Reconstitution details
- Administration-related language
- Protocol guidance

### 8. Availability / request CTA

**Primary CTA**

```text
Request documentation and availability review
```

**Secondary CTA**

```text
Ask a documentation question
```

**CTA supporting copy**

```text
No checkout is available on this preview. Requests are reviewed manually so documentation, availability, and research-use acknowledgements can be confirmed before follow-up.
```

### 9. Inquiry form handoff

When user clicks CTA:

- Preselect product in inquiry form.
- Carry product code/title in query string or hidden fields.
- Require acknowledgements.
- Do not ask for intended human/animal use; ask for organization/lab context and documentation needs.

**Recommended form fields**

- Name
- Email
- Organization / company / lab
- Product interest
- Estimated quantity
- Shipping region
- Documentation requested: COA, HPLC, MS, batch/lot, SDS/MSDS, availability
- Message
- Research-use acknowledgements

### 10. Related documentation FAQ

Keep FAQs product-documentation oriented.

| FAQ | Safe answer angle |
|---|---|
| What does COA on request mean? | Documentation is reviewed/provided after qualified inquiry. |
| What is HPLC used for? | Purity/reference method context only. |
| What is MS/LC-MS used for? | Identity/molecular confirmation context only. |
| Are batch records available? | Status-dependent; ask through inquiry. |
| Why no checkout? | Inquiry-first review supports documentation, availability, and processor/legal readiness. |
| Can you provide use guidance? | No. The team does not provide protocol, administration, consumption, diagnostic, therapeutic, or veterinary guidance. |

### 11. Related product/documentation links

- Category page
- Quality & Testing page
- Research Use Policy
- How to Read a COA
- HPLC vs LC-MS explained
- Documentation checklist

## Recommended page order

1. Product title / SKU / badges
2. Research-use notice
3. Primary CTA: request documentation
4. Technical summary panel
5. Documentation status table
6. COA/HPLC/MS section
7. Batch/lot documentation
8. Form/storage/shipping status
9. Related documentation FAQ
10. Inquiry handoff CTA
11. Related technical records
12. Repeated disclaimer footer

## Field-level content rules

| Field | Allowed | Not allowed |
|---|---|---|
| Description | Technical record, documentation, purity, identity, availability | Benefits, outcomes, use cases in bodies/animals |
| Testing | HPLC, LC-MS, COA, lot, method, lab | “Clinically proven,” “safe,” “effective” |
| Storage | sealed, controlled cold, protect from moisture if client-approved | preparation, reconstitution, administration |
| CTA | request documentation, ask availability | buy now before processor approval |
| FAQs | documentation process | protocol/use/dose/injection guidance |

## Example product page skeleton

```md
# [Product Name] — Research Reference
SKU: [SKU]
Category: [Category]

[Badges: COA on request] [HPLC reference] [Inquiry required] [Batch pending]

## Research-use-only notice
[Short disclaimer + policy link]

## Technical summary
- Form: [form]
- Purity reference: [status]
- Documentation status: [status]
- Availability: [status]
- Storage category: [status]

## Analytical documentation
| Item | Status | Notes |
| COA | ... | ... |
| HPLC | ... | ... |
| LC-MS/MS | ... | ... |

## Batch / lot documentation
[Batch fields]

## Request documentation
[CTA + inquiry handoff]

## Related documentation FAQ
[FAQ]
```

## Bottom-line recommendation

Before client preview, make product pages feel less placeholder by adding **documentation status**, **COA status**, **batch status**, and **request/documentation CTAs**. Do not add prices, cart, or live payment language yet.
