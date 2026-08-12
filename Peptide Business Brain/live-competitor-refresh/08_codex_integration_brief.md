# 08 — Codex Integration Brief

Prepared: 2026-06-07  
Audience: Codex / implementation agent.  
Instruction: Do not copy competitor text. Do not add medical, dosing, protocol, injection, human-use, animal-use, or health-benefit claims. Do not enable payments until client/processor approval.

## Current strategic diagnosis

The current preview is safe but too placeholder-heavy. Competitors win trust with visible product depth, prices/cart, COA libraries, HPLC/MS claims, batch/lot status, shipping signals, and lead capture. Because this project should stay research-use-only and inquiry-first, the implementation should **not** imitate open checkout yet. Instead, make the site feel best-in-class through documentation architecture and transparent status fields.

## Ranked plan

### Priority 0 — Do not touch yet

Do **not** make these changes until the client approves scope/legal/payment direction:

1. Do not add Stripe/PayPal/Shopify Payments/credit-card checkout.
2. Do not add payment links unless Rubin/client explicitly provides intended link and approval.
3. Do not add prices unless pricing strategy is approved.
4. Do not add medical outcomes, use cases, dosing, injection, protocol, administration, or “how to use” content.
5. Do not create fake COAs, fake lab names, fake batch IDs, fake test dates, or fake certifications.
6. Do not add competitor comparisons by name on public pages without legal review.
7. Do not add testimonials/reviews implying personal use.
8. Do not add bacteriostatic water/reconstitution supply catalog items.

### Priority 1 — Fix before client preview if time allows

| Rank | Task | Why | Files likely involved |
|---:|---|---|---|
| 1 | Replace `RPP-001…RPP-010` visible naming with credible sample/final naming. | Placeholder naming is the biggest credibility gap. | `lib/data/products.ts` or product data source. |
| 2 | Add product-card badges for documentation status, COA status, testing methods, and availability. | Competitor trust pattern: COA/HPLC/MS/batch visibility. | Product card component(s), catalog page. |
| 3 | Add disclaimer block to every product/detail page. | Compliance/payment-readiness. | Product detail template/component. |
| 4 | Add inquiry CTA labels: `Request documentation` and `Request availability`. | Converts inquiry-first from limitation to strategy. | Product cards/details, inquiry handoff. |
| 5 | Ensure inquiry form can prefill product name/code and requested document type. | Improves conversion and admin usefulness. | `components/forms/InquiryForm.tsx`, routes/query handling. |
| 6 | Add “sample records pending client approval” note if using sample products. | Avoids misleading client/public. | Catalog/product pages. |
| 7 | Expand `/quality` with trust blocks and links to future guides. | Makes site less thin. | `app/quality/page.tsx`. |
| 8 | Add footer links to Research Use Policy, Quality, Inquiry, and future documentation checklist. | Crawl/compliance UX. | Layout/footer component. |

### Priority 2 — Add immediately after payment

| Rank | Task | Why | Notes |
|---:|---|---|---|
| 1 | Create the first two trust pages: `How to Read a COA`, `HPLC vs LC-MS Explained`. | Highest trust/SEO/AEO impact. | Use research files 04 and 07. |
| 2 | Create downloadable lead magnets: Documentation Checklist and COA Review Checklist. | Best low-risk email capture. | PDF or HTML-to-PDF later. |
| 3 | Add a documentation request workflow. | Lets buyers request COA/HPLC/MS/batch docs per product. | Extend inquiry fields. |
| 4 | Add admin lead-source fields. | Track which page/CTA produced inquiries. | Admin/data model/API. |
| 5 | Add category taxonomy pages. | Improves SEO and catalog navigation. | `/catalog/research-peptides`, etc. |
| 6 | Add schema baseline. | SEO/GEO readiness. | `Organization`, `BreadcrumbList`, `Article`, `FAQPage`. |
| 7 | Add policy pages needed for underwriting: terms, privacy, shipping/fulfillment, refund/return. | Processor due diligence. | Must be client/legal reviewed. |

### Priority 3 — Add after client product/data approval

| Rank | Task | Why |
|---:|---|---|
| 1 | Replace sample products with approved real product records. | Production credibility. |
| 2 | Add real SKU/product codes. | Procurement professionalism. |
| 3 | Add real COA statuses and document URLs or request states. | No fake documentation. |
| 4 | Add real batch/lot statuses. | Differentiator vs commodity stores. |
| 5 | Add availability statuses. | Avoids overpromising stock. |
| 6 | Add storage status based on client documentation. | Technical completeness. |
| 7 | Add approved prices only if processor/client approve. | Pricing can affect underwriting and conversion. |

## Product fields to add

Add or map these fields in the product data model:

