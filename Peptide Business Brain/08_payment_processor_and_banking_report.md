# 08 — Payment Processor & Banking Report

*This is the single most important operational file. Labels: [FACT]/[OBSERVED]/[INFERENCE]. Fees, reserves, and approval terms are deal-specific and change; treat all numbers as indicative ranges to confirm directly. Nothing here is a guarantee of approval. We did not access any private/backend processor data — all signals are public.*

---

## Why mainstream processors don't work

- **[FACT]:** Visa/Mastercard classify peptides/research chemicals/nutraceuticals as high-risk. **Mastercard's BRAM** (Business Risk Assessment & Mitigation) program specifically scrutinizes the category.
- **[OBSERVED/FACT]:** **Stripe, PayPal, Square, Shopify Payments, WooPayments** routinely decline or terminate peptide merchants (TOS prohibitions on RUO/unapproved-drug-adjacent goods). Using them risks frozen funds and account closure.
- **[INFERENCE]:** Do **not** attempt to route peptide sales through mainstream processors — it endangers all funds and the merchant relationship. The MVP correctly avoids live checkout entirely until a proper high-risk account exists.

## Gateway vs merchant account (key distinction) — [FACT]

- **Merchant account:** the bank/acquirer relationship that actually settles card funds and bears risk. This is what's hard to get for peptides.
- **Payment gateway:** the technical layer that transmits transactions (e.g., NMI, Authorize.net, FluidPay). A gateway is useless without an underlying high-risk **merchant account**.
- **[INFERENCE]:** You need both: an approved high-risk merchant account **plus** a compatible gateway. Many "processors" below are brokers who place you with an acquiring bank.

---

## Processor / provider profiles

> Columns covered per provider: peptide mention? · ecommerce? · cards? · ACH/eCheck? · gateways · setup · docs · fees/reserves (if public) · chargeback tools · credibility · red flags · best use · questions to ask. "Not public" = not verifiable from public sources.

### AllayPay — *strongest explicit peptide signal*
- **Peptides:** **Yes, explicit** dedicated peptide/RUO merchant page. **Ecommerce:** Yes (WooCommerce + most platforms via API). **Cards:** Yes (domestic). **ACH/eCheck:** Yes — added ACH for merchants on MATCH/TMF (Apr 2026).
- **[OBSERVED] claims:** "fully domestic" accounts; ~96%+ research-peptide approval; approvals ~3–5 business days (cards), 2–3 (ACH); states **LegitScript not required** for their domestic RUO structure; covers amino acids, GLP-1s, semaglutide/retatrutide for *qualified* merchants.
- **Fees/reserves:** Not public (request). **Credibility:** High explicit category focus. **Red flags [INFERENCE]:** verify the "compliant RUO structure" claim with your own counsel — a processor's comfort is not a legal opinion.
- **Best use:** Likely first call for domestic card + ACH. **Ask:** reserve %/duration, rolling vs upfront, monthly minimums, termination/MATCH protections, which acquiring bank, gateway compatibility, what copy they require you to remove.
- Source: allaypay.com/industries/peptides-merchant-services.

### Corepay — *named peptide specialist*
- **Peptides:** **Yes, explicit** peptide merchant-accounts page. **Ecommerce:** Yes. **Cards:** Yes. **ACH/eCheck:** Likely (high-risk specialist; also MOTO accounts). **Credibility:** High (long-standing high-risk specialist). **Best use:** primary alternative/parallel to AllayPay. **Ask:** same as above. Source: corepay.net/industries/best-peptide-merchant-accounts.

### Easy Pay Direct — *frequently cited for peptides*
- **Peptides:** Cited repeatedly as a consistent peptide processor. **Ecommerce/cards:** Yes; known for "load balancing" across multiple merchant accounts to manage volume/risk. **Credibility:** High in high-risk circles. **Best use:** merchants wanting multi-MID redundancy. **Ask:** load-balancing setup, per-MID caps, reserves. Sources: onpoint.to; allaypay (peer mentions).

