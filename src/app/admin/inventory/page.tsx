'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Layers } from 'lucide-react';

interface InventoryRow {
  id: string;
  sku: string;
  name: string;
  inventory_quantity: number;
}

interface LogRow {
  id: string;
  product_id: string;
  transaction_type: string;
  quantity_change: number;
  reason: string | null;
  created_by: string | null;
  created_at: string;
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<InventoryRow[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/inventory', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setProducts(data.products || []);
    setLogs(data.logs || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const adjust = async (id: string, delta: number) => {
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, delta }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMsg(data.error || 'Adjustment failed.');
      } else {
        setMsg(`On hand is now ${data.next}.`);
        await load();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-white/10 pb-4">
        <h1 className="font-display text-2xl font-bold text-white">Inventory & Audit Transactions</h1>
        <p className="text-xs font-mono text-slate-400">Supabase on-hand quantity. Checkout reads this same column.</p>
      </div>
      {msg && <div className="p-3 rounded-xl bg-brand-graphite/40 border border-brand-graphite text-xs text-white">{msg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 overflow-x-auto rounded-2xl border border-white/10 glass-panel font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">SKU</th>
                <th className="p-4">On hand</th>
                <th className="p-4 text-right">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-950/60">
              {products.map((p) => (
                <tr key={p.id} className="text-slate-300">
                  <td className="p-4 font-bold text-white">{p.name}</td>
                  <td className="p-4 text-slate-400">{p.sku}</td>
                  <td className="p-4">
                    <span className={`font-bold ${p.inventory_quantity < 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {p.inventory_quantity}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button disabled={busy} onClick={() => adjust(p.id, -10)}
                      className="px-2.5 py-1 rounded bg-slate-900 border border-white/10 hover:border-rose-400 text-rose-400 font-bold disabled:opacity-40">
                      -10
                    </button>
                    <button disabled={busy} onClick={() => adjust(p.id, 10)}
                      className="px-2.5 py-1 rounded bg-slate-900 border border-white/10 hover:border-emerald-400 text-emerald-400 font-bold disabled:opacity-40">
                      +10
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-display text-base font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-brand-paper" />
            <span>Transaction Audit Log</span>
          </h3>
          <div className="space-y-3 font-mono text-xs max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span className="line-clamp-1">{log.reason || log.transaction_type}</span>
                  <span className={log.quantity_change > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {log.quantity_change > 0 ? `+${log.quantity_change}` : log.quantity_change}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{log.created_by || 'system'}</span>
                  <span>{new Date(log.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
