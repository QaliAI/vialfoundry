'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '../../../components/BrandLogo';
import { Suspense } from 'react';

function AdminLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromLink = searchParams.get('token') || '';
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(Boolean(tokenFromLink));

  useEffect(() => {
    if (!tokenFromLink) return;
    let cancelled = false;
    (async () => {
      setVerifying(true);
      setError('');
      try {
        const res = await fetch('/api/admin/login/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenFromLink }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.success) {
          setError(data.error || 'This sign-in link is invalid or has expired.');
          setVerifying(false);
          return;
        }
        router.replace('/admin');
      } catch {
        if (!cancelled) {
          setError('Could not complete sign-in. Request a new link.');
          setVerifying(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [tokenFromLink, router]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Could not send a sign-in link.');
      } else {
        setNotice(data.message || 'If that address is on the admin list, we sent a login link. Check your inbox.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-brand-canvas text-brand-ink">
      <div className="w-full max-w-md bg-brand-paper p-8 rounded-2xl border border-brand-border space-y-6 shadow-card">
        <div className="text-center space-y-3 flex flex-col items-center">
          <BrandLogo variant="stacked" height={104} />
          <p className="text-xs font-sans text-brand-steel">Administrator Operations Portal</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-brand-canvas border border-brand-danger text-brand-danger text-xs font-sans flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {notice && (
          <div className="p-3 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-brand-accent" />
            <span>{notice}</span>
          </div>
        )}

        {verifying ? (
          <p className="text-sm text-brand-steel text-center">Signing you in…</p>
        ) : (
          <form onSubmit={handleRequest} className="space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="text-brand-graphite font-semibold">Work email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-steel" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-display font-bold text-xs hover:bg-brand-primary-hover transition-all shadow-xs flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Sending link…' : 'Email me a sign-in link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center text-[10px] font-sans text-brand-steel pt-2 border-t border-brand-border/60">
          Single-use link · expires in 12 minutes · no shared password
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-canvas" />}>
      <AdminLoginInner />
    </Suspense>
  );
}