### Instabill — *explicit peptide page, offshore options*
- **Peptides:** **Yes, explicit** peptides merchant-accounts page. **Ecommerce/cards:** Yes; domestic + **offshore** options; multi-currency. **ACH/eCheck:** Yes. **Red flags [INFERENCE]:** offshore accounts carry higher fees/scrutiny and optics issues — prefer domestic first. **Best use:** fallback/international. Source: instabill.com/ecommerce-industries/peptides-merchant-accounts.

### PayBlox — *explicit peptide page*
- **Peptides:** **Yes, explicit** high-risk peptides page. **Cards/ecommerce:** Yes. **Credibility:** Niche high-risk processor; verify track record. **Best use:** additional quote for comparison. Source: payblox.com/high-risk-processing/peptides.

### Vector Payments — *explicit peptide page*
- **Peptides:** **Yes, explicit** peptide payment-processing page. **Cards/ecommerce:** Yes. **Best use:** comparison quote. Source: vectorpayments.com/peptide-payment-processing.

### Verified Credit Card Processing — *peptide guides + service*
- **Peptides:** **Yes, explicit** research-peptide credit-card-processing guides. **Best use:** quote + educational; verify they place you with a real acquirer. Source: verifiedcreditcardprocessing.com.

### Durango Merchant Services — *veteran high-risk broker*
- **Peptides:** Serves nutraceuticals/supplements (peptides adjacent; confirm). **Since 1999.** **Ecommerce:** Yes (150+ cart integrations). **ACH/eCheck:** Yes. **Crypto, multi-currency, offshore:** Yes. **Credibility:** High/established. **Best use:** experienced broker for placement + redundancy. **Ask:** explicit peptide/RUO eligibility, acquirer, reserves. Source: durangomerchantservices.com.

### PaymentCloud — *nutra high-risk generalist*
- **Peptides:** Serves nutraceuticals; peptide eligibility to confirm. **Ecommerce/cards/ACH:** Yes. **Credibility:** Well-reviewed high-risk generalist. **Best use:** quote; confirm peptide acceptance explicitly. Source: search results (paycron/merchantmaverick context).

### PayKings — *nutra/supplement specialist*
- **Peptides:** Nutraceutical specialist; flexible underwriting; confirm peptide eligibility. **Cards/ACH:** Yes. **Best use:** quote. Source: paykings.com.

### eMerchantBroker (EMB) — *LA-based high-risk*
- **Peptides:** Nutraceutical accounts; confirm peptide-specific. **Products:** ACH, gateway, chargeback management, MCA. **Best use:** quote + chargeback tooling. Source: search results.

### Soar Payments — *fast high-risk placement*
- **Peptides:** Places various high-risk (confirm peptide). **Speed:** same-day approvals cited. **Best use:** speed/redundancy. Source: merchantmaverick.

### Gateways: NMI · Authorize.net (via high-risk MID) · FluidPay
- **[FACT]:** These are **gateways**, not merchant accounts. NMI and FluidPay are common in high-risk stacks; Authorize.net can work *through* a high-risk merchant account. **[INFERENCE]:** Your acquirer/broker (AllayPay/Corepay/etc.) will specify a compatible gateway. Don't shop gateways independently first.

### Others to request quotes from
PeptiPay (peptide-specialist name cited alongside AllayPay/EPD/Corepay), Sensapay, Maverick Payments, Host Merchant Services, Bankcard International Group, Shark Processing — **[OBSERVED]** appear in the high-risk ecosystem; verify peptide eligibility and credibility individually before engaging.

---

## Compliance gate: LegitScript

- **[FACT/OBSERVED]:** Many high-risk processors require **LegitScript certification** for peptide/health merchants; some (AllayPay) state it's **not required** for their domestic RUO structure. **[INFERENCE]:** Whether you need LegitScript depends on the acquirer and your model — ask every processor directly, and price it in if required.

## Reserves, fees, chargebacks (indicative — confirm) — [OBSERVED]

