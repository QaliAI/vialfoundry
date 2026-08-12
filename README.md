# Vial Foundry — Production Ecommerce & Verification Platform

Official Next.js 14 App Router full-stack web application for **Vial Foundry** (`VialFoundry.com`).

> **Precision-built research materials.**

---

## 1. Architecture Overview

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS + Custom Dark Industrial Design System
- **Database & Auth**: Dedicated Supabase Postgres Instance (RLS Security Policies)
- **Deployment**: Vercel Serverless & Edge Engine
- **Modular Adapters**:
  - `PaymentAdapter`: Pluggable merchant gateway (Sandbox / Stripe / AuthNet / NMI)
  - `ShippingAdapter`: Flat-rate & free shipping thresholds
  - `TaxAdapter`: Custom tax calculation interface
  - `EmailAdapter`: Resend transactional email integration
- **Batch Verification Engine**: Interactive HTML5 Canvas HPLC chromatograms & PDF COA report exporter

---

## 2. Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Open browser at http://localhost:3000
```

---

## 3. Environment Variables

Create `.env.local` based on `.env.example`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Payment Adapter
PAYMENT_GATEWAY_TYPE=sandbox
PAYMENT_API_KEY=your-api-key

# Transactional Email
RESEND_API_KEY=re_your_key
TRANSACTIONAL_EMAIL_FROM=support@vialfoundry.com
NOTIFICATION_EMAIL_TO=admin@vialfoundry.com

# Site URL
NEXT_PUBLIC_SITE_URL=https://vialfoundry.com
```

---

## 4. Supabase Database Setup & Migrations

Database migration files are located in `supabase/migrations/`:
- `supabase/migrations/01_schema.sql`: Table definitions & relations
- `supabase/migrations/02_rls.sql`: Row Level Security policies
- `supabase/seed.sql`: Initial seed data for products, categories, batches, and discount codes

---

## 5. Administrative Console (`/admin`)

- URL: `/admin` (Login at `/admin/login`)
- Default Admin Credentials: `admin@vialfoundry.com` / `foundry2026`
- Key Admin Features:
  - Dashboard Metrics (Active Products, COA Documents, Low Stock Alerts)
  - Products CRUD
  - Inventory Stock Adjustments & Transaction History Log
  - Batches & COA Upload Manager (Powers public `/verify` engine)
  - Orders & Fulfillment Management
  - Customer & Email Subscriber Lists
  - Discount Code CRUD
  - Affiliate & Referral Code Tracking
  - Central System Settings
