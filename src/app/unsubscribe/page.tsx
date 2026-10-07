'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Mail } from 'lucide-react';

function UnsubscribeInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token && !emailParam) {
      setLoading(false);
      setError('No unsubscribe token or email provided.');
      return;
    }

    fetch('/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email: emailParam }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setConfirmed(true);
        } else {
          setError(data.error || 'Failed to update preferences.');
        }
      })
      .catch(() => {
        setError('Network error processing request.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, emailParam]);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-brand-canvas px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-brand-canvas border border-brand-border flex items-center justify-center text-brand-ink mx-auto">
          <Mail className="w-6 h-6 text-brand-accent" />
        </div>

        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold text-brand-ink">Email Preferences</h1>
          <p className="text-xs text-brand-steel">
            Communication and newsletter consent management
          </p>
        </div>

        {loading ? (
          <div className="py-8 text-xs font-mono text-brand-steel">
            Updating email subscription settings...
          </div>
        ) : confirmed ? (
          <div className="space-y-3 py-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Unsubscribed Successfully</span>
            </div>
            <p className="text-xs text-brand-steel leading-relaxed">
              You will no longer receive marketing promotions, product announcements, or newsletters from Vial Foundry.
            </p>
            <p className="text-[11px] text-brand-steel border-t border-brand-border/60 pt-3">
              Essential transactional notifications (such as purchase confirmations and shipping tracking) will continue to be delivered if you place orders.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block px-4 py-2 rounded-xl bg-brand-ink hover:bg-brand-graphite text-brand-paper text-xs font-sans font-bold transition-all"
              >
                Return to Storefront
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-4">
            <p className="text-xs text-brand-danger">{error}</p>
            <Link
              href="/"
              className="inline-block px-4 py-2 rounded-xl bg-brand-paper border border-brand-border text-brand-ink text-xs font-sans font-semibold"
            >
              Return Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-xs font-mono">Loading...</div>}>
      <UnsubscribeInner />
    </Suspense>
  );
}
