'use client';

import { Product } from '@/types';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __vfGaInitialized?: boolean;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

/**
 * Initializes Google Analytics 4 only if measurement ID is configured.
 */
export function initializeGa(): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || window.__vfGaInitialized) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function (...args: unknown[]) {
      window.dataLayer?.push(args);
    };

  window.__vfGaInitialized = true;
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
    allow_google_signals: false,
  });
}

/**
 * Sends a generic GA4 event if configured, guarding strictly against PII keys.
 */
export function sendGaEvent(eventName: string, parameters: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;

  initializeGa();
  if (!window.gtag) return;

  // Sanitize PII
  const cleanParams: Record<string, unknown> = {};
  const prohibitedKeys = ['email', 'phone', 'address', 'customer_name', 'name', 'password'];

  for (const [key, val] of Object.entries(parameters)) {
    if (!prohibitedKeys.includes(key.toLowerCase())) {
      cleanParams[key] = val;
    }
  }

  window.gtag('event', eventName, cleanParams);
}

// -------------------------------------------------------------
// STANDARD GA4 ECOMMERCE HELPERS
// -------------------------------------------------------------

export function gaFormatProduct(product: Product, quantity = 1) {
  return {
    item_id: product.sku || product.id,
    item_name: product.displayName || product.name,
    item_category: product.category,
    item_variant: product.displaySize || product.size,
    price: product.price,
    quantity,
  };
}

export function trackViewItemList(products: Product[]): void {
  sendGaEvent('view_item_list', {
    item_list_id: 'catalog_view',
    item_list_name: 'Catalog Products',
    items: products.slice(0, 20).map((p) => gaFormatProduct(p)),
  });
}

export function trackSelectItem(product: Product): void {
  sendGaEvent('select_item', {
    item_list_name: 'Catalog Products',
    items: [gaFormatProduct(product)],
  });
}

export function trackViewItem(product: Product): void {
  sendGaEvent('view_item', {
    currency: 'USD',
    value: product.price,
    items: [gaFormatProduct(product)],
  });
}

export function trackAddToCart(product: Product, quantity = 1): void {
  sendGaEvent('add_to_cart', {
    currency: 'USD',
    value: product.price * quantity,
    items: [gaFormatProduct(product, quantity)],
  });
}

export function trackViewCart(items: Array<{ product: Product; quantity: number }>, subtotal: number): void {
  sendGaEvent('view_cart', {
    currency: 'USD',
    value: subtotal,
    items: items.map((i) => gaFormatProduct(i.product, i.quantity)),
  });
}

export function trackBeginCheckout(items: Array<{ product: Product; quantity: number }>, total: number): void {
  sendGaEvent('begin_checkout', {
    currency: 'USD',
    value: total,
    items: items.map((i) => gaFormatProduct(i.product, i.quantity)),
  });
}

export function trackAddShippingInfo(shippingTier: string, amount: number): void {
  sendGaEvent('add_shipping_info', {
    currency: 'USD',
    value: amount,
    shipping_tier: shippingTier,
  });
}

/**
 * Tracks authoritative purchase event with strict deduplication and zero PII.
 */
export function trackPurchase(params: {
  orderNumber: string;
  total: number;
  subtotal: number;
  shipping: number;
  discount?: number;
  promoCode?: string | null;
  items: Array<{ sku?: string | null; name: string; quantity: number; price: number }>;
}): boolean {
  if (typeof window === 'undefined') return false;

  const dedupKey = `vf_purchased_${params.orderNumber}`;
  try {
    if (sessionStorage.getItem(dedupKey)) {
      // Already tracked in this session
      return false;
    }
    sessionStorage.setItem(dedupKey, '1');
  } catch {}

  sendGaEvent('purchase', {
    transaction_id: params.orderNumber,
    value: params.total,
    currency: 'USD',
    shipping: params.shipping,
    discount: params.discount || 0,
    coupon: params.promoCode || undefined,
    items: params.items.map((i) => ({
      item_id: i.sku || i.name,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  });

  return true;
}

// -------------------------------------------------------------
// VIAL-SPECIFIC EVENTS
// -------------------------------------------------------------

export function trackPromoApplied(code: string, discountAmount: number): void {
  sendGaEvent('promo_applied', {
    coupon: code,
    discount_value: discountAmount,
  });
}

export function trackAffiliateApplication(): void {
  sendGaEvent('affiliate_application', {
    source: 'portal',
  });
}

export function trackDocumentationRequested(lotNumber: string): void {
  sendGaEvent('documentation_requested', {
    lot_number: lotNumber,
  });
}

export function trackNewsletterSignup(source = 'footer'): void {
  sendGaEvent('newsletter_signup', {
    signup_source: source,
  });
}

export function trackBulkInquiry(productsCount: number): void {
  sendGaEvent('bulk_inquiry', {
    products_count: productsCount,
  });
}
