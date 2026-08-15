# Vial Foundry — Production Readiness & Handoff

Current deployment state and the remaining manual steps to go fully live.

---

## 1. Completed

- [x] Premium RUO storefront (Next.js 14 App Router, dark industrial design system).
- [x] Dedicated Supabase project `vialfoundry` (QaliAI org, ref `pmueqjoswsbavnkravth`) with schema, RLS, reviews, and seed data applied.
- [x] Compliance layer: RUO age gate + 6 legal pages (`/legal/*`) + footer disclaimer.
- [x] Catalog of 20 research compounds; fixed product imagery; rich tabbed product pages; out-of-stock restock capture.
- [x] Inquiry / quote checkout (no card charging) persisting orders to Supabase — verified end-to-end.
- [x] Contact, newsletter, and restock forms wired to Supabase with graceful email fallback (Resend optional).
- [x] Content hub (6 articles) + verified reviews + homepage trust strip.
- [x] SEO: metadata, Open Graph, `sitemap.xml`, `robots.txt`, Organization + Product JSON-LD. Vercel Analytics installed.
- [x] Pushed to `github.com/QaliAI/vialfoundry` (branch `main`); Vercel auto-deploys `main` to production.

---

## 2. Remaining manual steps (client)

### A. Add environment variables in Vercel
Vercel → Project `vialfoundry` → Settings → Environment Variables (Production + Preview):

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://pmueqjoswsbavnkravth.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (anon key — Supabase → Project Settings → API) |
| `SUPABASE_SERVICE_ROLE_KEY` | (service-role key — same page; needed for admin console) |
| `NEXT_PUBLIC_SITE_URL` | `https://vialfoundry.com` |
| `RESEND_API_KEY` | (optional — enables inquiry/contact emails) |
| `NOTIFICATION_EMAIL_TO` | your admin inbox |
| `NEXT_PUBLIC_CASHAPP_CASHTAG` | your `$cashtag` (shown at checkout) |
| `NEXT_PUBLIC_ZELLE_HANDLE` | your Zelle email/phone |
| `NEXT_PUBLIC_NOWPAYMENTS_LINK` | your NOWPayments hosted crypto link (optional) |
| `NEXT_PUBLIC_LINKMONEY_LINK` | your link.money ACH link (optional) |

> Checkout offers CashApp (5% off), Crypto (5% off), Zelle, and ACH. These handles are shown to customers as payment instructions — until you set them, sensible placeholders display.

Then **redeploy** (Deployments → ⋯ → Redeploy) so the values take effect.

### B. Connect the domain (Porkbun → Vercel)
1. Vercel → Project → Settings → Domains → add `vialfoundry.com` and `www.vialfoundry.com`.
2. In Porkbun DNS for `vialfoundry.com`:

| Type | Host | Value | TTL |
| --- | --- | --- | --- |
| A | `@` (blank) | `76.76.21.21` | 600 |
| CNAME | `www` | `cname.vercel-dns.com` | 600 |

3. Set `vialfoundry.com` as the canonical domain (redirect `www` → apex).

> The custom domain is excluded from Vercel Authentication, so it will be publicly accessible once DNS propagates.

### C. Optional
- Disable Vercel Authentication (Settings → Deployment Protection) if you want the `*.vercel.app` preview URLs public too.
- Add a Resend API key for transactional emails.
- Provide a high-risk payment gateway later; the `PaymentAdapter` interface is ready.
