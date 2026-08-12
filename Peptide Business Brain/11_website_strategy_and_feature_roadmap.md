# 11 — Website Strategy & Feature Roadmap

*Builds on competitor research + the existing Next.js/Supabase/Vercel MVP. Aligns with CLAUDE.md tech stack and architecture rules. Labels: [INFERENCE] unless noted.*

## Strategic thesis

Win by being the **cleanest, most premium, most documentation-first** operator. The website is not just a store — it's the trust artifact that (a) converts research buyers, (b) satisfies high-risk processor underwriting, and (c) survives "totality of marketing" scrutiny. Every feature serves one of those three.

## What the current MVP should show (now)

- Premium public site: home, catalog, product (datasheet) pages, about/quality, contact.
- Controlled **inquiry / catalog-access request** flow with research-use acknowledgement (the conversion event in lieu of checkout).
- Supabase capture of submissions; Resend confirmation + admin notification.
- Admin-lite dashboard with clean empty/demo states.
- Analytics abstraction (PostHog-ready no-op fallback).
- Centralized brand/site settings; policy pages (RUO, shipping, returns, privacy, terms).
- Hard copy guardrails enforced sitewide (per `09`).

## What to add before client demo

- Polished home sections (hero with abstract peptide/molecular motif, quality/testing band, category grid, COA/batch preview card, inquiry CTA).
- 6–8 flagship product datasheet pages (BPC-157, TB-500, GHK-Cu, CJC-1295, Ipamorelin, + 1–3) with COA/batch reference fields.
- Working inquiry + access-request forms (Zod + RHF), success/confirmation states.
- Admin-lite list view of submissions.
- Screenshots + local preview URL per CLAUDE.md verification.

## What to add before soft launch

- Full Phase-1 catalog as technical records.
- COA library page (even if "available on request" initially) + testing-methodology page.
- Email flows (inquiry confirmation, access-request confirmation, admin alerts).
- Analytics events wired (page views, inquiry start/submit, access request, COA view).
- SEO foundation: schema (Product/Organization/Breadcrumb), sitemap, metadata, internal linking.
- Review/testimonial moderation policy (strip human-outcome claims).

## What to add before public launch

- Documentation/knowledge hub (safe articles per `07`).
- Refined trust pages; provenance/quality story.
- Performance/accessibility pass (Core Web Vitals).
- Legal-reviewed copy + RUO policy.

## What to add AFTER payment processor approval

- Live checkout integrated with the approved high-risk acquirer's gateway (NMI/Authorize.net/FluidPay as specified) + ACH/eCheck rail.
- Order workflow, order-status, customer accounts.
- PCI-compliant card handling; reserve/settlement reconciliation in admin.
- **Do not build any of this until a processor is signed.**

## Admin dashboard roadmap

- Phase 1.5: submissions list, status, notes, search/filter, export (CSV).
- Phase 2: product CMS (CRUD), COA/batch manager, image/asset handling.
- Phase 3+: orders, fulfillment, refunds, chargeback notes, customer records.
- Auth: demo password gate now (documented as NOT production auth) → real Supabase auth before handling orders/PII at scale.

## Analytics to track (via abstraction; real events only)

Inquiry started/submitted, access request submitted, COA viewed, product datasheet viewed, category viewed, email signup, search queries, outbound documentation downloads. No fake/vanity numbers.

## COA / batch tools to build (Phase 2)

- COA upload + batch-number tagging (Supabase Storage).
- Public batch-lookup page (enter batch → see COA).
- Per-product COA association on datasheet pages.
- Lot traceability fields (compound, lot, test date, lab, method, purity).

## Product CMS tools (Phase 2)

- Product CRUD with technical-record schema (compound, CAS, MW, purity, vial size, COA ref, storage form, category, status).
- Draft/publish; demo-data flag; no fake production data.

## Email flows to build

- Transactional: inquiry/access confirmations, admin alerts (now).
- Lifecycle (post-launch, guardrailed): documentation updates, restock/availability, research-context newsletter. No outcome/marketing-claim copy.

## Legal / policy pages to include

RUO policy, terms, privacy, shipping, returns/guarantee, responsible-use/compliance statement, contact. (Counsel-reviewed.)

## What NOT to build yet

- Live payments / checkout (pre-approval).
- GLP-1 catalog or any injection supplies.
- Customer accounts/order history (pre-payment).
- Complex Phase-2/3 features before the premium MVP + processor path are locked.

## Phased roadmap (summary)

| Phase | Focus | Key deliverables |
|---|---|---|
| **1 — Premium MVP** | Trust + catalog + inquiry | Home, datasheet pages, inquiry/access flow, policies, guardrails, admin-lite, email, analytics readiness |
| **1.5 — Access/admin/inquiry infra** | Operations | Submission management, CSV export, demo→real auth path, refined empty states |
| **2 — COA/batch + product CMS** | Documentation depth | Batch lookup, COA library, product CRUD, lot traceability |
| **3 — Approved payment integration** | Revenue | Live checkout + ACH via approved acquirer, orders, accounts, reconciliation |
| **4 — SEO/content/affiliate engine** | Growth | Knowledge hub, content cadence, curated affiliate program, backlinks |
| **5 — Wholesale/researcher portal** | B2B durability | Custom synthesis quotes, bulk pricing, institutional accounts |

**Verification per CLAUDE.md:** every meaningful build ends with `npx tsc --noEmit`, `npm run lint`, `npm run build`, a clean-port local preview URL, and screenshots/route list.
