'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { getPaymentMethod } from '../../../data/payment';
import { PaymentInstructions } from '../../../components/PaymentInstructions';
import { trackEvent } from '../../../lib/analytics';

function Confirmation() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  // Read authoritative totals from sessionStorage (set on checkout success)
  const storedOrder = typeof window !== 'undefined' ? 
    JSON.parse(sessionStorage.getItem(`vf_order_${orderId}`) || 'null') : null;
  
  const method = getPaymentMethod(searchParams.get('method'));
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
          ORDER REQUEST REGISTERED
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink">Thank you — your request has been logged.</h1>
        <p className="text-brand-steel text-sm font-sans">
          Order Reference: <span className="text-brand-ink font-mono font-bold">{orderId}</span>
        </p>
      </div>

      {/* Payment instructions for the selected method */}
      {method && total > 0 && (
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
          <span className="text-brand-mineral font-bold">Received / Under Procurement Review</span>
        </div>
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
          <span className="text-brand-steel">Next Step:</span>
          <span className="text-brand-ink font-medium">Send payment via chosen method &bull; We confirm and dispatch</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-brand-steel">Typical Confirmation:</span>
          <span className="text-brand-graphite font-bold">Within 12 business hours</span>
        </div>
      </div>

      <p className="text-xs text-brand-steel font-sans">
        A confirmation email has been dispatched. No credit card is charged on this site. All materials are supplied strictly for laboratory research use only.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <button
          onClick={() => router.push('/catalog')}
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-graphite text-brand-paper font-display font-bold text-xs shadow-xs flex items-center justify-center space-x-2 transition-all"
        >
          <span>Return to Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => router.push('/verify')}
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brand-paper border border-brand-border text-brand-ink font-display font-bold text-xs hover:bg-brand-surface-muted transition-all flex items-center justify-center space-x-2 shadow-2xs"
        >
          <ShieldCheck className="w-4 h-4 text-brand-accent" />
          <span>Lookup Batch COA</span>
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
