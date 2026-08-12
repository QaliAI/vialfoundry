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

export function getPaymentAdapter(): PaymentAdapter {
  const gatewayType = process.env.PAYMENT_GATEWAY_TYPE || 'sandbox';
  
  switch (gatewayType) {
    case 'sandbox':
    default:
      return new SandboxPaymentAdapter();
  }
}
