'use client';

import React, { useState } from 'react';
import { Tag, Plus, Trash2 } from 'lucide-react';

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState([
    { code: 'FOUNDRY10', desc: '10% discount on initial institutional orders', type: 'Percentage', value: '10%', min: '$100.00', active: true },
    { code: 'RESEARCH25', desc: '$25 off orders above $200', type: 'Fixed Amount', value: '$25.00', min: '$200.00', active: true }
  ]);

  const [code, setCode] = useState('');
  const [value, setValue] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (code && value) {
      setDiscounts([...discounts, {
        code: code.toUpperCase().trim(),
        desc: 'Custom promotional discount',
        type: 'Percentage',
        value: `${value}%`,
        min: '$50.00',
        active: true
      }]);
      setCode('');
      setValue('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-white/10 pb-4">
        <h1 className="font-display text-2xl font-bold text-white">Discount Code Management</h1>
        <p className="text-xs font-mono text-slate-400">Configure promotional codes, percentage discounts, and order thresholds</p>
      </div>

      <form onSubmit={handleAdd} className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center space-x-3 text-xs font-mono">
        <input
          type="text" required
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="New Code (e.g. LAB20)..."
          className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none"
        />
        <input
          type="number" required
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Discount Value (%)"
          className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none"
        />
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand-primary text-brand-paper font-bold flex items-center space-x-1">
          <Plus className="w-4 h-4" />
          <span>Add Code</span>
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-white/10 glass-panel font-mono text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="p-4">Code</th>
              <th className="p-4">Description</th>
              <th className="p-4">Type</th>
              <th className="p-4">Value</th>
              <th className="p-4">Min Order</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-slate-950/60">
            {discounts.map(d => (
              <tr key={d.code} className="text-slate-300">
                <td className="p-4 font-bold text-brand-paper">{d.code}</td>
                <td className="p-4 text-slate-400">{d.desc}</td>
                <td className="p-4 text-white">{d.type}</td>
                <td className="p-4 text-emerald-400 font-bold">{d.value}</td>
                <td className="p-4 text-slate-400">{d.min}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => setDiscounts(discounts.filter(x => x.code !== d.code))}
                    className="p-1.5 rounded bg-slate-900 border border-white/10 text-rose-400"
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
