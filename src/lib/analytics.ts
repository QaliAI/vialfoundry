import { track } from '@vercel/analytics';

/**
 * Purchase-funnel instrumentation.
 *
 * Traffic is currently too low for meaningful A/B testing, so these events exist to
 * establish a baseline and show where the funnel leaks — not to prove a hypothesis.
 * Event names are stable; treat them as a schema.
 */
export type FunnelEvent =
  | 'catalog_viewed'
  | 'catalog_filtered'
  | 'product_viewed'
  | 'documentation_viewed'
  | 'documentation_requested'
  | 'lot_searched'
  | 'add_to_cart'
  | 'checkout_started'
  | 'order_submitted'
  | 'order_confirmed';

type Props = Record<string, string | number | boolean | null>;

/** Fire-and-forget. Analytics must never break a purchase path. */
export function trackEvent(event: FunnelEvent, props?: Props): void {
  try {
    track(event, props);
  } catch {
    /* no-op: a failed beacon must not interrupt the funnel */
  }
}
