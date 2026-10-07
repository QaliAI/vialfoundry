'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Send,
  Users,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Eye,
  FileText,
  Clock,
} from 'lucide-react';

export interface EmailCenterClientProps {
  adminEmail: string;
  audienceCounts: {
    marketing_subscribers: number;
    first_time_buyers: number;
    repeat_customers: number;
  };
  campaigns: Array<{
    id: string;
    name: string;
    subject: string;
    audience_type: string;
    status: string;
    recipient_count: number;
    delivered_count: number;
    created_at: string;
    sent_at: string | null;
  }>;
}

const PROHIBITED_WORDS = [
  'human use',
  'human consumption',
  'dose',
  'dosing',
  'inject',
  'injection',
  'cure',
  'treatment',
  'therapy',
  'patient',
  'subcutaneous',
  'clinical outcome',
];

export function EmailCenterClient({ adminEmail, audienceCounts, campaigns }: EmailCenterClientProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    subject: '',
    preheader: '',
    audience_type: 'marketing_subscribers',
    body: '',
    ctaLabel: 'Explore Research Materials',
    ctaUrl: 'https://www.vialfoundry.com/catalog',
  });

  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Live RUO check
  const combinedText = `${form.subject} ${form.body}`.toLowerCase();
  const detectedViolations = PROHIBITED_WORDS.filter((word) => combinedText.includes(word));

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (detectedViolations.length > 0) {
      setFeedback({
        type: 'error',
        message: `RUO Guard: Cannot save draft with prohibited terms: [${detectedViolations.join(', ')}].`,
      });
      return;
    }

    setBusy(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'campaign_create',
          campaign: {
            name: form.name,
            subject: form.subject,
            preheader: form.preheader,
            audience_type: form.audience_type,
            content: {
              body: form.body,
              ctaLabel: form.ctaLabel,
              ctaUrl: form.ctaUrl,
            },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create campaign draft.');
      }

      setFeedback({ type: 'success', message: 'Campaign draft saved successfully.' });
      setForm({
        name: '',
        subject: '',
        preheader: '',
        audience_type: 'marketing_subscribers',
        body: '',
        ctaLabel: 'Explore Research Materials',
        ctaUrl: 'https://www.vialfoundry.com/catalog',
      });
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setBusy(false);
    }
  };

  const handleSendTest = async (campaignId: string) => {
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'campaign_test',
          id: campaignId,
          recipient: adminEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Test send failed.');
      setFeedback({ type: 'success', message: `Test email sent to ${adminEmail}` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setBusy(false);
    }
  };

  const handleBroadcast = async (campaignId: string, name: string) => {
    const confirm = window.prompt(
      `Type SEND to confirm broadcasting "${name}" to all active subscribers in this audience.`
    );
    if (confirm !== 'SEND') return;

    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'campaign_send',
          id: campaignId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Broadcast failed.');
      setFeedback({ type: 'success', message: data.message || 'Campaign broadcast complete.' });
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-graphite/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              Lifecycle Marketing
            </span>
            <span className="text-xs text-slate-400">· CAN-SPAM / CASL Compliant Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-100 mt-1">
            Email Marketing Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audience consent management, RUO claim-guarded campaign composer, and delivery telemetry.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-sans border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Audience Segments */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40 space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Marketing Subscribers</span>
          </div>
          <div className="text-2xl font-mono font-bold text-slate-100">
            {audienceCounts.marketing_subscribers.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">Opted in with active consent</div>
        </div>

        <div className="p-5 rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40 space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span>First-Time Buyers</span>
          </div>
          <div className="text-2xl font-mono font-bold text-slate-100">
            {audienceCounts.first_time_buyers.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">Placed 1 verified paid order</div>
        </div>

        <div className="p-5 rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40 space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent" />
            <span>Repeat Customers</span>
          </div>
          <div className="text-2xl font-mono font-bold text-slate-100">
            {audienceCounts.repeat_customers.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">Placed 2+ verified paid orders</div>
        </div>
      </div>

      {/* Campaign Composer */}
      <div className="p-6 sm:p-8 rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-accent" />
              <span>Create Email Campaign</span>
            </h2>
            <p className="text-xs text-slate-400">
              Compose truthful research announcements. Automated RUO validation ensures compliance before dispatch.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateDraft} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Campaign Internal Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Q4 Analytical Catalog Update"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ink/60 border border-brand-graphite/50 text-slate-100 text-xs focus:outline-none focus:border-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Target Audience</label>
              <select
                value={form.audience_type}
                onChange={(e) => setForm({ ...form, audience_type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ink/60 border border-brand-graphite/50 text-slate-100 text-xs focus:outline-none focus:border-slate-400 cursor-pointer"
              >
                <option value="marketing_subscribers">
                  All Active Subscribers ({audienceCounts.marketing_subscribers})
                </option>
                <option value="first_time_buyers">
                  First-Time Buyers ({audienceCounts.first_time_buyers})
                </option>
                <option value="repeat_customers">
                  Repeat Customers ({audienceCounts.repeat_customers})
                </option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold">Subject Line</label>
            <input
              type="text"
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g. New Research Peptides & Analytical Documentation Available"
              className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ink/60 border border-brand-graphite/50 text-slate-100 text-xs focus:outline-none focus:border-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold">Email Content Body</label>
            <textarea
              rows={6}
              required
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Write the campaign announcement for researchers..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ink/60 border border-brand-graphite/50 text-slate-100 text-xs focus:outline-none focus:border-slate-400 font-sans leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">CTA Button Label</label>
              <input
                type="text"
                value={form.ctaLabel}
                onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ink/60 border border-brand-graphite/50 text-slate-100 text-xs focus:outline-none focus:border-slate-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">CTA Button Link</label>
              <input
                type="text"
                value={form.ctaUrl}
                onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-ink/60 border border-brand-graphite/50 text-slate-100 text-xs focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* RUO Inspector */}
          {detectedViolations.length > 0 ? (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">RUO Safeguard Warning:</strong>
                Prohibited medical/human-use terms detected: [{detectedViolations.join(', ')}]. Please remove these terms to comply with research standards.
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>RUO Content Check Passed: No medical, dosing, or therapeutic terms detected.</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={busy || detectedViolations.length > 0}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-white disabled:opacity-50 text-brand-ink text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Save Campaign Draft</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Campaigns Table */}
      <div className="p-6 sm:p-8 rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40 space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-accent" />
          <span>Campaign Dispatch Ledger</span>
        </h2>

        {campaigns.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-brand-graphite/40 rounded-xl">
            No email campaigns created yet. Compose your first campaign draft above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-graphite/40 text-slate-400 font-semibold">
                  <th className="pb-2">Campaign Name</th>
                  <th className="pb-2">Subject</th>
                  <th className="pb-2">Audience</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Recipients</th>
                  <th className="pb-2 text-right">Delivered</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-graphite/20">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-graphite/10">
                    <td className="py-3 font-semibold text-slate-100">{c.name}</td>
                    <td className="py-3 text-slate-300 max-w-xs truncate">{c.subject}</td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">{c.audience_type}</td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                          c.status === 'sent'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-slate-300">{c.recipient_count || 0}</td>
                    <td className="py-3 text-right font-mono text-emerald-400">{c.delivered_count || 0}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSendTest(c.id)}
                          disabled={busy}
                          className="px-2.5 py-1 rounded-lg bg-brand-graphite/40 hover:bg-brand-graphite/60 text-slate-200 text-[11px] font-mono transition-colors"
                        >
                          Send Test
                        </button>
                        {c.status !== 'sent' && (
                          <button
                            onClick={() => handleBroadcast(c.id, c.name)}
                            disabled={busy}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-mono transition-colors"
                          >
                            Send Broadcast
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Compliance Notice */}
      <div className="p-4 rounded-xl bg-brand-graphite/20 border border-brand-graphite/40 text-xs text-slate-400 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <span>
          CAN-SPAM / CASL Compliance Enforcement: All outgoing emails include a direct unsubscribe mechanism. When an address unsubscribes, all future marketing dispatches to that email are automatically suppressed. Transactional receipts remain unimpeded.
        </span>
      </div>
    </div>
  );
}