- Rolling reserve commonly **~10–20%** of monthly volume, held **90–180 days**.
- Per-transaction fees roughly **$0.25–$1.50**; plus a percentage markup; high-risk rates run well above standard.
- **ACH/eCheck:** flat fees ~$0.20–$1.50 and/or 0.5–1.5%; **major advantage: no card chargebacks** (eCheck risk shifts to buyer). **[INFERENCE]** ACH is a strong primary or backup rail for this category.
- Chargeback tools: most high-risk processors bundle monitoring/alerts (e.g., Ethoca/Verifi) — confirm inclusion.

## What the client needs BEFORE applying (merchant application checklist)

- [ ] Registered business entity + EIN; business bank account
- [ ] Government ID for principals; ownership details
- [ ] Voided check / bank letter; 3–6 months processing history (if any) or projections
- [ ] Business address, customer-service contact, working website with required policy pages
- [ ] Clear **refund/return, shipping, privacy, terms, and RUO policy** pages live on site
- [ ] Product catalog with **research-use framing** and **no human-use/dosing/injection copy** (processors review the live site)
- [ ] COA/testing documentation available
- [ ] Projected monthly volume + average ticket
- [ ] PCI compliance plan; chargeback-management plan
- [ ] (If required) LegitScript certification budget
- [ ] **Attorney review of site copy & RUO structure before applying** — processors decline on claim language **[REQUIRES COUNSEL]**

## Comparison scorecard (for the client to fill during outreach)

| Provider | Peptide-explicit? | Cards | ACH/eCheck | Reserve % / term | Effective rate | Setup time | LegitScript req? | Acquirer named? | Gateway | Credibility (1–5) | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| AllayPay | Yes | Y | Y | ? | ? | 3–5d | States no (domestic RUO) | ask | ask | 5 | First call |
| Corepay | Yes | Y | likely | ? | ? | ? | ask | ask | ask | 5 | Parallel |
| Easy Pay Direct | cited | Y | ? | ? | ? | ? | ask | ask | multi-MID | 4 | Redundancy |
| Instabill | Yes | Y | Y | ? | ? | ? | ask | ask | ask | 4 | Offshore option |
| Durango | nutra | Y | Y | ? | ? | ? | ask | ask | many | 4 | Veteran broker |
| PayBlox | Yes | Y | ? | ? | ? | ? | ask | ask | ask | 3 | Quote |
| Vector | Yes | Y | ? | ? | ? | ? | ask | ask | ask | 3 | Quote |
| PaymentCloud | nutra | Y | Y | ? | ? | ? | ask | ask | ask | 4 | Confirm peptide |
| PayKings | nutra | Y | Y | ? | ? | ? | ask | ask | ask | 4 | Confirm peptide |

## Questions to ask every processor

1. Do you explicitly approve **research-use peptides** (and which compounds — any GLP-1 exclusions)?
2. Which **acquiring bank** underwrites the account?
3. **Reserve**: percentage, rolling vs upfront, hold duration?
4. Full **fee schedule** (discount rate, per-tx, monthly, gateway, PCI, chargeback, setup)?
5. **LegitScript** required? Who pays/manages it?
6. **Chargeback** thresholds and what triggers termination?
7. **MATCH/TMF** policy and protections?
8. **Settlement** timing and funding currency (domestic?)?
9. **Volume caps** and how to raise them; multi-MID/load-balancing?
10. What **site copy** must change before approval?
11. Contract length, **early-termination** fees, month-to-month option?
12. **ACH/eCheck** availability as primary or backup rail?

## Recommended sequencing [INFERENCE]

1. Prep site + policies + COAs + clean copy first (do not apply with risky copy live).
2. Get attorney review of copy + RUO structure.
3. Request quotes in parallel from **AllayPay, Corepay, Easy Pay Direct** (top 3), plus **Instabill, Durango** as alternates.
4. Compare via the scorecard; prioritize **domestic card + ACH**, reasonable reserves, named acquirer, MATCH protections.
5. Integrate the chosen acquirer's gateway; keep ACH/eCheck as a backup rail.
