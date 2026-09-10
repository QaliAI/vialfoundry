export interface PaymentSessionRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
  shippingAddress: any;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
}

export interface PaymentSessionResponse {
  sessionId: string;
  redirectUrl?: string;
  clientSecret?: string;
  status: 'created' | 'pending' | 'requires_action';
  gateway: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  transactionId: string;
  orderId: string;
  amount: number;
  paymentStatus: 'paid' | 'unpaid' | 'failed';
  gatewayResponse: any;
}

export interface PaymentAdapter {
  createPaymentSession(req: PaymentSessionRequest): Promise<PaymentSessionResponse>;
  verifyPayment(transactionId: string): Promise<PaymentVerificationResult>;
  capturePayment(transactionId: string, amount: number): Promise<boolean>;
  refundPayment(transactionId: string, amount: number): Promise<boolean>;
  handleWebhook(payload: any, signature: string): Promise<{ event: string; orderId: string; status: string }>;
}

/**
 * Sandbox/Test Payment Adapter implementation
 * Useful before a high-risk merchant account or custom gateway is configured.
 */
export class SandboxPaymentAdapter implements PaymentAdapter {
  async createPaymentSession(req: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    const sessionId = `PAY-SND-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    return {
      sessionId,
      redirectUrl: `/order-confirmation/${req.orderId}?session=${sessionId}`,
      status: 'created',
      gateway: 'Sandbox Test Adapter'
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerificationResult> {
    return {
      success: true,
      transactionId,
      orderId: 'ORD-' + transactionId.slice(-6),
      amount: 100.0,
      paymentStatus: 'paid',
      gatewayResponse: { message: 'Sandbox payment verified' }
    };
  }

  async capturePayment(transactionId: string, amount: number): Promise<boolean> {
    return true;
  }

  async refundPayment(transactionId: string, amount: number): Promise<boolean> {
    return true;
  }

  async handleWebhook(payload: any, signature: string) {
    return {
      event: 'payment_intent.succeeded',
      orderId: payload?.orderId || 'UNKNOWN',
      status: 'paid'
    };
  }
}

/**
 * Selects the active gateway.
 *
 * Stripe is only ever returned when it is explicitly selected, fully
 * credentialed, and the key mode matches this environment. A partially
 * configured or mismatched environment does NOT fall through to a fake
 * sandbox charge — checkout uses the configured manual-invoice path instead.
 * The sandbox adapter remains for isolated unit tests only.
 */
export function getPaymentAdapter(): PaymentAdapter {
  const gatewayType = process.env.PAYMENT_GATEWAY_TYPE || '';

  if (gatewayType === 'stripe') {
    // Required lazily so the SDK is never pulled into builds that do not use it.
    const { isStripeEnabled, StripePaymentAdapter, stripeConfigStatus } =
      require('./stripeAdapter') as typeof import('./stripeAdapter');

    if (isStripeEnabled()) {
      return new StripePaymentAdapter();
    }

    const status = stripeConfigStatus();
    console.warn(
      `[payments] PAYMENT_GATEWAY_TYPE=stripe but Stripe is not enabled ` +
        `(missing=[${status.missing.join(',')}] mismatch=[${status.mismatch.join(',')}] ` +
        `mode=${status.mode || 'none'} runtime=${status.runtime}). ` +
        'Card checkout stays disabled; the manual-invoice path is used if configured.',
    );
    throw new Error('Stripe is selected but not safely configured; refusing to charge.');
  }

  throw new Error(
    `No card payment adapter is active (PAYMENT_GATEWAY_TYPE=${gatewayType || 'unset'}). ` +
      'Use the manual-invoice checkout path.',
  );
}
