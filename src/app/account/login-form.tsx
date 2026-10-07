'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react';

export function CustomerLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/customer/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send verification code.');
      }

      setStep('code');
      setMessage(`We emailed a 6-digit code to ${email}.`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/customer/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid verification code.');
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-brand-canvas px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-surface-muted border border-brand-border text-[11px] font-mono text-brand-steel uppercase tracking-wider">
            <Mail className="w-3 h-3 text-brand-accent" />
            <span>Optional Research Account</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-ink tracking-tight">
            Sign In to Your Account
          </h1>
          <p className="text-xs text-brand-steel">
            Access your past order history, tracking details, and fast reorder. Passwordless and instant.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-sans text-brand-danger">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-sans text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-sans text-brand-ink font-semibold">Your Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="researcher@lab.org"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-ink hover:bg-brand-graphite disabled:opacity-50 text-brand-paper font-sans text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Sending Code...' : 'Send Sign-In Code'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-sans text-brand-ink font-semibold">6-Digit Verification Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink font-mono text-center text-lg tracking-widest focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="px-3 py-2 rounded-xl bg-brand-canvas hover:bg-brand-border/40 text-xs font-sans text-brand-steel transition-colors"
                >
                  Change Email
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-ink hover:bg-brand-graphite disabled:opacity-50 text-brand-paper font-sans text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Verifying...' : 'Verify & Enter Account'}</span>
                  <KeyRound className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-brand-border/60 text-center">
            <p className="text-xs text-brand-steel">
              Accounts are optional. You can always checkout as a guest without an account.
            </p>
            <Link href="/catalog" className="inline-block mt-2 text-xs font-bold text-brand-ink hover:underline">
              Browse Research Catalog →
            </Link>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-brand-paper border border-brand-border text-[11px] font-sans text-brand-steel leading-relaxed flex items-start space-x-2">
          <ShieldCheck className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
          <span>
            Protected with single-use verification tokens. No passwords stored, zero third-party tracking cookies.
          </span>
        </div>
      </div>
    </div>
  );
}
