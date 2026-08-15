'use client';

import React, { useState } from 'react';
import { Percent, TrendingUp, Wallet, CheckCircle2, Users, ShieldCheck } from 'lucide-react';

const BENEFITS = [
  { icon: Percent, title: 'Competitive commission', body: 'Earn a generous commission on every qualified order from your referrals.' },
  { icon: TrendingUp, title: 'High-converting catalog', body: 'Premium, batch-documented research materials researchers trust and reorder.' },
  { icon: Wallet, title: 'Flexible payouts', body: 'Get paid via CashApp, crypto, Zelle, or bank transfer on a regular schedule.' },
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
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="mono-tag text-xs text-cyan-400 font-semibold uppercase tracking-wider">
          Partner Program
        </div>
        <h1 className="font-display text-4xl font-extrabold text-white">Join the Vial Foundry Affiliate Program</h1>
        <p className="text-slate-400 text-sm font-light">
          Refer researchers and labs to precision-built, batch-documented research materials and earn
          commission on every qualified order. Apply below — approvals are quick.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BENEFITS.map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.title} className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="font-display text-base font-bold text-white">{b.title}</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">{b.body}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" /> Who it&apos;s for
            </h3>
            <ul className="space-y-2 text-xs font-mono text-slate-300">
              {['Research educators & content creators', 'Lab supply reviewers & communities', 'Newsletter and forum operators'].map((x) => (
                <li key={x} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-slate-400 leading-relaxed flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>Affiliates must promote all products as research use only (RUO). No health, dosing, or human-use claims.</span>
          </div>
        </div>

        <div className="lg:col-span-7 glass-panel p-8 rounded-2xl border border-white/10">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="font-display text-xl font-bold text-white">Application Received</h3>
              <p className="text-xs font-mono text-slate-400">
                Thanks for applying. Our team will review your application and follow up by email with your
                referral link and terms.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="mono-tag text-xs text-slate-300 uppercase">Full Name</label>
                  <input
                    type="text" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="mono-tag text-xs text-slate-300 uppercase">Email</label>
                  <input
                    type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="mono-tag text-xs text-slate-300 uppercase">Website / Social</label>
                <input
                  type="text" value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://…"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="mono-tag text-xs text-slate-300 uppercase">Audience / How you&apos;ll promote</label>
                <textarea
                  rows={3} value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value })}
                  placeholder="Tell us about your audience and channels…"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="mono-tag text-xs text-slate-300 uppercase">Preferred Payout</label>
                <select
                  value={form.payoutMethod}
                  onChange={(e) => setForm({ ...form, payoutMethod: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option>CashApp</option>
                  <option>Crypto (BTC/USDC)</option>
                  <option>Zelle</option>
                  <option>ACH / Bank transfer</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-cyan-500 text-slate-950 font-display font-bold text-xs hover:bg-cyan-400 transition-all shadow-lg"
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
