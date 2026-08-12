# 06 — Payment Processor Due Diligence

Prepared: 2026-06-07  
Scope: public, source-cited due-diligence summary for research-use-only peptide ecommerce/inquiry strategy. This is not legal, banking, or underwriting advice.

## Executive summary

Peptide/research chemical businesses are commonly treated as **high-risk** by mainstream payment platforms and acquiring banks. The main issues are restricted product categories, regulatory ambiguity, human-use/medical-claim risk, chargeback/fraud exposure, and website compliance gaps. Multiple payment-industry sources explicitly state that mainstream processors may decline, freeze, or terminate peptide-related accounts.

**Recommendation:** keep the current site **inquiry-first** until underwriting is complete. Do not publicly promise credit-card checkout, instant ordering, processor approval, or specific payment methods until the client has written approval from the processor/acquirer/gateway for the exact business model and product set.

## Source-backed findings

| Finding | Source evidence | Strategy implication |
|---|---|---|
| Mainstream processors often treat peptide businesses as high-risk. | Vector Payments says peptide payment processing is difficult because many traditional processors classify peptide businesses as high risk and may decline/shut down research peptide or related accounts. Source: https://www.vectorpayments.com/peptide-payment-processing/ | Do not build copy around normal ecommerce checkout until processor path is real. |
| Stripe/PayPal/Square-style processors may terminate peptide accounts. | Verified Credit Card Processing states mainstream processors like Stripe, PayPal, and Square often shut down peptide-related accounts once detected. Source: https://verifiedcreditcardprocessing.com/research-peptides-guide/ | Avoid using instant aggregators as the assumed plan. |
| Website language can kill approval. | Verified Credit Card Processing lists approval killers: human-use language, wellness/performance promises, dosing instructions, testimonials implying personal use, missing policies, inconsistent research-only disclaimers, unclear sourcing/documentation. Source: https://verifiedcreditcardprocessing.com/research-peptides-guide/ | Keep documentation-first copy and remove risky product/benefit language before underwriting. |
| Some processors distinguish clinical/telehealth peptide businesses from RUO sellers. | Corepay states it supports compliant healthcare peptide businesses but “does not support research-use-only (RUO) peptide sellers,” and notes LegitScript requirements for some peptide platforms. Source: https://corepay.net/industries/best-peptide-merchant-accounts/ | Ask processors whether they support RUO ecommerce specifically, not just “peptides.” |
| Some high-risk processors market peptide merchant accounts, but claims vary. | AllayPay markets credit card/ACH/eCheck/high-risk peptide merchant solutions and lists underwriting document requirements. Source: https://allaypay.com/industries/peptides-merchant-services/ | Treat as leads for due diligence, not guaranteed approval. |
| Offshore/gift-card/high-risk alternatives exist but may add reputational/compliance risk. | Instabill discusses offshore processing and gift-card payment routes for peptide merchants. Source: https://instabill.com/ecommerce-industries/peptides-merchant-accounts/ | Avoid unusual workflows in public client preview unless client/legal approves. |
| Policies and compliance pages matter. | Vector Payments says processors may require refund/return, privacy, terms, shipping/fulfillment disclosures, contact info, clear product descriptions, transparent billing descriptors, fraud monitoring, age verification where applicable. Source: https://www.vectorpayments.com/peptide-payment-processing/ | Finish policy pages and document compliance posture before live checkout. |

## Why mainstream processors may reject this category

### 1. Restricted product category risk

Peptides and research chemicals can be flagged as restricted, gray-area, pharmaceutical-adjacent, or wellness/medical-adjacent. Even if the site uses research-use-only language, automated and manual underwriting may still view the category as high risk.

**Sources:**
- Vector Payments: mainstream platforms may restrict research compounds, alternative medicine products, regulated supplements, wellness/therapeutic compounds. https://www.vectorpayments.com/peptide-payment-processing/
- Verified Credit Card Processing: most processors will not touch the category, and compliant merchants can be shut down if site language appears consumer-facing. https://verifiedcreditcardprocessing.com/research-peptides-guide/

### 2. Human-use / medical-claim risk

Payment underwriters review whether products appear to be sold for human consumption, wellness, performance, treatment, diagnosis, dosing, injections, or body outcomes.

**Evidence:** Verified Credit Card Processing lists “no dosing instructions for people, no wellness claims, and no marketing implying human use” as core rules for research-only ecommerce merchants. Source: https://verifiedcreditcardprocessing.com/research-peptides-guide/

### 3. Regulatory ambiguity

Processors are risk-avoidant when product classification, end use, or jurisdiction varies. Corepay explicitly distinguishes LegitScript/clinical models from RUO sellers and says it cannot assist some peptide platforms without LegitScript due to Visa Integrity Risk Program constraints. Source: https://corepay.net/industries/best-peptide-merchant-accounts/

### 4. Chargebacks, fraud, and fulfillment disputes

High-risk processors evaluate chargebacks, refunds, fulfillment, billing descriptors, and customer-support visibility. Vector Payments lists chargebacks and missing refund/privacy/terms/shipping pages as risk triggers. Source: https://www.vectorpayments.com/peptide-payment-processing/

### 5. Website compliance gaps

Processors may reject sites missing:

- Terms of service
- Privacy policy
- Refund/return policy
- Shipping/fulfillment policy
- Clear contact/support details
- Research-use-only disclaimers
- Product-specific disclaimers
- Transparent fulfillment/sourcing/documentation statements

**Source:** https://www.vectorpayments.com/peptide-payment-processing/

