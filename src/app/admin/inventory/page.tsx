'use client';

import React, { useState } from 'react';
import { PRODUCTS } from '../../../data/products';
import { Layers, ArrowUpDown, Plus, Minus, CheckCircle2 } from 'lucide-react';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState(PRODUCTS);
  const [logs, setLogs] = useState<Array<{ id: string; product: string; change: number; type: string; date: string }>>([
    { id: '1', product: 'BPC-157 Reference Standard', change: 50, type: 'Restock', date: '2026-08-01 14:20' },
    { id: '2', product: 'Semaglutide Analytical Standard', change: -5, type: 'Sale Order ORD-9942', date: '2026-08-02 09:12' }
  ]);

  const handleStockAdjust = (id: string, delta: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newQty = Math.max(0, p.stockCount + delta);
        setLogs(l => [{
          id: Date.now().toString(),
          product: p.name,
          change: delta,
          type: 'Manual Admin Adjustment',
          date: new Date().toLocaleString()
        }, ...l]);
        return { ...p, stockCount: newQty };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-white/10 pb-4">
        <h1 className="font-display text-2xl font-bold text-white">Inventory & Audit Transactions</h1>
        <p className="text-xs font-mono text-slate-400">Track stock adjustments, restock transactions, and inventory warnings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Product Inventory Table */}
        <div className="lg:col-span-8 overflow-x-auto rounded-2xl border border-white/10 glass-panel font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Quick Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-950/60">
              {products.map(p => (
                <tr key={p.id} className="text-slate-300">
                  <td className="p-4 font-bold text-white">{p.name}</td>
                  <td className="p-4 text-slate-400">{p.sku}</td>
                  <td className="p-4">
                    <span className={`font-bold ${p.stockCount < 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {p.stockCount} Vials
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleStockAdjust(p.id, -10)}
                      className="px-2.5 py-1 rounded bg-slate-900 border border-white/10 hover:border-rose-400 text-rose-400 font-bold"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => handleStockAdjust(p.id, 10)}
                      className="px-2.5 py-1 rounded bg-slate-900 border border-white/10 hover:border-emerald-400 text-emerald-400 font-bold"
                    >
                      +10
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: Audit Log */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-display text-base font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Transaction Audit Log</span>
          </h3>

          <div className="space-y-3 font-mono text-xs max-h-96 overflow-y-auto">
            {logs.map(log => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span className="line-clamp-1">{log.product}</span>
                  <span className={log.change > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {log.change > 0 ? `+${log.change}` : log.change}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{log.type}</span>
                  <span>{log.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
