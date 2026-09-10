'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { getPaymentMethod } from '../../../data/payment';
import { PaymentInstructions } from '../../../components/PaymentInstructions';
import { trackEvent } from '../../../lib/analytics';

interface OrderStatus {
  paid: boolean;
  paymentStatus: string;
  paymentProvider: string;
  totalCents: number;
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  customerName: string;
  shippingAddress: Record<string, string>;
  items: Array<{ product_name: string; quantity: number; line_total_amount: number }>;
}

function Confirmation() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  // Read authoritative totals from sessionStorage (set on checkout success)
  const storedOrder = typeof window !== 'undefined' ? 
    JSON.parse(sessionStorage.getItem(`vf_order_${orderId}`) || 'null') : null;
  
  const stripeSessionId = searchParams.get('session_id');
  const method = getPaymentMethod(searchParams.get('method'));

  // Payment is confirmed by the server (which reflects the Stripe webhook),
  // never by the presence of a session_id in the URL.
  const [serverOrder, setServerOrder] = useState<OrderStatus | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(Boolean(stripeSessionId));

  useEffect(() => {
    if (!stripeSessionId) return;
    let cancelled = false;
    let attempts = 0;

    // The webhook can land a moment after the redirect, so poll briefly.
    const poll = async () => {
      attempts += 1;
      try {
        const res = await fetch(
          `/api/orders/${encodeURIComponent(orderId)}/status?session_id=${encodeURIComponent(stripeSessionId)}`,
        );
        if (res.ok) {
          const data = (await res.json()) as OrderStatus;
          if (cancelled) return;
          setServerOrder(data);
          if (data.paid) {
            setCheckingPayment(false);
            trackEvent('payment_completed', { orderId, totalCents: data.totalCents, provider: 'stripe' });
            return;
          }
        }
      } catch {
        /* transient: keep polling */
      }
      if (!cancelled && attempts < 10) {
        setTimeout(poll, 1500);
      } else if (!cancelled) {
        setCheckingPayment(false);
      }
    };
    poll();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stripeSessionId, orderId]);
  const total = storedOrder 
    ? storedOrder.totalCents / 100 
    : parseFloat(searchParams.get('total') || '0');
  const [copied, setCopied] = useState(false);

  // Funnel exit. Confirms the buyer actually reached payment instructions.
  useEffect(() => {
    trackEvent('order_confirmed', {
      orderId: orderId || null,
      paymentMethod: method?.id ?? null,
      total,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const copyHandle = () => {
    if (method) {
      navigator.clipboard.writeText(method.handle);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="pt-32 pb-20 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center bg-brand-canvas">
      <div className="p-4 rounded-full bg-brand-paper text-brand-mineral w-20 h-20 mx-auto flex items-center justify-center border border-brand-border shadow-2xs">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs text-brand-mineral font-sans font-bold tracking-widest uppercase bg-brand-paper px-3 py-1 rounded-full border border-brand-border">
          {checkingPayment ? 'CONFIRMING PAYMENT' : serverOrder?.paid ? 'PAYMENT RECEIVED' : 'ORDER RECEIVED'}
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink">
          {serverOrder?.paid ? 'Thank you — your payment went through.' : 'Thank you — we’ve got your order.'}
        </h1>
        <p className="text-brand-steel text-sm font-sans">
          Order Reference: <span className="text-brand-ink font-mono font-bold">{orderId}</span>
        </p>
      </div>

      {stripeSessionId && checkingPayment && (
        <div className="storefront-card p-5 rounded-2xl bg-brand-paper border border-brand-border text-sm text-brand-steel">
          Confirming your payment with our payment provider&hellip; this usually takes a few seconds.
        </div>
      )}

      {stripeSessionId && !checkingPayment && !serverOrder?.paid && (
        <div className="storefront-card p-5 rounded-2xl bg-brand-paper border border-brand-border text-sm text-brand-steel text-left space-y-2">
          <p className="font-semibold text-brand-ink">We haven&rsquo;t seen the payment confirmation yet.</p>
          <p>
            If you completed payment, it can take a minute to reach us and no further action is
            needed &mdash; we&rsquo;ll email you as soon as it lands. If you were not charged, nothing has
            been taken. Contact support with order {orderId} if anything looks wrong.
          </p>
        </div>
      )}

      {serverOrder?.paid && (
        <div className="storefront-card p-6 rounded-2xl bg-brand-paper border border-brand-border text-left space-y-3 shadow-2xs">
          <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-brand-steel">Order summary</div>
          {serverOrder.items.map((li, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-brand-ink">{li.product_name} &times; {li.quantity}</span>
              <span className="text-brand-ink font-medium">${(li.line_total_amount / 100).toFixed(2)}</span>
            </div>
          ))}
          <div className="pt-3 border-t border-brand-border/60 space-y-1.5 text-sm">
            {serverOrder.discountCents > 0 && (
              <div className="flex justify-between text-brand-mineral">
                <span>Discount</span><span>&minus;${(serverOrder.discountCents / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-brand-steel">
              <span>Shipping</span>
              <span>{serverOrder.shippingCents === 0 ? 'Included' : `$${(serverOrder.shippingCents / 100).toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-display font-bold text-brand-ink text-base pt-1">
              <span>Paid</span><span>${(serverOrder.totalCents / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment instructions for the selected method (manual orders only) */}
      {!stripeSessionId && method && total > 0 && (
        <PaymentInstructions
          method={method}
          total={total}
          orderRef={orderId}
          onCopyHandle={copyHandle}
          copied={copied}
        />
      )}

      <div className="storefront-card p-6 rounded-2xl bg-brand-paper border border-brand-border text-left space-y-3 font-sans text-xs shadow-2xs">
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
          <span className="text-brand-steel">Status:</span>
          <span className="text-brand-mineral font-bold">
            {serverOrder?.paid ? 'Paid — preparing your order' : 'Received — we’re checking stock'}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
          <span className="text-brand-steel">Next Step:</span>
          <span className="text-brand-ink font-medium">
            {serverOrder?.paid ? 'We pack and ship — you’ll get tracking by email' : 'Send payment • We confirm and ship'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-brand-steel">Usually confirmed:</span>
          <span className="text-brand-graphite font-bold">Within 12 business hours</span>
        </div>
      </div>

      <p className="text-xs text-brand-steel font-sans">
        A confirmation email is on its way to the address you provided. No credit card is charged on this site. All products are supplied strictly for laboratory research use only.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <button
          onClick={() => router.push('/catalog')}
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-display font-bold text-xs shadow-xs flex items-center justify-center space-x-2 transition-all"
        >
          <span>Keep Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => router.push('/quality')}
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brand-paper border border-brand-border text-brand-ink font-display font-bold text-xs hover:bg-brand-surface-muted transition-all flex items-center justify-center space-x-2 shadow-2xs"
        >
          <ShieldCheck className="w-4 h-4 text-brand-accent" />
          <span>How We Handle Quality</span>
        </button>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-brand-steel font-sans">Loading...</div>}>
      <Confirmation />
    </Suspense>
  );
}
