# Vial Foundry — Production Readiness Checklist

Detailed summary of completed infrastructure, live deployment endpoints, and next operational steps.

---

## 1. Completed Components

- [x] **Next.js 14 App Router Architecture**: Full SSR, dynamic metadata, App Router routes, and serverless API endpoints.
- [x] **Database Schema & RLS Migrations**: `01_schema.sql`, `02_rls.sql`, and `seed.sql` prepared for Supabase deployment.
- [x] **Interactive Batch Verification Engine**: Real-time lot search, HTML5 Canvas HPLC chromatogram trace, and browser PDF COA exporter.
- [x] **Administrative Console (`/admin`)**: Dashboard, Products CRUD, Inventory Tracking, Batches & COAs Manager, Orders, Customers, Discounts, Affiliates, and Settings.
- [x] **Modular E-Commerce Adapters**: PaymentAdapter (Sandbox active), ShippingAdapter (Cold chain express), TaxAdapter, EmailAdapter.
- [x] **Large Media Exclusions**: `.gitignore` and `.vercelignore` properly configured to prevent bloating Git/Vercel repositories.
- [x] **GitHub Version Control**: Public repository `https://github.com/QaliAI/vialfoundry` initialized and pushed.
- [x] **Vercel Production Deployment**: Live Vercel deployment resolution at `https://vialfoundry-h9zxe82lt-qaliais-projects.vercel.app`.

---

## 2. Next Operational Steps for Client

1. **Supabase Environment Connection**:
   - Create dedicated Supabase project at `https://supabase.com`.
   - Run `01_schema.sql`, `02_rls.sql`, and `seed.sql` in Supabase SQL Editor.
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel Environment Settings.

2. **Merchant Payment Processor**:
   - Once merchant account underwriting is finalized, connect high-risk card or ACH gateway by implementing `PaymentAdapter`.

3. **Porkbun DNS Configuration**:
   - Enter A record (`76.76.21.21`) and CNAME record (`cname.vercel-dns.com`) in Porkbun DNS console for `vialfoundry.com`.
