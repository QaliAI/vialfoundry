# Vial Foundry Deep Expansion Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a premium, production-ready RUO peptide storefront with inquiry checkout, Supabase-backed data, compliance layer, expanded catalog/content, SEO, and deploy to Vercel.

**Architecture:** Preserve the existing Next.js 14 App Router + Tailwind dark design system. Static-first catalog data in `src/data/*`; Supabase as source of truth for writes (inquiries, contact, newsletter, restock, reviews) and admin reads. Inquiry/quote checkout (no card charging).

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind, Supabase (QaliAI org), Resend (optional), @vercel/analytics.

## Global Constraints

- Framework: Next.js 14 App Router; React 18; TypeScript strict; typecheck (`npx tsc --noEmit`) MUST stay clean.
- Verification per task: `npx tsc --noEmit` passes; where UI changes, a `next build` or visual check.
- Preserve existing design tokens (dark industrial, cyan/teal accent). No new UI framework.
- RUO copy required: "For research use only. Not for human consumption." on legal + product surfaces.
- Email routes MUST degrade gracefully when `RESEND_API_KEY` is unset (persist to Supabase, skip send).
- Frequent commits, one logical change per commit.

---

### Task 1: Supabase project + migrations + env
**Files:** Create `supabase/migrations/03_reviews.sql`; Modify `.env.example`.
- [ ] Confirm project-creation cost via Supabase API; create project `vialfoundry` in QaliAI org.
- [ ] Write `03_reviews.sql` (reviews table per spec).
- [ ] Apply `01_schema.sql`, `02_rls.sql`, `03_reviews.sql`, then `seed.sql` via `apply_migration`/`execute_sql`.
- [ ] Retrieve project URL + anon + service_role keys; write `.env.local` (gitignored); update `.env.example`.
- [ ] Verify: `list_tables` shows all tables incl. `reviews`.

### Task 2: RLS review for public writes
**Files:** Modify `supabase/migrations/02_rls.sql` (or new `04_rls_public_writes.sql`).
- [ ] Ensure anon INSERT allowed on `contact_requests`, `email_subscribers`, `restock_requests`, and inquiry `orders`/`order_items`; public SELECT on `reviews` (status='published'), catalog tables, `batches`, `coas` (is_public).
- [ ] Sensitive tables (customers, discounts, affiliates, audit) service-role only.
- [ ] Apply and verify with `get_advisors` (security).

### Task 3: Compliance — age gate + legal pages
**Files:** Create `src/components/AgeGate.tsx`, `src/app/legal/layout.tsx`, `src/app/legal/{terms,privacy,shipping,refunds,ruo-disclaimer,acceptable-use}/page.tsx`; Modify `src/app/layout.tsx`, `src/components/Footer.tsx`.
- [ ] `AgeGate`: modal, localStorage key `vf_ruo_ack`, 18+/RUO acknowledgment, blocks until accepted. Mount in root layout.
- [ ] Six legal pages with real content + metadata.
- [ ] Footer: legal links + persistent RUO disclaimer line.
- [ ] Verify: `tsc` clean; age gate shows once then persists.

### Task 4: Catalog image fix + expansion
**Files:** Modify `src/components/ProductCard.tsx`, `src/data/products.ts`, `src/data/batches.ts`.
- [ ] Fix card image: render on solid dark surface (use `image`, not bare `transparentImage`).
- [ ] Expand products 10 → ~20 with realistic analytical fields across existing categories; add matching batch lots.
- [ ] Verify: catalog renders, no checkerboard, all products have lots.

### Task 5: Rich product page
**Files:** Modify `src/views/ProductDetailPage.tsx`; Create `src/components/ProductTabs.tsx`, `src/components/RelatedProducts.tsx`, `src/components/RestockNotify.tsx`.
- [ ] Tabbed layout (Overview · Specifications · Documentation · Storage & Handling · References).
- [ ] Related-products row (same category).
- [ ] Restock capture for OOS → `/api/restock`.
- [ ] Verify: `tsc` clean; tabs switch; OOS shows restock form.

### Task 6: Inquiry checkout flow
**Files:** Modify `src/app/api/checkout/route.ts`, `src/views/*checkout*`/`CartDrawer.tsx`, order-confirmation page; Create `src/lib/inquiries.ts`.
- [ ] `/api/checkout` writes `orders` (status `inquiry`) + `order_items` to Supabase, returns order number.
- [ ] Cart CTA → "Request Order / Get Quote"; confirmation page reframed as "Inquiry received".
- [ ] Optional Resend email to admin+customer (graceful skip).
- [ ] Verify: submitting cart creates a row in `orders`.

### Task 7: Forms wired to Supabase
**Files:** Create `src/app/api/newsletter/route.ts`, `src/app/api/restock/route.ts`; Modify `src/app/api/contact/route.ts`, `Footer.tsx`, `ContactPage.tsx`.
- [ ] Contact → `contact_requests`; Newsletter → `email_subscribers`; Restock → `restock_requests`.
- [ ] All degrade gracefully without Resend.
- [ ] Verify: each form insert appears via `execute_sql` select.

### Task 8: Content hub
**Files:** Modify `src/data/articles.ts`.
- [ ] Add full articles: reconstitution guide, storage best practices, reading a COA/HPLC, peptide glossary.
- [ ] Verify: `/resources` lists them; `/resources/[slug]` renders full body.

### Task 9: Reviews / social proof
**Files:** Create `src/lib/reviews.ts`, `src/components/ReviewList.tsx`, `src/components/TrustStrip.tsx`; Modify product page + homepage.
- [ ] Seed `reviews` with realistic verified rows.
- [ ] Product page shows reviews; homepage shows trust strip.
- [ ] Verify: reviews render from Supabase (with static fallback).

### Task 10: SEO + performance + analytics
**Files:** Create `src/app/sitemap.ts`, `src/app/robots.ts`, OG image; Modify `layout.tsx`, product/catalog metadata, `Hero`, `package.json`.
- [ ] Per-route metadata + OG image; JSON-LD (Organization + Product); sitemap; robots.
- [ ] Hero video poster-first/lazy; add `@vercel/analytics`.
- [ ] Verify: `next build` clean; metadata present in HTML.

### Task 11: Admin wiring
**Files:** Modify `src/app/admin/*` reads.
- [ ] Point dashboard/orders/customers/subscribers/contact lists at Supabase.
- [ ] Verify: admin pages render live data.

### Task 12: Deploy + DNS handoff
- [ ] `npx tsc --noEmit` + `next build` pass locally.
- [ ] Commit, push to `main`. Set Vercel env vars. Redeploy.
- [ ] Provide Porkbun DNS records + Vercel domain steps.
- [ ] Verify: production URL loads; report status.

## Self-Review Notes
- Spec coverage: A→Task 3; B→Tasks 4,5; C→Task 8; D→Task 9; E→Tasks 6,7; F→Tasks 1,2,11; G→Task 10; H→Task 12. All covered.
- No unit-test harness exists; verification = tsc/build/DB-select/visual, per Global Constraints.
