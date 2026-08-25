'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { getPaymentMethod } from '../../../data/payment';
import { PaymentInstructions } from '../../../components/PaymentInstructions';

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
  const subtotal = storedOrder 
    ? storedOrder.subtotalCents / 100 
    : null;
  const discount = storedOrder 
    ? storedOrder.discountCents / 100 
    : null;
  const shipping = storedOrder 
    ? storedOrder.shippingCents / 100 
    : null;
  const [copied, setCopied] = useState(false);

  const copyHandle = () => {
    if (method) {
      navigator.clipboard.writeText(method.handle);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="pt-32 pb-20 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
      <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400 w-20 h-20 mx-auto flex items-center justify-center border border-emerald-500/30">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="mono-tag text-xs text-emerald-400 font-bold tracking-widest uppercase">INQUIRY RECEIVED</span>
        <h1 className="font-display text-4xl font-extrabold text-white">Thank you — your request is in.</h1>
        <p className="text-slate-400 text-sm font-mono">
          Reference: <span className="text-cyan-400 font-bold">{orderId}</span>
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

      <div className="glass-panel p-6 rounded-2xl border border-white/10 text-left space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-slate-400">Status:</span>
          <span className="text-emerald-400 font-bold">RECEIVED / UNDER REVIEW</span>
        </div>
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-slate-400">Next Step:</span>
          <span className="text-white">Send payment, then we confirm &amp; ship</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Typical Response:</span>
          <span className="text-cyan-400 font-bold">Within 12 business hours</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 font-mono">
        A confirmation has been sent to your email. No card is charged on this site. All materials are
        supplied for research use only.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <button
          onClick={() => router.push('/catalog')}
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-cyan-500 text-slate-950 font-display font-bold text-xs hover:bg-cyan-400 transition-all flex items-center justify-center space-x-2"
        >
          <span>Return to Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => router.push('/verify')}
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 border border-white/15 text-slate-200 font-display font-bold text-xs hover:border-cyan-500/40 hover:text-cyan-300 transition-all flex items-center justify-center space-x-2"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Lookup Batch COA</span>
        </button>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-slate-400 font-mono">Loading…</div>}>
      <Confirmation />
    </Suspense>
  );
}
