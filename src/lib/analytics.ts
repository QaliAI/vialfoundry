import { track } from '@vercel/analytics';

/**
 * Complete purchase-funnel instrumentation for Vial Foundry.
 *
 * Events are designed to track full-funnel drop-off without transmitting
 * PII (names, emails, street addresses, card details, phone numbers).
 */
export type FunnelEvent =
  | 'catalog_viewed'
  | 'catalog_filtered'
  | 'product_viewed'
  | 'add_to_cart'
  | 'cart_viewed'
  | 'checkout_started'
  | 'promo_applied'
  | 'payment_started'
  | 'purchase_completed'
  | 'payment_completed' // Legacy alias preserved for backward compatibility
  | 'payment_failed'
  | 'newsletter_signup'
  | 'documentation_viewed'
  | 'documentation_requested'
  | 'bulk_inquiry'
  | 'affiliate_application'
  | 'lot_searched'
  | 'order_submitted'
  | 'order_confirmed';

type Props = Record<string, string | number | boolean | null>;

const SENSITIVE_KEYS = new Set([
  'email',
  'customeremail',
  'name',
  'customername',
  'firstname',
  'lastname',
  'phone',
  'customerphone',
  'address',
  'address2',
  'street',
  'shippingaddress',
  'city',
  'zip',
  'card',
  'cardnumber',
  'password',
]);

export function sanitizeAnalyticsProps(props?: Props): Props | undefined {
  if (!props) return undefined;
  const safe: Props = {};
  for (const [key, value] of Object.entries(props)) {
    if (!SENSITIVE_KEYS.has(key.toLowerCase().replace(/[^a-z]/g, ''))) {
      safe[key] = value;
    }
  }
  return safe;
}

/** Fire-and-forget. Analytics must never break a purchase or browsing flow. */
export function trackEvent(event: FunnelEvent, props?: Props): void {
  try {
    const cleanProps = sanitizeAnalyticsProps(props);
    track(event, cleanProps);
  } catch {
    /* no-op: a failed analytics beacon must never interrupt the customer flow */
  }
}
