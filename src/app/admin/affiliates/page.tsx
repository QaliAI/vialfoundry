'use client';

import React from 'react';
import { Share2, DollarSign, CheckCircle2 } from 'lucide-react';

export default function AdminAffiliatesPage() {
  const affiliates = [
    { code: 'ANALYTICAL-LABS', partner: 'Analytical Reviews Network', rate: '10%', conversions: 14, totalEarned: '$420.00', status: 'Active' },
    { code: 'BIO-RESEARCH-HUB', partner: 'BioResearch Community', rate: '10%', conversions: 8, totalEarned: '$240.00', status: 'Active' }
  ];

  return (
    <div className="space-y-8">
      <div className="border-b border-white/10 pb-4">
        <h1 className="font-display text-2xl font-bold text-white">Affiliate & Referral Tracking</h1>
        <p className="text-xs font-mono text-slate-400">Manage referral codes, commission rates, and partner conversions</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 glass-panel font-mono text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="p-4">Referral Code</th>
              <th className="p-4">Partner Name</th>
              <th className="p-4">Commission Rate</th>
              <th className="p-4">Conversions</th>
              <th className="p-4">Total Earned</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-slate-950/60">
            {affiliates.map(a => (
              <tr key={a.code} className="text-slate-300">
                <td className="p-4 font-bold text-cyan-300">{a.code}</td>
                <td className="p-4 font-bold text-white">{a.partner}</td>
                <td className="p-4 text-slate-400">{a.rate}</td>
                <td className="p-4 text-white font-bold">{a.conversions} Orders</td>
                <td className="p-4 text-emerald-400 font-bold">{a.totalEarned}</td>
                <td className="p-4 text-right text-emerald-400 font-bold">{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