## Questions the client must ask processors/acquiring banks

Use these exact underwriting questions before embedding any payment link or checkout promise:

1. Do you support **research-use-only peptide/reference material ecommerce**, or only licensed clinical/telehealth peptide models?
2. Are any products or categories prohibited outright, including GLP-1-related compounds, bacteriostatic/reconstitution products, SARMs, nootropics, or research chemicals?
3. Do you require LegitScript, pharmacy licensing, telehealth documentation, medical director details, or clinical-provider status?
4. Do you allow an **inquiry-first catalog** with invoice/payment after manual review?
5. Do you allow direct card checkout on product pages?
6. What website language must be present on product pages, footer, checkout, policies, and terms?
7. What language is prohibited, including human-use, wellness, dosing, protocol, injection, clinical, therapeutic, weight-loss, anti-aging, bodybuilding, or performance claims?
8. Are public prices allowed before underwriting approval?
9. Are testimonials/reviews allowed? If yes, what restrictions apply?
10. Are COAs, SDS/MSDS, sourcing invoices, supplier agreements, or lab documents required before approval?
11. What monthly volume cap, rolling reserve, payout delay, chargeback threshold, and MCC will apply?
12. What gateway is supported: NMI, Authorize.net, FluidPay, proprietary gateway, ACH/eCheck, wire, invoice?
13. Can the processor provide written approval for this exact URL, product set, policies, and transaction flow?
14. What happens if product language changes after approval?
15. What backup payment methods are allowed if card processing is paused?

## Documents likely needed

AllayPay’s public peptide merchant page lists the following application-type documents, which are a useful due-diligence baseline. Source: https://allaypay.com/industries/peptides-merchant-services/

| Document | Why it matters |
|---|---|
| Complete merchant application | Underwriting intake. |
| Government-issued ID | KYC verification. |
| Voided check or bank letter | Bank account verification. |
| Last three months of processing/personal/business statements | Risk and volume review. |
| EIN letter / SS-4 | Business identity verification. |
| Articles of incorporation | Entity proof. |
| Operating agreement | Ownership structure. |
| Fulfillment agreement with supplier or inventory photos/paid invoices | Sourcing/fulfillment proof. |
| Last two years internal financials or tax returns | Financial stability. |
| Website policy pages | Compliance and consumer-dispute control. |
| COA/SDS/MSDS and product documentation | Product quality/sourcing support. |
| Chargeback/refund/fulfillment SOPs | Risk controls. |

## Why inquiry-first is safer before underwriting approval

Inquiry-first does **not** make the business automatically compliant or approved. It does reduce avoidable risk before underwriting because:

1. No live card capture is promised before approval.
2. Product availability can be reviewed manually.
3. Documentation can be provided before purchase conversation.
4. Risky products can be excluded or hidden before underwriting.
5. Research-use acknowledgements can be collected before follow-up.
6. Payment workflows can be selected after processor guidance.
7. Public copy can avoid checkout claims and price-driven pressure.

This aligns with payment-source warnings about website language, research-only positioning, missing policies, and processor restrictions. Sources: https://verifiedcreditcardprocessing.com/research-peptides-guide/ ; https://www.vectorpayments.com/peptide-payment-processing/

## Backup payment workflows to discuss with counsel/processor

| Workflow | Pros | Cons / cautions |
|---|---|---|
| Manual invoice after qualified inquiry | Best fit now; processor/counsel can review wording first. | Slower conversion; requires admin follow-up. |
| ACH/eCheck after approval | Lower card-network exposure; some high-risk providers offer it. | Still needs underwriting and compliance approval. |
| Wire transfer for wholesale/lab accounts | Useful for large B2B orders. | Manual, slower, not consumer-friendly. |
| Card payment link after approval | Easier conversion without full checkout. | Must not be embedded/promised until approved. |
| Full ecommerce checkout after approval | Highest conversion. | Highest compliance/payment risk; needs strict content controls. |
| Offshore/gift-card/crypto routes | Can exist in high-risk market. | Reputational/legal/customer trust risks; avoid unless client/legal specifically approves. Instabill discusses offshore/gift-card routes: https://instabill.com/ecommerce-industries/peptides-merchant-accounts/ |

## What not to promise publicly

Do **not** say any of these unless written source-backed approval exists:

- “Credit cards accepted”
- “Stripe/PayPal/Shopify Payments checkout”
- “Processor approved”
- “Guaranteed approval”
- “FDA compliant” or “legal in all states”
- “Safe payment processing for peptides”
- “No risk of account holds/freezes”
- “Direct checkout launching tomorrow”
- “We ship all products everywhere”
- Any claim implying human use, dosing, treatment, health benefit, clinical use, veterinary use, or therapeutic effect

## Immediate website readiness checklist for underwriting

- Research-use policy visible and linked globally.
- Product pages contain product-specific RUO disclaimers.
- No dosing/protocol/injection/administration language.
- No medical, wellness, anti-aging, bodybuilding, weight-loss, recovery, or testimonial claims.
- Policies: terms, privacy, refund/return, shipping/fulfillment, contact/support.
- Product documentation statuses visible.
- COA/SDS/MSDS workflow described truthfully.
- Inquiry-first status clear.
- No payment link unless intentionally approved.
- Admin process for lead follow-up documented.
- Processor question list completed with written responses.

## Bottom-line recommendation

Keep the preview as a **documentation-first inquiry site**. Do not embed live payment links or public checkout promises until the client has written underwriting approval for the exact RUO product catalog, site copy, policies, and payment workflow.
