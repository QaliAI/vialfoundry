# Vial Foundry — Analytics Event Taxonomy & Funnel Specification

This document specifies all client-side and checkout funnel events instrumented in Vial Foundry.

## Privacy & PII Policy
Strict customer privacy is enforced at the instrumentation boundary in `src/lib/analytics.ts`.
- **NO PII** is transmitted (no names, emails, street addresses, phone numbers, or credit card details).
- All properties are sanitized against sensitive field keys before dispatch to `@vercel/analytics`.

---

## Funnel Events Reference

| Event Name | Trigger Point | Component / Route | Payload Properties | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `catalog_viewed` | Catalog page loaded | `src/views/CatalogPage.tsx` | `category` (string) | Baseline top of funnel |
| `catalog_filtered` | Filter or category pill clicked | `src/views/CatalogPage.tsx` | `category`, `documentation` | Tracks merchandising engagement |
| `product_viewed` | Public PDP loaded | `src/views/ProductDetailPage.tsx` | `productId`, `category`, `price`, `documentation`, `inStock` | Product discovery |
| `add_to_cart` | Add to Cart clicked | `ProductCard.tsx`, `ProductDetailPage.tsx` | `productId`, `price`, `quantity`, `source`, `documentation` | Sources: `product_card`, `product_detail`, `mobile_sticky_bar` |
| `cart_viewed` | Cart drawer opened | `src/components/CartDrawer.tsx` | `totalItems`, `subtotalCents` | Drawer open trigger |
| `checkout_started` | Checkout page mounted with items | `src/app/checkout/page.tsx` | `items` (count), `subtotal` | Funnel progression |
| `promo_applied` | Valid promo code applied | `src/app/checkout/page.tsx` | `code`, `discountCents` | Promo usage tracking |
| `payment_started` | User proceeds to Stripe or submits order | `src/app/checkout/page.tsx` | `items`, `totalCents`, `provider` | Dispatched right before Stripe redirect or order submit |
| `purchase_completed` | Server confirms order as paid | `src/app/order-confirmation/[orderId]/page.tsx` | `orderId`, `totalCents`, `provider` | **Deduplicated** via `sessionStorage` (`vf_purchase_tracked_${orderId}`) to avoid double-counting on refresh |
| `payment_failed` | Checkout canceled or API failure | `src/app/checkout/page.tsx` | `reason` (string) | Tracks Stripe cancels (`canceled=1`) and API errors |
| `newsletter_signup` | Confirmed newsletter subscription | `src/components/Footer.tsx` | `source` (`footer_form`) | Fires only on confirmed 200 server response |
| `documentation_viewed` | COA certificate modal opened | `ProductDetailPage.tsx` | `productId`, `source` | Trust architecture engagement |
| `documentation_requested` | "Ask About Documents" or contact support clicked | `ProductDetailPage.tsx`, `ProductTabs.tsx` | `productId`, `lot`, `source` | Demand signal for missing batch certificates |
| `bulk_inquiry` | Contact / bulk inquiry submitted | `src/views/ContactPage.tsx` | `subject`, `hasInstitution` (boolean) | B2B / Institutional pipeline |
| `affiliate_application` | Affiliate partner application submitted | `src/views/AffiliatesPage.tsx` | `payoutMethod` | Partner pipeline tracking |

---

## Authoritative Payment Completion & Deduplication
To guarantee analytics metrics match revenue reality:
1. `purchase_completed` fires only when `/api/orders/[orderNumber]/status` returns `paid: true`.
2. A sessionStorage deduplication flag (`vf_purchase_tracked_${orderId}`) prevents duplicate event beacons on page refresh or subsequent navigation back to the confirmation screen.
