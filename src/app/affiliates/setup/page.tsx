'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

function AffiliateSetupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/affiliates/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Failed to complete account setup.');
      }

      router.push('/affiliates/portal');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Setup error.');
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
            <span>Account Activation</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-ink tracking-tight">
            Set Your Partner Password
          </h1>
          <p className="text-xs text-brand-steel">
            Welcome to the Vial Foundry Partner Program. Create a secure password to access your referral dashboard.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-sans text-brand-danger">
              {error}
            </div>
          )}

          {!token ? (
            <div className="text-center py-6 text-xs text-brand-danger font-sans">
              Missing setup token. Please check your invitation email link.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-sans text-brand-ink font-semibold">New Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-sans text-brand-ink font-semibold">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-ink hover:bg-brand-graphite disabled:opacity-50 text-brand-paper font-sans text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Activating Account...' : 'Set Password & Enter Portal'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AffiliateSetupPage() {
  return (
    <Suspense fallback={<div className="pt-32 pb-24 text-center text-xs font-mono">Loading setup...</div>}>
      <AffiliateSetupInner />
    </Suspense>
  );
}
