# Vial Foundry — Production Readiness

**Repository**: `QaliAI/vialfoundry`  
**Production**: https://www.vialfoundry.com  
**Canonical URL**: `https://www.vialfoundry.com`

This file describes **current reality**. Do not use it to reintroduce synthetic
certificates, purity figures, HPLC/MS traces, or placeholder payment handles.

---

## 1. What is live

- Next.js App Router storefront with approved branding and plain-English copy.
- Public catalogue: **18** products (`PUBLIC_PRODUCTS`). Two SKUs remain in
  `PRODUCTS` but are withheld from the storefront until honest product imagery
  exists (`hiddenFromCatalogReason`).
- **Zero** authentic Certificates of Analysis are configured.
  `src/data/verified-batch-records.ts` is empty by design. Public pages must
  show documentation pending — never a fabricated purity, COA date, or lab.
- Payments: **Stripe Checkout** (card / wallets Stripe attaches to card).
  The webhook at `/api/webhooks/stripe` is the only authority that marks an
  order paid. The success URL is never trusted.
- Inventory: **Supabase `products.inventory_quantity`** is the single runtime
  source of truth. Admin adjustments, checkout stock checks, payment decrements
  and full-refund restocks all use that column.
- Admin: passwordless email login for allowlisted `admin_users`. Sessions are
  HMAC-signed HttpOnly cookies. Acting operator email is recorded on mutations.

---

## 2. Release gates

| Gate | Command | Meaning |
|---|---|---|
| Tests | `npm test` | Catalog authority, Stripe amounts, webhook rules, inventory policy, admin session HMAC, documentation integrity, secret scan |
| Types | `npm run typecheck` | `tsc --noEmit` |
| Lint | `npm run lint` | Next.js core-web-vitals |
| Build | `npm run build` | Production compile |
| Reality audit | `npm run check:prod` | Catalog parse, no synthetic batch generators, no unsupported public claims, commerce math, Stripe gating (names/modes only) |

`check:prod` **must not** assert universal COA coverage. Zero supplied records
is a passing, honest state.

---

## 3. Commerce rules (do not weaken)

1. Public checkout resolves products by **id and/or SKU only**. Product name is
   not authority. Unknown products return 400
   `"This product is not available for checkout."`
2. Client `unitPriceAmount` is ignored. The server charges `catalog.price`.
3. There is no custom / non-catalog fallback on `POST /api/checkout`. Quotes
   belong in a separate admin workflow.
4. Production checkout **fails closed** if Supabase is not operational. It must
   not silently use build-time `stockCount`.
5. Stock is checked at session creation against Supabase, decremented once on
   confirmed payment, restocked once on a full refund. Webhook retries must not
   double-decrement (`inventory_decremented_at` / `apply_inventory_delta`).
6. Stripe test keys on Preview; live keys on Production only.
7. Do not invent payment handles. Unconfigured manual methods stay hidden.

---

## 4. Documentation integrity

Authentic lot evidence lives only in `VERIFIED_BATCH_RECORDS`.

Rules:

- Never add a record without the physical certificate.
- Never estimate purity, dates, chromatograms or issuing labs.
- `src/data/products.ts` must not contain `purityPercentage`, `coaAvailable`
  or `coaDate`.
- `src/data/batches.ts` must not generate records.

---

## 5. Environment (names only — never commit values)

### Stripe

| Name | Preview | Production |
|---|---|---|
| `PAYMENT_GATEWAY_TYPE` | `stripe` | `stripe` |
| `NEXT_PUBLIC_PAYMENT_GATEWAY_TYPE` | `stripe` | `stripe` |
| `STRIPE_SECRET_KEY` | `sk_test_` | `sk_live_` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_` | `pk_live_` |
| `STRIPE_WEBHOOK_SECRET` | test endpoint secret | live endpoint secret |
| `NEXT_PUBLIC_SITE_URL` | `https://www.vialfoundry.com` | `https://www.vialfoundry.com` |

Webhook URL: `https://www.vialfoundry.com/api/webhooks/stripe`  
Events: `checkout.session.completed`, `checkout.session.expired`,
`payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`.

### Data & mail

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`,
`TRANSACTIONAL_EMAIL_FROM`, `TRANSACTIONAL_EMAIL_REPLY_TO`,
`ADMIN_NOTIFICATION_EMAIL`, `NEXT_PUBLIC_SUPPORT_EMAIL`,
`NEXT_PUBLIC_HELLO_EMAIL`, `ADMIN_SESSION_SECRET`.

Admin users are rows in `admin_users`, not environment passwords.
Do not set a shared `ADMIN_ACCESS_PASSWORD`.

---

## 6. Admin operators

Allowlisted in `admin_users` (seeded by migration `08_admin_users_inventory.sql`):

- owner
- admin

Login: `/admin/login` → email → single-use link (≈12 minutes) → HMAC session.
Unauthenticated `/admin/*` redirects to login. APIs still 401 without a valid
session. Order events record the acting email.

---

## 7. What this file must never claim

- That every lot has a COA, HPLC trace, or third-party test.
- A 20-product public storefront (18 are public).
- Manual Cash App / Zelle / Venmo as primary checkout while Stripe is live.
- A single shared admin password.
- Cold-chain or temperature-monitored fulfilment.
- That landing on the success URL means the order is paid.
