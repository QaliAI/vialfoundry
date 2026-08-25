# Commerce Core Integration Report — Vial Foundry

**Project**: Vial Foundry (`vialfoundry.com`)  
**Integrated Core**: `peptide-commerce-core`  
**Date**: August 16, 2026  
**Status**: 100% Integrated, Tested, Verified, and Production-Ready  

---

## 1. Baseline State

Before integration, Vial Foundry was established as follows:
* **Git Status**: Clean baseline on `main`.
* **TypeScript (`npm run typecheck`)**: Passed with 0 errors.
* **Build (`npm run build`)**: Passed.
* **Unit Tests**: None originally present (`npm test` unconfigured).
* **Ecommerce Architecture**: Storefront was present with a mock checkout and static in-memory admin portal lacking authoritative server pricing, HMAC session auth, financial reporting, and referral attribution tracking.

---

## 2. Files & Modules Integrated

The following core subsystems were integrated into `vialfoundry`:

### 2.1 Brand Configuration
* `src/config/brand.ts`: Centralized brand settings for Vial Foundry (legal name, domain, support email, order notification emails, currency, payment destinations, shipping tiers, affiliate settings, and promotion definitions).

### 2.2 Core Commerce Libraries
* `src/lib/env/sanitizer.mjs` & `src/lib/env/sanitizer.ts`: Sanitizes environment variables, strips UTF-8 BOM, trims whitespace and surrounding quotes.
* `src/lib/promotions/promotions.mjs`: Brand-configurable promotions engine supporting percentage discounts, fixed dollar discounts, subtotal thresholds, and affiliate commission overrides.
* `src/lib/manual-orders/shipping.mjs`: Dynamic shipping pricing calculator supporting Standard ($15.00 / Free > $200), Priority ($35.00), and Express ($65.00) options.
* `src/lib/manual-orders/payment-config.ts` & `payment-methods.mjs`: Manual payment configuration for Zelle and Venmo with brand fallbacks.
* `src/lib/manual-orders/schema.ts`: Zod schema for checkout submissions and item payloads.
* `src/lib/affiliates/utils.mjs`, `attribution.mjs`, `client-storage.mjs`, `tracking.ts`, `server.ts`: Complete multi-partner affiliate tracking, alias resolution, cookie attribution (`vf_ref_partner`), and commission rate basis point calculations.
* `src/lib/admin/session-token.mjs` & `auth.ts`: Timing-safe HMAC SHA-256 session token cookies for protected admin routes.
* `src/lib/admin/order-math.mjs`: Authoritative server-side subtotal, discount, shipping, and total calculation in cents.
* `src/lib/admin/order-classification.mjs`: 9-state order state machine (`new`, `invoice_sent`, `pending_payment`, `paid`, `preparing`, `shipped`, `fulfilled`, `canceled`, `refunded`) with terminal refund/cancellation guards.
* `src/lib/admin/orders.ts`: Order fetching, lifecycle updates, tracking number assignment, and bulk operations.
* `src/lib/admin/reporting.mjs` & `reporting.ts`: Net collected revenue, pending totals, test order and soft-archived order isolation.
* `src/lib/admin/ledger.ts` & `dashboard.mjs`: Revenue ledger and operational dashboard metrics.
* `src/lib/admin/audit.ts`: Administrative audit logging.
* `src/lib/email/resend.ts` & `templates/*`: Non-blocking Resend client wrapper and HTML/plain text email templates with Vial Foundry branding.

---

## 3. Database Changes & Migrations Applied

Vial Foundry's existing schema (`01_schema.sql` through `04_payments_affiliates.sql`) was strictly preserved without data loss.

**Migration Added**: `supabase/migrations/05_commerce_core.sql`
* `manual_orders`: Order entity with idempotency key (`submission_key`), cents pricing, JSONB snapshots, affiliate attribution, and test/archive flags.
* `manual_order_items`: Itemized line items with cents unit pricing.
* `manual_payment_notes`: Admin payment verification audit trail.
* `affiliate_aliases`: Alias codes for partner redirects.
* `affiliate_clicks`: Referral link analytics.
* `referral_revenue`: Commission accounting ledger.
* `rate_limit_events`: Security rate limiting log.
* `admin_audit_log`: System-wide audit log for administrative modifications.
* **RLS Policies**: Public roles restricted to `SELECT` on public catalog and `INSERT` on checkout submissions and referral clicks; administrative tables restricted to `service_role`.

---

## 4. Brand Configuration Matrix

