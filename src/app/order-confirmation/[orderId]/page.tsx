'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, ShieldCheck, Download, Package, ArrowRight } from 'lucide-react';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  return (
    <div className="pt-32 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
      
      <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400 w-20 h-20 mx-auto flex items-center justify-center border border-emerald-500/30">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="mono-tag text-xs text-emerald-400 font-bold tracking-widest uppercase">ORDER CONFIRMED</span>
        <h1 className="font-display text-4xl font-extrabold text-white">Thank you for your purchase.</h1>
        <p className="text-slate-400 text-sm font-mono">
          Order Reference: <span className="text-cyan-400 font-bold">{orderId}</span>
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/10 text-left space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-slate-400">Order Status:</span>
          <span className="text-emerald-400 font-bold">CONFIRMED / PREPARING COLD PACKAGING</span>
        </div>
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-slate-400">Dispatch Window:</span>
          <span className="text-white">Within 24 Hours (-20°C Cold Storage)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Batch COA Documents:</span>
          <span className="text-cyan-400 font-bold">PDF COA Attached to Order Record</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
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