```ts
type ProductDocumentationStatus =
  | 'documentation_available'
  | 'coa_available_on_request'
  | 'batch_docs_pending'
  | 'client_review_required'
  | 'not_public'

type ProductAvailabilityStatus =
  | 'inquiry_required'
  | 'reviewed_availability'
  | 'limited_review'
  | 'coming_soon'
  | 'inactive'

type ProductCoaStatus =
  | 'public_coa'
  | 'coa_on_request'
  | 'sample_coa_only'
  | 'pending_batch_coa'
  | 'not_available'

type ProductTestingMethod =
  | 'hplc_reference'
  | 'lcms_reference'
  | 'hplc_lcms_reference'
  | 'third_party_verified'
  | 'not_yet_verified'

type ProductStorageStatus =
  | 'controlled_cold_storage'
  | 'sealed_dry_storage'
  | 'ambient_shipping_review'
  | 'storage_data_pending'

type ProductBatchLotStatus =
  | 'lot_linked'
  | 'batch_id_available'
  | 'batch_pending'
  | 'not_batch_specific'
  | 'sample_record'
```

Recommended additional fields:

- `displayName`
- `internalCode`
- `category`
- `subcategory`
- `form`
- `purityReferenceStatus`
- `documentationStatus`
- `coaStatus`
- `testingMethods`
- `storageStatus`
- `batchLotStatus`
- `availabilityStatus`
- `disclaimer`
- `isSampleRecord`
- `clientApprovalStatus`
- `documentRequestTypes`

## Pages to expand first

### 1. Catalog

Add:

- Documentation-first headline
- Category tabs/cards
- Filters: category, COA status, documentation status, testing methods, availability
- Product badges
- Research-use notice
- Request catalog access CTA

### 2. Product detail page

Use the structure in `03_product_page_template.md`:

1. Title/SKU/badges
2. Research-use notice
3. Technical summary
4. Documentation status table
5. COA/HPLC/MS section
6. Batch/lot section
7. Form/storage/shipping status
8. FAQ
9. Inquiry handoff

### 3. Quality page

Add modules:

- COA documentation
- HPLC vs LC-MS
- Batch traceability
- Storage documentation
- Documentation checklist CTA

### 4. Inquiry page

Add:

- Product prefill
- Documentation request checkboxes
- Research-use acknowledgements
- Better confirmation copy
- Source tracking hidden fields if feasible

### 5. Admin page

If admin remains demo-only:

- Clearly label demo status.
- Show inquiry fields relevant to documentation requests.
- Do not expose secrets.
- Do not imply production auth exists.

## UI sections to change

| Current likely issue | Change |
|---|---|
| Placeholder-heavy product cards | Add documentation badges and sample/final status. |
| Generic product names | Use credible sample/final naming strategy. |
| Thin product detail | Add technical record layout. |
| CTA says generic inquiry | Make CTA document-specific. |
| Quality page is broad | Add trust cards linking to COA/HPLC/batch guides. |
| Lack of lead magnet | Add Documentation Checklist CTA. |
| Payment unclear | State inquiry-first; no checkout in preview. |

## Content to create first

1. How to Read a COA
2. HPLC vs LC-MS Explained
3. Documentation Checklist for Research Buyers
4. How Batch Documentation Works
5. Research-Use-Only Purchasing Guide
6. Why Inquiry-First May Be Safer Than Open Checkout
7. How to Evaluate a Research Peptide Supplier
8. Storage and Handling Documentation Overview

## Compliance implementation guardrails

Before committing any copy, scan for:

- dosage / dose
- inject / injection
- human use
- patient
- treatment / therapeutic / cure
- weight loss / fat loss
- bodybuilding
- anti-aging
- testosterone
- prescribe
- clinical use
- FDA approved

If terms appear in a compliance/legal warning context, confirm the wording is not promotional. If terms appear as product claims or guidance, remove or rewrite.

## Source-inspired patterns to emulate without copying

| Pattern | Evidence | Our implementation |
|---|---|---|
| Batch-linked COA emphasis | Lone Star, Ion Peptide, PeptideResearches. Sources: https://lonestarpeptideco.com/ ; https://ionpeptide.com/lab-results/ ; https://www.peptideresearches.com/en/shop | Batch/lot status badges and request flow. |
| COA education content | A2Z, BioLongevity. Sources: https://a2zpeptides.com/1000394/how-to-read-peptide-coa-purity-identity-quality/ ; https://biolongevitylabs.com/quality/how-to-read-peptide-coa-quality/ | Original “How to Read a COA” guide. |
| Inquiry/account gating | BioLongevity account requirement, PeptideResearches wholesale/contact, Lone Star invoice/list flow. Sources: https://biolongevitylabs.com/ ; https://www.peptideresearches.com/en/shop ; https://lonestarpeptideco.com/ | Inquiry-first catalog/documentation request. |
| Documentation library | SwissChems/Ion public test result pages. Sources: https://swisschems.is/independent-test-results/ ; https://ionpeptide.com/lab-results/ | Future COA/documentation library with statuses. |

## Acceptance criteria for Codex work

- No production app breakage.
- `npm run lint` passes.
- `npx tsc --noEmit` passes.
- `npm run build` passes.
- Product cards show documentation/COA/availability status.
- Product detail pages do not contain risky claim language.
- Inquiry form accepts product/documentation context.
- Research-use disclaimer appears on product pages.
- No payment link added unless explicitly provided and intended.
- No fake COA/test/batch information.

## Final implementation recommendation

The highest-return pre-client-preview improvement is **credible product data architecture**, not new visual design. Add documentation fields, safer naming, badges, and inquiry handoff first. Then build trust content after payment.
