'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Percent,
  TrendingUp,
  Wallet,
  CheckCircle2,
  Users,
  ShieldCheck,
  ArrowRight,
  Lock,
  Share2,
  BarChart3,
  BadgeDollarSign,
} from 'lucide-react';
import { trackEvent } from '../lib/analytics';

const BENEFITS = [
  {
    icon: Percent,
    title: '10% Baseline Commission',
    body: 'Earn recurring commission on verified, paid research material orders referred by your link or code.',
  },
  {
    icon: TrendingUp,
    title: '10% Audience Discount',
    body: 'Provide your community with an instant 10% research discount code, fully attributed to your account.',
  },
  {
    icon: Wallet,
    title: 'Flexible Settlement',
    body: 'Fast, reliable payouts via CashApp, Zelle, ACH Bank Wire, or Crypto (USDC/BTC) upon verified completion.',
  },
];

const STEPS = [
  { step: '01', title: 'Submit Application', desc: 'Tell us about your research channels, publications, or lab community.' },
  { step: '02', title: 'Partner Review', desc: 'Our team verifies alignment with our strict Research Use Only (RUO) standards.' },
  { step: '03', title: 'Get Link & Code', desc: 'Receive your unique /r/[code] referral link and custom partner coupon.' },
  { step: '04', title: 'Real-time Tracking', desc: 'Track clicks, orders, conversion rate, and earned commission with zero customer PII.' },
  { step: '05', title: 'Scheduled Payouts', desc: 'Receive monthly payouts to your designated payment channel.' },
];

export const AffiliatesPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', website: '', audience: '', payoutMethod: 'CashApp' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    trackEvent('affiliate_application', { payoutMethod: form.payoutMethod });
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
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface-muted border border-brand-border text-xs font-mono text-brand-steel uppercase tracking-wider">
          <span>Partner Program</span>
          <span>·</span>
          <Link href="/affiliates/login" className="text-brand-ink font-semibold hover:underline flex items-center gap-1">
            <Lock className="w-3 h-3 text-brand-accent" />
            <span>Partner Portal Login →</span>
          </Link>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink tracking-tight">
          Vial Foundry Affiliate Program
        </h1>
        <p className="text-brand-steel text-sm sm:text-base font-normal leading-relaxed">
          Refer verified researchers and institutions to batch-documented research materials. Earn transparent commissions with dedicated tracking.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BENEFITS.map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.title} className="storefront-card p-6 sm:p-8 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-brand-canvas border border-brand-border flex items-center justify-center text-brand-ink">
                <Icon className="w-5 h-5 text-brand-accent" />
              </div>
              <h3 className="font-display text-base font-bold text-brand-ink">{b.title}</h3>
              <p className="text-xs text-brand-steel font-normal leading-relaxed">{b.body}</p>
            </div>
          );
        })}
      </div>

      {/* 5-Step Process */}
      <div className="p-8 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-6">
        <div className="text-center max-w-md mx-auto space-y-1">
          <span className="font-mono text-[10px] text-brand-steel uppercase tracking-wider">How It Works</span>
          <h2 className="font-display text-xl font-bold text-brand-ink">Five Steps to Start Earning</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {STEPS.map((s) => (
            <div key={s.step} className="p-4 rounded-xl bg-brand-canvas border border-brand-border space-y-2">
              <span className="font-mono text-xs font-bold text-brand-accent">{s.step}</span>
              <h4 className="font-display text-xs font-bold text-brand-ink">{s.title}</h4>
              <p className="text-[11px] font-sans text-brand-steel leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Application Form + Scope */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-4">
          <div className="storefront-card p-6 sm:p-8 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-4">
            <h3 className="font-display text-lg font-bold text-brand-ink flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-accent" /> Ideal Partners
            </h3>
            <ul className="space-y-2 text-xs font-sans text-brand-steel">
              {[
                'Biochemical researchers & academic creators',
                'Analytical peptide directories & scientific forums',
                'Scientific newsletters & biotechnology publications',
                'Independent research lab procurement networks',
              ].map((x) => (
                <li key={x} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-brand-paper border border-brand-border text-xs font-sans text-brand-steel leading-relaxed flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
            <span>
              All materials are strictly for Research Use Only (RUO). Affiliates must never make human-consumption, medical, diagnostic, or therapeutic claims.
            </span>
          </div>

          <div className="p-4 rounded-xl bg-brand-surface-muted border border-brand-border flex items-center justify-between">
            <span className="text-xs font-sans text-brand-steel">Existing Partner?</span>
            <Link
              href="/affiliates/login"
              className="text-xs font-sans font-bold text-brand-ink hover:underline flex items-center gap-1"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-7 storefront-card p-8 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="font-display text-xl font-bold text-brand-ink">Application Received</h3>
              <p className="text-xs font-sans text-brand-steel">
                Thank you for applying. Our partner operations team will review your channels and email your activation setup link within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-sans text-brand-ink font-semibold">Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-sans text-brand-ink font-semibold">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-sans text-brand-ink font-semibold">Website / Primary Channel</label>
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-sans text-brand-ink font-semibold">Audience Description & Focus</label>
                <textarea
                  rows={3}
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value })}
                  placeholder="Describe your research audience, content focus, or publication..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-sans text-brand-ink font-semibold">Preferred Settlement Channel</label>
                <select
                  value={form.payoutMethod}
                  onChange={(e) => setForm({ ...form, payoutMethod: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite cursor-pointer"
                >
                  <option>CashApp</option>
                  <option>Crypto (USDC / BTC)</option>
                  <option>Zelle</option>
                  <option>ACH / Bank Wire</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-brand-ink hover:bg-brand-graphite text-brand-paper font-sans font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Submit Partner Application</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