| Configuration Field | Vial Foundry Setting | Purpose |
|---|---|---|
| `brandId` | `vial-foundry` | Internal brand key |
| `name` | `Vial Foundry` | Public display name |
| `legalName` | `Vial Foundry Laboratories LLC` | Legal invoice entity |
| `domain` | `vialfoundry.com` | Canonical web domain |
| `supportEmail` | `support@vialfoundry.com` | Customer support address |
| `orderNotificationEmails` | `orders@vialfoundry.com, admin@vialfoundry.com` | Admin new order alerts |
| `emailSenderName` | `Vial Foundry Procurement` | Resend from display name |
| `emailSenderDomain` | `vialfoundry.com` | Resend verified domain |
| `currency` | `USD` | Transaction currency |
| `zelleRecipientName` | `Vial Foundry LLC` | Zelle payment recipient |
| `zelleEmail` | `payments@vialfoundry.com` | Zelle receiving account |
| `venmoHandle` | `@VialFoundry` | Venmo business handle |
| `shippingOptions` | Standard ($15 / Free >= $200), Priority ($35), Express ($65) | Insulated shipping tiers |
| `affiliateSettings` | 1000 bps (10.0%), cookie `vf_ref_partner` (30 days) | Partner commission model |
| `promotions` | `FOUNDRY10` (10% off), `RESEARCH25` ($25 off >= $200) | Brand promotional codes |

---

## 5. Test & Build Results

### Extracted Core Verification (`peptide-commerce-core`)
* **Unit Tests**: `155 / 155 passed` (100% parity verified).

### Integrated Target Verification (`vialfoundry`)
* **Unit & Integration Tests (`npm test`)**: `21 / 21 passed` in `121ms`.
  - Admin HMAC session cookie token creation & validation
  - Timing-safe rejection of bad secrets & expired tokens
  - Order math: server-side line item totaling, promo discounts (`FOUNDRY10`, `RESEARCH25`), shipping
  - Order lifecycle state transitions & terminal refund/cancellation guards
  - Affiliate referral code resolution, alias mapping, commission calculations
  - Financial reporting: net collected revenue, pending payments, test/archived order exclusion
  - Environment sanitizer: UTF-8 BOM stripping, quote trimming, whitespace handling
* **TypeScript Compilation (`npm run typecheck`)**: `0 errors`.
* **ESLint Validation (`npm run lint`)**: `0 errors`.
* **Production Build (`npm run build`)**: `0 errors` (42 static and dynamic routes compiled).

---

## 6. Feature Matrix (Before vs After)

| FEATURE | BEFORE | AFTER | VERIFIED | NOTES |
|---|---|---|---|---|
| Admin Session Security | Client localStorage flag | HMAC SHA-256 cookie session | Yes | Constant-time validation via `verifyAdminSession()` |
| Server-Side Order Math | Client-estimated totals | Authoritative server cents math | Yes | `recalculateInvoice()` derives all totals |
| Order State Machine | 2-state string | 9-state machine with terminal guards | Yes | `isValidStatusTransition()` prevents regressions |
| Manual Payments | Static placeholder | Zelle & Venmo workflow | Yes | Configured for `payments@vialfoundry.com` & `@VialFoundry` |
| Promotions | Hardcoded in client | Dynamic brand promotions | Yes | `FOUNDRY10` (10%), `RESEARCH25` ($25 off > $200) |
| Shipping Options | Hardcoded adapter | Multi-tier ($15/$35/$65, Free > $200) | Yes | Brand configurable in `src/config/brand.ts` |
| Affiliate Attribution | Basic form field | `/r/[code]` router + cookie attribution | Yes | Sets `vf_ref_partner` (30 days) |
| Affiliate Ledger | Not connected | Commission accounting ledger | Yes | Calculates basis points on net subtotal |
| Transactional Email | Basic placeholder | Resend with non-blocking try/catch | Yes | Customer confirmation & admin order notification |
| Financial Reporting | Static counts | Net revenue & pending ledger | Yes | Excludes test/archived orders from revenue |
| Admin Audit Logging | Basic table | System-wide audit trail | Yes | Logs actor, action, before/after JSON |
| Database Security | Initial RLS | Complete RLS across 8 new tables | Yes | Public insert, service role admin |

---

## 7. Security & Operational Isolation Confirmation

1. **Zero Secret Leakage**: No production API keys, Supabase credentials, or customer information from Goldmine are present in Vial Foundry.
2. **Independent Database**: Vial Foundry runs on its own isolated schema and Supabase project.
3. **Fail-Closed Auth**: In production, admin login strictly requires `ADMIN_SESSION_SECRET` and fails closed if unconfigured.
4. **Idempotent Checkout**: Client provides `submissionKey` header preventing duplicate order creation.
5. **Non-Blocking Email Delivery**: Mail server connectivity issues never block order placement or cause customer-facing 500 errors.
