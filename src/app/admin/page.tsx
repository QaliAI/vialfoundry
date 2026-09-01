'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, FileCheck, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import { PRODUCTS } from '../../data/products';
import { BATCH_RECORDS } from '../../data/batches';
import { computeFinancialReport } from '../../lib/admin/reporting';

export default function AdminDashboardPage() {
  const router = useRouter();

  const totalProducts = PRODUCTS.length;
  const activeBatchesCount = Object.keys(BATCH_RECORDS).length;
  const lowStockProducts = PRODUCTS.filter(p => p.stockCount < 50);

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch('/api/admin/orders', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders)) {
            setOrders(data.orders);
          }
        }
      } catch (err) {
        console.warn('[admin/dashboard] could not fetch live orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const report = computeFinancialReport(orders);

  return (
    <div className="space-y-8">
      
      <div className="flex items-center justify-between border-b border-brand-graphite/40 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-xs font-mono text-slate-400">Vial Foundry Operational &amp; Financial Metrics</p>
        </div>
        <span className="text-xs text-brand-mineral bg-brand-mineral/20 border border-brand-mineral/40 px-3 py-1 rounded-full font-bold font-mono">
          COMMERCE ENGINE ACTIVE
        </span>
      </div>

      {/* Financial Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-brand-graphite/40 p-5 rounded-2xl border border-brand-graphite/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">COLLECTED REVENUE</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-3xl font-bold text-emerald-400"></div>
          <div className="text-[10px] text-slate-400 font-sans">{report.paidOrdersCount} Paid Orders</div>
        </div>

        <div className="bg-brand-graphite/40 p-5 rounded-2xl border border-brand-graphite/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">PENDING PAYMENTS</span>
            <TrendingUp className="w-4 h-4 text-brand-paper" />
          </div>
          <div className="font-mono text-3xl font-bold text-white"></div>
          <div className="text-[10px] text-slate-400 font-sans">{report.pendingOrdersCount} Awaiting Verification</div>
        </div>

        <div className="bg-brand-graphite/40 p-5 rounded-2xl border border-brand-graphite/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">PUBLISHED CATALOG</span>
            <Package className="w-4 h-4 text-brand-paper" />
          </div>
          <div className="font-mono text-3xl font-bold text-white">{totalProducts}</div>
          <div className="text-[10px] text-slate-400 font-sans">Reference Materials</div>
        </div>

        <div className="bg-brand-graphite/40 p-5 rounded-2xl border border-brand-graphite/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">VERIFIED BATCH COAS</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-3xl font-bold text-emerald-400">{activeBatchesCount}</div>
          <div className="text-[10px] text-slate-400 font-sans">HPLC / MS Lots</div>
        </div>

      </div>

      {/* Low Stock Warnings */}
      <div className="bg-brand-graphite/40 p-6 rounded-2xl border border-brand-graphite/50 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-white flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Low Inventory Warnings</span>
          </h3>
          <span className="text-[10px] text-amber-400 uppercase font-mono">
            {lowStockProducts.length} Items Below Threshold
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-brand-graphite/40 font-sans text-xs">
          <table className="w-full text-left">
            <thead className="bg-brand-ink text-slate-400 uppercase text-[10px] font-mono">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Category</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-graphite/30 bg-brand-ink/40">
              {lowStockProducts.map(p => (
                <tr key={p.id} className="text-slate-300">
                  <td className="p-3 font-bold text-white">{p.name}</td>
                  <td className="p-3 text-slate-400 font-mono">{p.sku}</td>
                  <td className="p-3 text-slate-300">{p.category}</td>
                  <td className="p-3 text-amber-400 font-bold font-mono">{p.stockCount} Vials</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => router.push('/admin/inventory')}
                      className="px-3 py-1 rounded bg-brand-graphite border border-brand-graphite/60 hover:bg-brand-graphite/80 text-white text-[10px] font-sans"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
