import Stripe from 'stripe';
import type {
  PaymentAdapter,
  PaymentSessionRequest,
  PaymentSessionResponse,
  PaymentVerificationResult,
} from './paymentAdapter';

/**
 * Stripe Checkout adapter.
 *
 * Gated: this is only ever selected when PAYMENT_GATEWAY_TYPE=stripe AND every
 * required credential is present (see `isStripeConfigured`). Until the merchant
 * account exists, the storefront stays on the manual/invoice flow and Stripe is
 * never exposed to customers.
 *
 * Required environment:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
 */

// The gating rule lives in a dependency-free module so it can be unit-tested
// without the Stripe SDK. Re-exported here for ergonomic imports.
export {
  STRIPE_ENV_KEYS,
  missingStripeEnv,
  isStripeConfigured,
  isStripeEnabled,
} from './stripe-gating.mjs';

import { buildStripeCheckoutAmounts, assertStripeTotalMatches } from './stripe-amounts.mjs';

/** A server-authoritative order ready to be charged. */
export interface StripeOrderCheckout {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  currency: string;
  /** Server-validated catalogue lines (unit_price_amount in cents). */
  items: Array<{
    productName: string;
    displayName?: string | null;
    sku?: string | null;
    quantity: number;
    unit_price_amount: number;
  }>;
  /** Output of recalculateInvoice(). */
  invoice: {
    subtotal_before_discount: number;
    discount_amount: number;
    shipping_amount: number;
    tax_amount: number;
    total_amount: number;
    promo_code?: string | null;
    pricingPending?: boolean;
  };
  shippingLabel?: string;
  promoCode?: string | null;
  affiliateCode?: string | null;
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://vialfoundry.com').replace(/\/$/, '');
}

export class StripePaymentAdapter implements PaymentAdapter {
  private readonly stripe: Stripe;

  constructor(secretKey = process.env.STRIPE_SECRET_KEY) {
    if (!secretKey) {
      throw new Error('StripePaymentAdapter requires STRIPE_SECRET_KEY.');
    }
    this.stripe = new Stripe(secretKey);
  }

  /**
   * Legacy adapter entry point. Product-only line items cannot reproduce
   * shipping or discounts, so charging through this path would bill the wrong
   * amount. Use `createOrderCheckoutSession` instead.
   */
  async createPaymentSession(_req: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    throw new Error(
      'StripePaymentAdapter.createPaymentSession is not supported: it cannot represent shipping or discounts. ' +
        'Use createOrderCheckoutSession(order) so the charge equals the server-authoritative total.',
    );
  }

  /**
   * Creates a Checkout Session whose amount_total is guaranteed equal to the
   * server's order total. The amount is built from the server invoice, and the
   * session Stripe returns is verified before we hand the customer to it.
   */
  async createOrderCheckoutSession(order: StripeOrderCheckout): Promise<{
    sessionId: string;
    url: string;
    amountTotal: number;
  }> {
    const { line_items, discountCents, expectedTotalCents } = buildStripeCheckoutAmounts({
      items: order.items,
      invoice: order.invoice,
      currency: order.currency,
      shippingLabel: order.shippingLabel || 'Shipping',
    });

    // Stripe has no negative line items; a discount becomes a one-off coupon.
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
    if (discountCents > 0) {
      const coupon = await this.stripe.coupons.create(
        {
          amount_off: discountCents,
          currency: order.currency.toLowerCase(),
          duration: 'once',
          name: order.promoCode ? `Discount (${order.promoCode})` : 'Order discount',
          metadata: { orderId: order.orderId, orderNumber: order.orderNumber },
        },
        { idempotencyKey: `coupon:${order.orderId}` },
      );
      discounts = [{ coupon: coupon.id }];
    }

    const session = await this.stripe.checkout.sessions.create(
      {
        mode: 'payment',
        line_items,
        discounts,
        customer_email: order.customerEmail,
        client_reference_id: order.orderId,
        metadata: {
          orderId: order.orderId,
          orderNumber: order.orderNumber,
          promoCode: order.promoCode || '',
          affiliateCode: order.affiliateCode || '',
          serverTotalCents: String(order.invoice.total_amount),
        },
        payment_intent_data: {
          description: `Vial Foundry order ${order.orderNumber}`,
          metadata: {
            orderId: order.orderId,
            orderNumber: order.orderNumber,
            serverTotalCents: String(order.invoice.total_amount),
          },
        },
        success_url: `${siteUrl()}/order-confirmation/${order.orderNumber}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl()}/checkout?canceled=1`,
      },
      { idempotencyKey: `checkout:${order.orderId}` },
    );

    // Verify what Stripe actually built rather than trusting our own inputs.
    assertStripeTotalMatches(session.amount_total ?? -1, expectedTotalCents);

    if (!session.url) {
      throw new Error('[stripe] Checkout Session created without a redirect URL');
    }

    return { sessionId: session.id, url: session.url, amountTotal: session.amount_total ?? 0 };
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerificationResult> {
    const session = await this.stripe.checkout.sessions.retrieve(transactionId);
    const paid = session.payment_status === 'paid';
    return {
      success: paid,
      transactionId,
      orderId: session.client_reference_id || session.metadata?.orderId || '',
      amount: (session.amount_total ?? 0) / 100,
      paymentStatus: paid ? 'paid' : 'unpaid',
      gatewayResponse: {
        paymentStatus: session.payment_status,
        status: session.status,
        currency: session.currency,
      },
    };
  }

  async capturePayment(transactionId: string, amount: number): Promise<boolean> {
    const intent = await this.stripe.paymentIntents.capture(transactionId, {
      amount_to_capture: Math.round(amount * 100),
    });
    return intent.status === 'succeeded';
  }

  async refundPayment(transactionId: string, amount: number): Promise<boolean> {
    const refund = await this.stripe.refunds.create({
      payment_intent: transactionId,
      amount: Math.round(amount * 100),
    });
    return refund.status === 'succeeded' || refund.status === 'pending';
  }

  /**
   * Verifies the Stripe signature and returns the typed event. Throws on any
   * signature failure — nothing in the payload is trusted before this passes.
   * `payload` must be the raw request body, not parsed JSON.
   */
  constructEvent(payload: string | Buffer, signature: string): Stripe.Event {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured.');
    }
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }

  /** Retrieves a Checkout Session (used by the confirmation page, read-only). */
  async getCheckoutSession(sessionId: string) {
    return this.stripe.checkout.sessions.retrieve(sessionId);
  }

  /**
   * Issues a refund against the order's payment intent. Amount in cents; omit
   * for a full refund. The resulting `charge.refunded` webhook is what updates
   * order state, so this method never writes order records itself.
   */
  async refundPaymentIntent(paymentIntentId: string, amountCents?: number) {
    return this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      ...(amountCents ? { amount: amountCents } : {}),
    });
  }

  /**
   * Verifies the Stripe signature before trusting anything in the payload.
   * `payload` must be the raw request body string, not parsed JSON.
   */
  async handleWebhook(payload: string | Buffer, signature: string) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured.');
    }

    const event = this.stripe.webhooks.constructEvent(payload, signature, secret);

    let orderId = '';
    let status = 'pending';

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        orderId = session.client_reference_id || session.metadata?.orderId || '';
        status = session.payment_status === 'paid' ? 'paid' : 'pending';
        break;
      }
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        orderId = intent.metadata?.orderId || '';
        status = 'paid';
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        orderId = intent.metadata?.orderId || '';
        status = 'failed';
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        orderId = charge.metadata?.orderId || '';
        status = 'refunded';
        break;
      }
      default:
        break;
    }

    return { event: event.type, orderId, status };
  }
}
