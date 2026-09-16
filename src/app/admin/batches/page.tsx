'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { BATCH_RECORDS } from '../../../data/batches';
import { FileCheck, ShieldAlert, Search, ExternalLink } from 'lucide-react';

export default function AdminBatchesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const batchList = useMemo(() => {
    return Object.values(BATCH_RECORDS);
  }, []);

  const filteredBatches = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return batchList;
    return batchList.filter(
      b =>
        b.lotNumber.toLowerCase().includes(term) ||
        b.productName.toLowerCase().includes(term) ||
        b.issuedBy.toLowerCase().includes(term) ||
        (b.analyticalMethod && b.analyticalMethod.toLowerCase().includes(term))
    );
  }, [batchList, searchTerm]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Batch Records & COA Documentation</h1>
          <p className="text-xs font-mono text-slate-400">
            Authentic third-party Certificates of Analysis and laboratory verification records
          </p>
        </div>
        <Link
          href="/verify"
          target="_blank"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-paper font-display font-semibold text-xs border border-white/10 transition-colors"
        >
          <span>Customer Verify Portal</span>
          <ExternalLink className="w-3.5 h-3.5 text-brand-accent" />
        </Link>
      </div>

      {/* Authority Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-brand-accent/20 flex items-start space-x-3 text-xs font-mono text-slate-300">
        <ShieldAlert className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white">Analytical Integrity Policy:</span>
          <p className="text-slate-400 leading-relaxed">
            Analytical batch records and Certificates of Analysis are strictly managed via verified files in{' '}
            <code className="text-brand-paper bg-white/5 px-1 py-0.5 rounded">src/data/verified-batch-records.ts</code>.
            Vial Foundry never publishes synthetic purity numbers or unverified batch records. Currently{' '}
            <strong className="text-white">{batchList.length} authentic batch records</strong> are published.
            Any product without an authentic certificate displays &ldquo;Documentation: Pending Supplier File&rdquo; on the storefront.
          </p>
        </div>
      </div>

      {/* Search Filter */}
      {batchList.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search lot number, product, lab..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-white/15 text-white placeholder:text-slate-500 font-mono text-xs focus:outline-none focus:border-brand-accent"
          />
        </div>
      )}

      {/* Records Table or Honest Empty State */}
      {batchList.length === 0 ? (
        <div className="p-12 rounded-2xl border border-white/10 glass-panel text-center space-y-3 font-mono">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
            <FileCheck className="w-6 h-6" />
          </div>
          <div className="text-sm font-bold text-white">0 Authentic Batch Records Configured</div>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            No synthetic COAs are permitted. When authentic laboratory certificates are received and verified by the owner, their verified records will be committed to the batch registry.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 glass-panel font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">Lot Number</th>
                <th className="p-4">Assigned Product</th>
                <th className="p-4">Issuing Laboratory</th>
                <th className="p-4">Reported Purity</th>
                <th className="p-4">Testing Date</th>
                <th className="p-4">Analytical Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-950/60">
              {filteredBatches.map(b => (
                <tr key={b.lotNumber} className="text-slate-300 hover:bg-white/5">
                  <td className="p-4 font-bold text-brand-paper">{b.lotNumber}</td>
                  <td className="p-4 font-bold text-white">{b.productName}</td>
                  <td className="p-4 text-slate-400">{b.issuedBy}</td>
                  <td className="p-4 text-emerald-400 font-bold">
                    {b.purity !== undefined ? `${b.purity.toFixed(2)}%` : '—'}
                  </td>
                  <td className="p-4 text-slate-400">{b.testingDate || '—'}</td>
                  <td className="p-4 text-slate-400">{b.analyticalMethod || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
