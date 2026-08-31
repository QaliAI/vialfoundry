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
    <div className="pt-32 pb-20 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center bg-[#FAFAF9]">
      <div className="p-4 rounded-full bg-emerald-50 text-emerald-700 w-20 h-20 mx-auto flex items-center justify-center border border-emerald-200 shadow-2xs">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs text-emerald-800 font-mono font-bold tracking-widest uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          ORDER REQUEST RECEIVED
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">Thank you — your request is registered.</h1>
        <p className="text-slate-600 text-sm font-mono">
          Reference Code: <span className="text-cyan-800 font-bold">{orderId}</span>
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

      <div className="storefront-card p-6 rounded-2xl bg-white border border-slate-200 text-left space-y-3 font-mono text-xs shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-slate-500">Status:</span>
          <span className="text-emerald-700 font-bold">RECEIVED / UNDER PROCUREMENT REVIEW</span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-slate-500">Next Step:</span>
          <span className="text-slate-900 font-medium">Send payment via chosen method &bull; We confirm and dispatch</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Typical Confirmation:</span>
          <span className="text-cyan-800 font-bold">Within 12 business hours</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 font-mono">
        A confirmation email has been dispatched. No card is charged on this site. All materials are
        supplied strictly for laboratory research use only.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <button
          onClick={() => router.push('/catalog')}
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-display font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all"
        >
          <span>Return to Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => router.push('/verify')}
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-display font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center space-x-2 shadow-2xs"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Lookup Batch COA</span>
        </button>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-slate-500 font-mono">Loading…</div>}>
      <Confirmation />
    </Suspense>
  );
}

