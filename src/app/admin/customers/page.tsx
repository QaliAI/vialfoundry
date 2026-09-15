'use client';

import React, { useEffect, useState } from 'react';
import { Mail, Download, RefreshCw, AlertCircle } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  source: string;
  created_at: string;
}

export default function AdminCustomersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscribers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/subscribers');
      if (!res.ok) {
        throw new Error(`Failed to fetch subscribers: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.subscribers || []);
      } else {
        setError(data.error || 'Failed to load subscribers');
      }
    } catch (err: any) {
      setError(err?.message || 'Error connecting to database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  return (
    <div className="space-y-8">
      <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Customers & Subscribers</h1>
          <p className="text-xs font-mono text-slate-400">View email newsletter subscribers and export subscriber lists</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchSubscribers}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-mono text-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            title="Refresh subscriber list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <a
            href="/api/admin/subscribers?format=csv"
            download
            className="px-3.5 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white font-mono text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-white flex items-center space-x-2">
            <Mail className="w-4 h-4 text-brand-paper" />
            <span>Email Subscribers ({subscribers.length})</span>
          </h3>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-mono text-xs">
            Loading subscribers...
          </div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-mono text-xs">
            No subscribers recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Subscriber Email</th>
                  <th className="p-3">Signup Source</th>
                  <th className="p-3">Consent Date</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-950/60">
                {subscribers.map((s) => (
                  <tr key={s.id} className="text-slate-300">
                    <td className="p-3 font-bold text-white">{s.email}</td>
                    <td className="p-3 text-slate-400">{s.source || 'footer_form'}</td>
                    <td className="p-3 text-slate-400">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-3 text-right text-emerald-400 font-bold">SUBSCRIBED</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
