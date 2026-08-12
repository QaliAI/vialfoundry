'use client';

import React from 'react';
import { Users, Mail, CheckCircle2 } from 'lucide-react';

export default function AdminCustomersPage() {
  const subscribers = [
    { email: 'researcher@stanford.edu', source: 'Footer Form', date: '2026-08-01' },
    { email: 'lab.director@biotech-institute.org', source: 'Batch Page', date: '2026-08-05' },
    { email: 'procurement@analytical-labs.com', source: 'Checkout', date: '2026-08-11' }
  ];

  return (
    <div className="space-y-8">
      <div className="border-b border-white/10 pb-4">
        <h1 className="font-display text-2xl font-bold text-white">Customers & Subscribers</h1>
        <p className="text-xs font-mono text-slate-400">View email newsletter subscribers and institutional research accounts</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 font-mono text-xs">
        <h3 className="font-display text-base font-bold text-white flex items-center space-x-2">
          <Mail className="w-4 h-4 text-cyan-400" />
          <span>Email Subscribers ({subscribers.length})</span>
        </h3>

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
            {subscribers.map((s, idx) => (
              <tr key={idx} className="text-slate-300">
                <td className="p-3 font-bold text-white">{s.email}</td>
                <td className="p-3 text-slate-400">{s.source}</td>
                <td className="p-3 text-slate-400">{s.date}</td>
                <td className="p-3 text-right text-emerald-400 font-bold">SUBSCRIBED</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
