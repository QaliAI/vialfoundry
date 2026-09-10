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

  async createPaymentSession(req: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    const session = await this.stripe.checkout.sessions.create(
      {
        mode: 'payment',
        customer_email: req.customerEmail,
        client_reference_id: req.orderId,
        // Server-authoritative pricing: line items are built from the order the
        // server already priced, never from client-supplied amounts.
        line_items: req.items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: req.currency.toLowerCase(),
            unit_amount: Math.round(item.unitPrice * 100),
            product_data: { name: item.name },
          },
        })),
        metadata: {
          orderId: req.orderId,
          orderNumber: req.orderNumber,
        },
        payment_intent_data: {
          metadata: { orderId: req.orderId, orderNumber: req.orderNumber },
        },
        success_url: `${siteUrl()}/order-confirmation/${req.orderId}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl()}/checkout?canceled=1`,
      },
      // Stripe de-duplicates retries of the same order.
      { idempotencyKey: `checkout:${req.orderId}` },
    );

    return {
      sessionId: session.id,
      redirectUrl: session.url ?? undefined,
      clientSecret: session.client_secret ?? undefined,
      status: 'created',
      gateway: 'stripe',
    };
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
