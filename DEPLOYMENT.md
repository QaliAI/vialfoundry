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
In Vercel Domain settings, set `vialfoundry.com` as the canonical domain and redirect `www.vialfoundry.com` to `vialfoundry.com`.
