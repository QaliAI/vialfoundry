# Vial Foundry — Reference Platform Production Readiness & Handoff

**Repository**: `QaliAI/vialfoundry`  
**Target**: Clean reference implementation for the reusable peptide commerce platform  
**Status**: Ready for Production / Gold Standard Child Storefront  
**Audit Date**: August 2026

---

## 1. Verified Release Gates

All quality and release gates are green and passing:

| Gate | Command | Status | Details |
|---|---|---|---|
| **Production Audit** | `npm run check:prod` | **PASS** | Catalog volume (20 items), COA batch mapping, math stacking, shipping thresholds, secret isolation |
| **Automated Tests** | `npm test` | **PASS** (34/34) | Order math, idempotency, inventory bounds, timing-safe HMAC sessions, constant-time password check |
| **TypeScript Strict** | `npm run typecheck` | **PASS** | Strict type safety across all components, lib routines, and App Router API endpoints |
| **ESLint** | `npm run lint` | **PASS** | Next.js core web vitals and code styling |
| **Production Build** | `npm run build` | **PASS** | Clean build across all 43 static, dynamic, and API routes |

---

## 2. Core Commerce & Operational Architecture

### A. Critical Workflows Audited & Hardened
1. **Visitor → Product → Cart → Checkout → Order Persisted → Confirmation → Admin Visibility**:
   - **Catalog & PDP**: 20 authentic peptide reference materials with accurate CAS, purity, molecular weights, and lot numbers.
   - **Cart & Inventory**: `CartContext` and `POST /api/checkout` enforce stock limits (`product.stockCount`) and reject out-of-stock additions.
   - **Server-Authoritative Pricing**: Client-supplied prices and discounts are completely ignored; the server validates prices directly against authoritative catalog definitions.
   - **Payment Methods & Discounts**: 5% discount automatically applied for CashApp and Crypto; Zelle, ACH, Venmo, and Manual Invoice fully supported.
   - **Idempotent Checkout**: `submission_key` prevents accidental double-orders on repeated submissions.
   - **Transactional Email**: Resend integration wrapped in safe try/catch so email delivery issues never block customer checkout.
   - **Admin Management**: `/admin/orders` provides live status transitions (`new` → `invoice_sent` → `pending_payment` → `paid` → `preparing` → `shipped` → `fulfilled`), USPS tracking assignment, manual notes, and email resending.

2. **Affiliate Landing → Application → Persistence → Admin Visibility**:
   - **Attribution**: `/r/[code]` referral routes resolve alias codes, store 30-day `vf_ref_partner` cookie, and record click telemetry.
   - **Applications**: Storefront `/affiliates` application form persists to `affiliate_applications` table.
   - **Admin Applications Queue**: `/admin/affiliates` includes an Applications Queue tab with 1-click **Approve** (automatically generating affiliate record and commission rate) and **Reject** controls.
   - **Commission Accounting**: Server calculates commission strictly on the product subtotal (excluding shipping) and writes to `referral_revenue`.

3. **COA / Document → Product Association → Customer Access**:
   - **100% Lot Mapping**: Every product in `src/data/products.ts` maps to a verified analytical batch in `src/data/batches.ts`.
   - **Verification Engine**: Interactive HPLC chromatogram viewer, mass spectrometry verification, and client-side PDF COA generation at `/verify` and on every Product Detail Page.

---

## 3. Security & Integrity Controls

- **No Client-Side Discount Manipulation**: Promo code rules (`FOUNDRY10`, `RESEARCH25`) and payment discounts are calculated server-side in `src/lib/admin/order-math.mjs`.
- **Service-Role Isolation**: `SUPABASE_SERVICE_ROLE_KEY` is restricted strictly to server-side API handlers and `src/lib/supabase/admin.ts`. No service credentials exist in the client bundle.
- **Timing-Safe Admin Authentication**: Admin session cookies use HMAC SHA-256 signatures with constant-time equality checks and fixed-length SHA-256 password hash comparison.
- **Duplicate Order Prevention**: Unique idempotency keys (`submission_key`) are verified before database insertion.
- **Graceful Degradation**: If Supabase or Resend credentials are not configured in preview or development environments, mock fallbacks ensure routes do not crash with 500 errors.

---

## 4. Production Environment Configuration

Set the following environment variables in Vercel (Project `vialfoundry` → Settings → Environment Variables):

| Key | Scope | Required | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | Yes | Supabase Project URL (`https://pmueqjoswsbavnkravth.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Yes | Supabase Anon Key (public inquiries, clicks) |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | Yes | Supabase Service Role Key (server-side order & admin access) |
| `ADMIN_EMAIL` | Production, Preview | Yes | Admin login email (default: `admin@vialfoundry.com`) |
| `ADMIN_ACCESS_PASSWORD` | Production, Preview | Yes | Admin dashboard access password |
| `ADMIN_SESSION_SECRET` | Production, Preview | Yes | 32+ character HMAC secret for signing admin session cookies |
| `NEXT_PUBLIC_SITE_URL` | Production | Yes | Canonical site URL (`https://vialfoundry.com`) |
| `RESEND_API_KEY` | Production | Optional | Resend API key for transactional emails |
| `NOTIFICATION_EMAIL_TO` | Production | Optional | Inbox receiving new order notifications |
| `NEXT_PUBLIC_CASHAPP_CASHTAG` | Production | Optional | Cash App handle displayed on checkout instructions |
| `NEXT_PUBLIC_ZELLE_HANDLE` | Production | Optional | Zelle recipient email/phone displayed on checkout |
| `NEXT_PUBLIC_NOWPAYMENTS_LINK` | Production | Optional | NOWPayments hosted payment link |
| `NEXT_PUBLIC_LINKMONEY_LINK` | Production | Optional | Link.money ACH link |

---

## 5. Domain & DNS Configuration

1. **Vercel**: Add `vialfoundry.com` and `www.vialfoundry.com` to Domains.
2. **Porkbun DNS**:
   - `A` record: `@` → `76.76.21.21` (TTL 600)
   - `CNAME` record: `www` → `cname.vercel-dns.com` (TTL 600)
3. Set `vialfoundry.com` as canonical redirect.
