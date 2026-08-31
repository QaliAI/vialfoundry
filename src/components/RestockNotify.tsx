'use client';

import React, { useState } from 'react';
import { BellRing, CheckCircle2, Loader2 } from 'lucide-react';
import { Product } from '../types';

export const RestockNotify: React.FC<{ product: Product }> = ({ product }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, productId: product.id, productName: product.name }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-4">
      <div className="flex items-center space-x-2">
        <span className="text-[11px] font-mono font-bold text-amber-800 uppercase tracking-wider">
          Currently Out of Stock
        </span>
      </div>
      <p className="text-xs text-slate-600 font-normal">
        This lot is being re-manufactured and independently re-tested. Enter your email to be notified the moment a
        new verified lot of <span className="font-semibold text-slate-900">{product.name}</span> is available.
      </p>

      {status === 'done' ? (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>You&apos;re on the list. We&apos;ll notify you when this lot returns.</span>
        </div>
      ) : (
        <form onSubmit={submit} className="flex items-center space-x-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your institutional email..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs font-mono focus:outline-none focus:border-amber-600"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-5 py-2.5 rounded-xl bg-amber-600 text-white font-display font-bold text-xs hover:bg-amber-700 transition-all flex items-center space-x-1.5 disabled:opacity-60 shadow-2xs"
          >
            {status === 'loading' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <BellRing className="w-3.5 h-3.5" />
            )}
            <span>Notify Me</span>
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="text-[11px] font-mono text-red-600">
          Something went wrong. Please email support@vialfoundry.com.
        </p>
      )}
    </div>
  );
};

