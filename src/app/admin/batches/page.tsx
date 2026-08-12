'use client';

import React, { useState } from 'react';
import { BATCH_RECORDS } from '../../../data/batches';
import { BatchRecord } from '../../../types';
import { FileCheck, Plus, ShieldCheck, Upload, Trash2, CheckCircle2 } from 'lucide-react';
import { PRODUCTS } from '../../../data/products';

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState<Record<string, BatchRecord>>(BATCH_RECORDS);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    lotNumber: '',
    productId: PRODUCTS[0].id,
    productName: PRODUCTS[0].name,
    casNumber: PRODUCTS[0].casNumber,
    manufacturingDate: '2026-07-01',
    testingDate: '2026-08-01',
    testingLab: 'Janoshik Analytical Laboratories',
    analyticalMethod: 'HPLC-UV / LC-MS' as const,
    purity: 99.70,
    labNotes: 'RP-HPLC Integration demonstrates peak area purity. Mass confirmed via LC-MS.'
  });

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const lot = formData.lotNumber.toUpperCase().trim() || `LOT-VF-${Math.floor(1000 + Math.random()*9000)}`;
    const selProd = PRODUCTS.find(p => p.id === formData.productId) || PRODUCTS[0];

    const newBatch: BatchRecord = {
      lotNumber: lot,
      productId: selProd.id,
      productName: selProd.name,
      casNumber: selProd.casNumber,
      manufacturingDate: formData.manufacturingDate,
      testingDate: formData.testingDate,
      expiryDate: '2028-08-01',
      testingLab: formData.testingLab,
      analyticalMethod: formData.analyticalMethod,
      purity: formData.purity,
      identityVerified: true,
      appearancePass: true,
      massVerificationPass: true,
      labNotes: formData.labNotes,
      peaks: [
        { peakNo: 1, retentionTime: 14.5, area: 120000, height: 13000, areaPercent: formData.purity },
        { peakNo: 2, retentionTime: 18.2, area: 300, height: 40, areaPercent: 100 - formData.purity }
      ],
      chromatogramPoints: [
        { time: 0, signal: 5 }, { time: 14.5, signal: 3500 }, { time: 25, signal: 10 }
      ]
    };

    setBatches(prev => ({ ...prev, [lot]: newBatch }));
    setIsCreating(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Batch & COA Document Management</h1>
          <p className="text-xs font-mono text-slate-400">Manage verified lot records and COA documents powering the public verification portal</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-display font-bold text-xs hover:bg-cyan-400"
        >
          <Plus className="w-4 h-4" />
          <span>New Batch Record</span>
        </button>
      </div>

      {/* New Batch Modal Form */}
      {isCreating && (
        <form onSubmit={handleCreateBatch} className="glass-panel p-6 rounded-2xl border border-white/15 space-y-4 max-w-2xl font-mono text-xs">
          <h3 className="font-display text-lg font-bold text-white">Create New Batch Record & COA</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300">Lot Number (e.g. LOT-VF-8842)</label>
              <input
                type="text" required
                value={formData.lotNumber}
                onChange={e => setFormData({ ...formData, lotNumber: e.target.value })}
                placeholder="LOT-VF-9988"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300">Assigned Product</label>
              <select
                value={formData.productId}
                onChange={e => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white"
              >
                {PRODUCTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300">Testing Lab</label>
              <input
                type="text" required
                value={formData.testingLab}
                onChange={e => setFormData({ ...formData, testingLab: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300">Reported Purity %</label>
              <input
                type="number" step="0.01" required
                value={formData.purity}
                onChange={e => setFormData({ ...formData, purity: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300">Testing Date</label>
              <input
                type="date" required
                value={formData.testingDate}
                onChange={e => setFormData({ ...formData, testingDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300">Analytical Remarks & Notes</label>
            <textarea
              rows={3}
              value={formData.labNotes}
              onChange={e => setFormData({ ...formData, labNotes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button type="submit" className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold">
              Save Batch Record
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table of Batches */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 glass-panel font-mono text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="p-4">Lot Code</th>
              <th className="p-4">Product</th>
              <th className="p-4">Testing Lab</th>
              <th className="p-4">Purity</th>
              <th className="p-4">Test Date</th>
              <th className="p-4">Identity</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-slate-950/60">
            {Object.values(batches).map(b => (
              <tr key={b.lotNumber} className="text-slate-300">
                <td className="p-4 font-bold text-cyan-300">{b.lotNumber}</td>
                <td className="p-4 font-bold text-white">{b.productName}</td>
                <td className="p-4 text-slate-400">{b.testingLab}</td>
                <td className="p-4 text-emerald-400 font-bold">{b.purity.toFixed(2)}%</td>
                <td className="p-4 text-slate-400">{b.testingDate}</td>
                <td className="p-4 text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ESI-MS PASS</span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      const copy = { ...batches };
                      delete copy[b.lotNumber];
                      setBatches(copy);
                    }}
                    className="p-1.5 rounded bg-slate-900 border border-white/10 hover:border-rose-400 text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
