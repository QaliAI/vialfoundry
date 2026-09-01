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
    <div className="p-5 rounded-2xl bg-brand-canvas border border-brand-border space-y-4">
      <div className="flex items-center space-x-2">
        <span className="text-[11px] font-sans font-semibold text-brand-metal uppercase tracking-wider">
          Currently Out of Stock
        </span>
      </div>
      <p className="text-xs text-brand-steel font-normal leading-relaxed">
        This reference standard is currently in production. Enter your institutional email to be notified when a new lot of <span className="font-semibold text-brand-ink">{product.name}</span> is archived and available.
      </p>

      {status === 'done' ? (
        <div className="p-3 rounded-xl bg-brand-paper border border-brand-border text-brand-mineral text-xs font-sans flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-brand-accent" />
          <span>You have been added to the notification list for this lot.</span>
        </div>
      ) : (
        <form onSubmit={submit} className="flex items-center space-x-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your institutional email..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-brand-paper border border-brand-border text-brand-ink placeholder-brand-steel text-xs font-sans focus:outline-none focus:border-brand-graphite"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-5 py-2.5 rounded-xl bg-brand-primary text-brand-paper font-display font-bold text-xs hover:bg-brand-graphite transition-all flex items-center space-x-1.5 disabled:opacity-60 shadow-2xs"
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
        <p className="text-[11px] font-sans text-brand-danger">
          Unable to submit notification request. Please contact support@vialfoundry.com.
        </p>
      )}
    </div>
  );
};
