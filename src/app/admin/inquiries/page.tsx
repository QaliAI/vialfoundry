'use client';

import React, { useEffect, useState } from 'react';
import { Mail, Building2, Inbox } from 'lucide-react';

/** Leads must be impossible to lose. Deliberately not a CRM. */

const STATUSES = ['new', 'open', 'responded', 'closed'] as const;
type Status = (typeof STATUSES)[number];

export default function AdminInquiries() {
  const [rows, setRows] = useState<any[]>([]);
  const [restock, setRestock] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/inquiries', { credentials: 'include' });
      if (res.ok) {
        const d = await res.json();
        setRows(d.inquiries || []);
        setRestock(d.restockRequests || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: Status) => {
    setSaving(id);
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } finally {
      setSaving(null);
    }
  };

  const visible = filter === 'all' ? rows : rows.filter((r) => (r.status || 'new') === filter);

  return (
    <div className="space-y-6">
      <div className="border-b border-brand-graphite/40 pb-4">
        <h1 className="font-display text-2xl font-bold text-white">Enquiries</h1>
        <p className="text-xs text-slate-400 mt-1">Contact and bulk-order messages from the website.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(['all', ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === s ? 'bg-white text-brand-ink font-semibold' : 'text-slate-400 hover:text-white bg-brand-graphite/30'
            }`}
          >
            {s} {s !== 'all' && `(${rows.filter((r) => (r.status || 'new') === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-500 flex flex-col items-center gap-3 rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40">
          <Inbox className="w-6 h-6 text-slate-600" />
          {rows.length === 0 ? 'No enquiries have come in yet.' : `No ${filter} enquiries.`}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((r) => (
            <div key={r.id} className="rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40 p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <div className="font-display font-semibold text-white">{r.name}</div>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />
                      <a href={`mailto:${r.email}`} className="hover:text-brand-teal break-all">{r.email}</a>
                    </span>
                    {r.institution && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{r.institution}</span>}
                    <span>{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-brand-teal font-medium pt-0.5">{r.subject}</div>
                </div>
                <select
                  value={r.status || 'new'}
                  disabled={saving === r.id}
                  onChange={(e) => setStatus(r.id, e.target.value as Status)}
                  className="bg-brand-graphite/40 border border-brand-graphite text-white text-xs rounded-lg px-3 py-2 capitalize shrink-0"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap border-t border-brand-graphite/30 pt-3">
                {r.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {restock.length > 0 && (
        <div className="rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40 p-5 space-y-2">
          <h2 className="font-display text-sm font-bold text-white">Back-in-stock requests</h2>
          {restock.map((r) => (
            <div key={r.id} className="flex items-center justify-between text-sm py-1.5 border-b border-brand-graphite/30 last:border-0">
              <span className="text-slate-300 break-all">{r.email}</span>
              <span className="text-xs text-slate-500 ml-3">{r.product_id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
