'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AffiliateLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/affiliates/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Invalid credentials.');
      }

      router.push(data.redirect || '/affiliates/portal');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-brand-canvas px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-surface-muted border border-brand-border text-[11px] font-mono text-brand-steel uppercase tracking-wider">
            <Lock className="w-3 h-3 text-brand-accent" />
            <span>Partner Operating System</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-ink tracking-tight">
            Affiliate Portal Login
          </h1>
          <p className="text-xs text-brand-steel">
            Sign in to view your referral attribution, live commission metrics, and payout status.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-sans text-brand-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-sans text-brand-ink font-semibold">Partner Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="partner@domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-sans text-brand-ink font-semibold">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-ink hover:bg-brand-graphite disabled:opacity-50 text-brand-paper font-sans text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-4 border-t border-brand-border/60 text-center space-y-2">
            <p className="text-xs text-brand-steel">
              Don’t have an approved affiliate account yet?
            </p>
            <Link
              href="/affiliates"
              className="inline-block text-xs font-semibold text-brand-ink hover:underline"
            >
              Apply to the Partner Program →
            </Link>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-brand-paper border border-brand-border text-[11px] font-sans text-brand-steel leading-relaxed flex items-start space-x-2">
          <ShieldCheck className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
          <span>
            Strict zero-PII architecture: partner portals report aggregated order counts and revenue attribution only. Customer identities remain private.
          </span>
        </div>
      </div>
    </div>
  );
}
