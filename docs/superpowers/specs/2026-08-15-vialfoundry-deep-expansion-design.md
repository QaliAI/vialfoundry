# Vial Foundry — Deep Expansion Design Spec

**Date:** 2026-08-15
**Status:** Approved
**Repo:** github.com/QaliAI/vialfoundry · **Domain:** vialfoundry.com (Porkbun) · **Host:** Vercel

## Goal

Turn the existing ~90%-complete Next.js 14 storefront into a premium, production-ready
**research-use-only (RUO)** peptide & reference-standard store. Checkout is an
**inquiry/quote model** (no card charging). Dynamic data is backed by a dedicated
**Supabase** project in the QaliAI org.

## Non-goals (this pass)

- No live card/crypto payment processing (inquiry model only; adapters left pluggable).
- No customer login/accounts (guest inquiry only).
- No net-new admin subsystems beyond wiring existing admin pages to Supabase.

## Architecture

- Keep Next.js 14 App Router + React 18 + TS + Tailwind. Preserve the existing dark
  industrial design system.
- **Static-first catalog**: product/article/batch data stays in `src/data/*` for speed and
  SEO; Supabase is the source of truth for **writes** (inquiries, contact, newsletter,
  restock, reviews) and admin reads.
- Supabase project `vialfoundry` (QaliAI org). Migrations: existing `01_schema.sql`,
  `02_rls.sql`, `seed.sql` + new `03_reviews.sql`.

## Workstreams

### A. Compliance & Trust
- `AgeGate` modal component: 18+ / RUO / "not for human consumption" acknowledgment,
  persisted in `localStorage` (`vf_ruo_ack`). Blocks interaction until accepted.
- Legal pages under `/legal/*`: `terms`, `privacy`, `shipping`, `refunds`, `ruo-disclaimer`,
  `acceptable-use`. Static content, linked in footer.
- Persistent RUO disclaimer line in `Footer` and on product pages.

### B. Catalog & product pages
- **Bug fix:** catalog `ProductCard` must render the product on a solid surface
  (use `image` / dark surface backdrop, not `transparentImage` on a bare card).
- Expand `src/data/products.ts` from 10 → ~20 compounds with realistic analytical fields,
  spread across existing categories. Add matching `batches.ts` lots.
- Rich product page: tabbed sections (Overview · Specifications · Documentation ·
  Storage & Handling · References), related-products row, and **Notify-on-restock** capture
  for out-of-stock items (writes `restock_requests`).

### C. Content hub
- Expand `src/data/articles.ts` with full long-form articles: reconstitution guide,
  storage best practices, reading a COA/HPLC, peptide glossary. Rendered via existing
  `/resources/[slug]`.

### D. Social proof
- New `reviews` table + `03_reviews.sql`. Verified-lab review cards on product pages and a
  homepage trust strip. Seed with realistic verified reviews.

### E. Conversion flow (inquiry model)
- Cart drawer CTA → **Request Order / Get Quote**. `/api/checkout` writes to `orders`
  (`status='inquiry'`, `payment_status='unpaid'`) + `order_items`, returns order number →
  existing order-confirmation page reframed as "Inquiry received."
- Newsletter → `/api/newsletter` → `email_subscribers`.
- Contact → `/api/contact` → `contact_requests`.
- Restock → `/api/restock` → `restock_requests`.
- All routes: on missing `RESEND_API_KEY`, persist to Supabase and skip email (no error).

### F. Backend wiring
- Create Supabase project (confirm cost first), apply all migrations, seed.
- `src/lib/supabase/*` already present; ensure server/admin clients read env.
- Admin pages read from Supabase where currently static.
- Env in Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, (optional) `RESEND_API_KEY`.

### G. SEO / performance / analytics
- Per-route metadata + OG image, `app/sitemap.ts`, `app/robots.ts`, JSON-LD
  (Organization + Product), hero video poster-first/lazy, `@vercel/analytics`.

### H. Ship
- Commit, push to `main`, redeploy Vercel, hand off exact Porkbun DNS records.

## Data model additions

```sql
-- 03_reviews.sql
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade,
  product_slug varchar(255),
  reviewer_name varchar(255) not null,
  reviewer_org varchar(255),
  rating int not null check (rating between 1 and 5),
  title varchar(255),
  body text not null,
  verified boolean default true,
  status varchar(50) default 'published',
  created_at timestamptz default now()
);
```

## Risks / decisions

- **Payment underwriting**: inquiry model sidesteps high-risk processor blocks; adapters
  remain for a future gateway.
- **Email**: Resend optional; graceful degradation.
- **Supabase project creation** may incur cost — confirm via API before creating.
- **RLS**: public read on catalog-adjacent tables; inserts allowed for inquiry/contact/
  newsletter/restock via anon; sensitive tables service-role only.

## Success criteria

- `next build` passes; typecheck clean.
- Age gate + legal pages live; no checkerboard images; ~20 products; rich product pages.
- Inquiry, contact, newsletter, restock all persist to Supabase.
- SEO metadata/sitemap/robots/JSON-LD present; analytics firing.
- Deployed to Vercel on `main`; DNS instructions delivered.
