'use client';

import React, { useState } from 'react';
import { Percent, TrendingUp, Wallet, CheckCircle2, Users, ShieldCheck } from 'lucide-react';

const BENEFITS = [
  { icon: Percent, title: 'Competitive commission', body: 'Earn commission on verified research orders from your referrals.' },
  { icon: TrendingUp, title: 'Dedicated catalog', body: 'Standardized, lot-documented research materials researchers trust and reorder.' },
  { icon: Wallet, title: 'Flexible settlement', body: 'Receive payouts via ACH, Zelle, CashApp, or crypto upon verified order completion.' },
];

export const AffiliatesPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', website: '', audience: '', payoutMethod: 'CashApp' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      await fetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch {
      /* optimistic UI */
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 bg-brand-canvas">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="text-xs font-sans font-semibold text-brand-steel uppercase tracking-wider">
          Partner Program
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink tracking-tight">Vial Foundry Affiliate Program</h1>
        <p className="text-brand-steel text-sm sm:text-base font-normal leading-relaxed">
          Refer qualified researchers and laboratory procurement teams to precision-tested, lot-documented research materials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BENEFITS.map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.title} className="storefront-card p-6 sm:p-8 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-brand-canvas border border-brand-border flex items-center justify-center text-brand-ink">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold text-brand-ink">{b.title}</h3>
              <p className="text-xs text-brand-steel font-normal leading-relaxed">{b.body}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-4">
          <div className="storefront-card p-6 sm:p-8 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-4">
            <h3 className="font-display text-lg font-bold text-brand-ink flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-accent" /> Program Scope
            </h3>
            <ul className="space-y-2 text-xs font-sans text-brand-steel">
              {['Research educators & analytical creators', 'Laboratory supply directories & communities', 'Academic newsletters & scientific publications'].map((x) => (
                <li key={x} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-brand-paper border border-brand-border text-xs font-sans text-brand-steel leading-relaxed flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
            <span>Affiliates must promote all products strictly as research use only (RUO). No medical, diagnostic, or human-use claims are permitted.</span>
          </div>
        </div>

        <div className="lg:col-span-7 storefront-card p-8 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-brand-mineral mx-auto" />
              <h3 className="font-display text-xl font-bold text-brand-ink">Application Received</h3>
              <p className="text-xs font-sans text-brand-steel">
                Thanks for applying. Our partner operations team will review your application and follow up by email with your custom referral attribution code.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-sans text-brand-ink font-semibold">Full Name</label>
                  <input
                    type="text" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-sans text-brand-ink font-semibold">Email</label>
                  <input
                    type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-sans text-brand-ink font-semibold">Website / Channel</label>
                <input
                  type="text" value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://…"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-sans text-brand-ink font-semibold">Audience Description</label>
                <textarea
                  rows={3} value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value })}
                  placeholder="Describe your audience, channels, and research focus…"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-sans text-brand-ink font-semibold">Preferred Payout Channel</label>
                <select
                  value={form.payoutMethod}
                  onChange={(e) => setForm({ ...form, payoutMethod: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite cursor-pointer"
                >
                  <option>CashApp</option>
                  <option>Crypto (BTC/USDC)</option>
                  <option>Zelle</option>
                  <option>ACH / Bank transfer</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-brand-primary hover:bg-brand-graphite text-brand-paper font-display font-bold text-xs shadow-xs transition-all"
              >
                Apply to the Affiliate Program
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
