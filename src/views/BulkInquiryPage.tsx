'use client';

import React, { useState } from 'react';
import {
  Building2,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Boxes,
  Clock,
  Layers,
} from 'lucide-react';
import { trackEvent } from '../lib/analytics';

const TIERS = [
  {
    range: '10 – 24 Vials',
    discount: '10% Tier Discount',
    desc: 'Ideal for medium experimental series and multi-replicate assays.',
    terms: 'Immediate inventory allocation from active batch.',
  },
  {
    range: '25 – 49 Vials',
    discount: '15% Tier Discount',
    desc: 'Single-lot reservation to eliminate batch-to-batch analytical variance.',
    terms: 'Dedicated lot reservation & expedited ground shipping included.',
  },
  {
    range: '50+ Vials / Custom Synthesis',
    discount: 'Custom Institutional Quote',
    desc: 'Volume manufacturing, custom lyophilized aliquot sizing, and formal invoicing.',
    terms: 'Net 30 terms available for verified institutions.',
  },
];

export const BulkInquiryPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    institution: '',
    email: '',
    phone: '',
    targetPeptides: '',
    estimatedQuantity: '25-49 vials',
    timeline: 'Within 2-4 weeks',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    trackEvent('bulk_inquiry', {
      institution: form.institution,
      quantityTier: form.estimatedQuantity,
      peptides: form.targetPeptides,
    });

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          institution: form.institution,
          email: form.email,
          subject: `Institutional Inquiry: ${form.estimatedQuantity} (${form.targetPeptides || 'General'})`,
          message: `Phone: ${form.phone || 'N/A'}\nTarget Peptides: ${form.targetPeptides}\nQuantity: ${form.estimatedQuantity}\nTimeline: ${form.timeline}\nNotes: ${form.notes}`,
        }),
      });
    } catch {
      // Best-effort optimistic UI
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 bg-brand-canvas">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-surface-muted border border-brand-border text-xs font-mono text-brand-steel uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5 text-brand-accent" />
          <span>Institutional Procurement</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink tracking-tight">
          Bulk Research Orders & Volume Quotes
        </h1>
        <p className="text-brand-steel text-sm sm:text-base font-normal leading-relaxed">
          Single-lot batch reservations, volume tier pricing, and tailored procurement support for verified laboratories and academic departments.
        </p>
      </div>

      {/* Volume Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map((t) => (
          <div
            key={t.range}
            className="storefront-card p-6 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-brand-accent">{t.range}</span>
              <Boxes className="w-4 h-4 text-brand-steel" />
            </div>
            <h3 className="font-display text-lg font-bold text-brand-ink">{t.discount}</h3>
            <p className="text-xs text-brand-steel leading-relaxed">{t.desc}</p>
            <div className="pt-2 border-t border-brand-border/60 text-[11px] font-mono text-brand-steel">
              {t.terms}
            </div>
          </div>
        ))}
      </div>

      {/* Inquiry Form & Safeguards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-4">
          <div className="storefront-card p-6 sm:p-8 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-4">
            <h3 className="font-display text-base font-bold text-brand-ink flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-brand-accent" />
              <span>Institutional Documentation</span>
            </h3>
            <ul className="space-y-2 text-xs font-sans text-brand-steel">
              {[
                'Single-lot reservation prevents batch variance across long studies',
                'Comprehensive COA package with lot-matched HPLC and MS',
                'Formal quotation PDFs with line-item pricing',
                'Net 30 billing available for accredited institutions',
              ].map((item) => (
                <li key={item} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-brand-paper border border-brand-border text-xs font-sans text-brand-steel leading-relaxed flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
            <span>
              All materials supplied are strictly for Research Use Only (RUO). Requests for clinical, diagnostic, or human-consumption use will be refused.
            </span>
          </div>
        </div>

        <div className="lg:col-span-7 storefront-card p-8 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="font-display text-xl font-bold text-brand-ink">Institutional Request Received</h3>
              <p className="text-xs font-sans text-brand-steel">
                Thank you for your inquiry. A member of our scientific procurement team will review your requirements and provide a formal quotation within one business day.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-sans text-brand-ink font-semibold">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Dr. Jane Smith"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-sans text-brand-ink font-semibold">Institution / Lab</label>
                  <input
                    type="text"
                    required
                    value={form.institution}
                    onChange={(e) => setForm({ ...form, institution: e.target.value })}
                    placeholder="University of California / Acme Bio"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-sans text-brand-ink font-semibold">Institutional Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="jsmith@university.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-sans text-brand-ink font-semibold">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-sans text-brand-ink font-semibold">Target Peptides & SKUs</label>
                <input
                  type="text"
                  required
                  value={form.targetPeptides}
                  onChange={(e) => setForm({ ...form, targetPeptides: e.target.value })}
                  placeholder="e.g. BPC-157 10mg, TB-500 10mg, Semaglutide 5mg"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-sans text-brand-ink font-semibold">Estimated Volume Tier</label>
                  <select
                    value={form.estimatedQuantity}
                    onChange={(e) => setForm({ ...form, estimatedQuantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite cursor-pointer"
                  >
                    <option value="10-24 vials">10 – 24 vials (10% tier)</option>
                    <option value="25-49 vials">25 – 49 vials (15% tier)</option>
                    <option value="50-100 vials">50 – 100 vials (Volume tier)</option>
                    <option value="100+ vials">100+ vials / Custom batch</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-sans text-brand-ink font-semibold">Estimated Timeline</label>
                  <select
                    value={form.timeline}
                    onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite cursor-pointer"
                  >
                    <option>Immediate (Within 1 week)</option>
                    <option>Within 2-4 weeks</option>
                    <option>Within 1-3 months</option>
                    <option>Budget planning / Future quarter</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-sans text-brand-ink font-semibold">Study Notes / Special Aliquot Requirements</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Include any specific packaging, batch documentation, or lot reservation requirements..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-brand-ink hover:bg-brand-graphite text-brand-paper font-sans font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Request Institutional Quotation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
