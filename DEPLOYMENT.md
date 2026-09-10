# Vial Foundry — Deployment & Domain Setup Guide

Comprehensive instructions for deploying Vial Foundry to Vercel and configuring Porkbun DNS.

---

## 1. GitHub Repository

- **Repository URL**: `https://github.com/QaliAI/vialfoundry`
- **Production Branch**: `main`

---

## 2. Vercel Project Setup

- **Project Name**: `vialfoundry`
- **Framework Preset**: Next.js
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Live Vercel Production URL**: `https://vialfoundry-h9zxe82lt-qaliais-projects.vercel.app`

---

## 3. Porkbun Domain & DNS Setup (`vialfoundry.com`)

To connect your purchased domain **vialfoundry.com** to Vercel:

### Step A: Add Domain in Vercel
1. Navigate to Vercel Dashboard -> Project `vialfoundry` -> Settings -> Domains.
2. Add `vialfoundry.com` and `www.vialfoundry.com`.

### Step B: Update DNS Records in Porkbun
Log into your Porkbun account and add the following exact DNS records for `vialfoundry.com`:

| Type | Host / Name | Value / Target | TTL |
| --- | --- | --- | --- |
| **A** | `@` (or blank) | `76.76.21.21` | 600 |
| **CNAME** | `www` | `cname.vercel-dns.com` | 600 |

### Step C: Canonical Redirect
In Vercel Domain settings, set `www.vialfoundry.com` or `vialfoundry.com` as the canonical domain and redirect the other host to it.

---

## 4. Stripe environment (do not paste secret values)

Stripe Checkout is gated by `PAYMENT_GATEWAY_TYPE=stripe` **and** a complete, environment-safe credential set.

| Vercel environment | Stripe keys | Webhook signing secret |
| --- | --- | --- |
| Development | TEST (`sk_test_` / `pk_test_`) | Test endpoint secret |
| Preview | TEST (`sk_test_` / `pk_test_`) | Test endpoint secret |
| Production | LIVE (`sk_live_` / `pk_live_`) | Live endpoint secret |

Required names (values stay in Vercel; never in git):

- `PAYMENT_GATEWAY_TYPE`
- `NEXT_PUBLIC_PAYMENT_GATEWAY_TYPE`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL`

Webhook URL: `https://www.vialfoundry.com/api/webhooks/stripe` (live) and the Preview URL `/api/webhooks/stripe` (test).

Live Stripe must not be enabled until a TEST-mode acceptance pass succeeds. Setting live keys in Production does nothing until `PAYMENT_GATEWAY_TYPE=stripe` is also set there.

Do not put both live and test secret keys in the same Vercel environment.
