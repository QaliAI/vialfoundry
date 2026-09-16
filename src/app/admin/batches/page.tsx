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

      {/* Authority Disclaimer & Operations Notice */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-3 text-xs font-mono">
        <div className="flex items-center space-x-2 text-amber-400 font-bold">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>Internal Operations Notice: Batch Registry Publishing Workflow</span>
        </div>
        <div className="text-slate-300 space-y-2 leading-relaxed">
          <p>
            <strong className="text-white">Admin Upload UI Status:</strong> Direct file upload via this admin page is intentionally <strong className="text-amber-300">not enabled</strong>. Operators cannot upload certificate PDFs or edit batch records through this browser interface.
          </p>
          <p>
            <strong className="text-white">Authentic Records Count:</strong> <span className="text-brand-paper font-semibold">{batchList.length} authentic records configured</span>. In accordance with our analytical integrity policy, zero synthetic COAs are permitted. Products without an authentic certificate display &ldquo;Documentation: Pending Supplier File&rdquo; on the storefront.
          </p>
          <p>
            <strong className="text-white">Standard Publishing Procedure:</strong> Follow the code-authoritative publishing process documented in <code className="text-brand-accent bg-white/5 px-1 py-0.5 rounded">docs/COA_PUBLISHING_PROCESS.md</code>:
          </p>
          <ol className="list-decimal list-inside pl-2 space-y-1 text-slate-400">
            <li>Verify authentic supplier/laboratory Certificate of Analysis.</li>
            <li>Place authentic PDF in <code className="text-slate-300">public/documents/coa/[lotNumber].pdf</code>.</li>
            <li>Register metadata entry in <code className="text-slate-300">src/data/verified-batch-records.ts</code>.</li>
            <li>Run <code className="text-slate-300">npm run check:prod</code> to validate PDF existence and hash integrity before deploying to production.</li>
          </ol>
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
            No synthetic COAs are permitted. Operators cannot upload certificates through this web interface. When authentic laboratory certificates are received and verified by the owner, publish them according to <code className="text-slate-300">docs/COA_PUBLISHING_PROCESS.md</code>.
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
