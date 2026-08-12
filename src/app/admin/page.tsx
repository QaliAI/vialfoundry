'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Package, FileCheck, ShoppingCart, AlertTriangle, ArrowUpRight, DollarSign, Users } from 'lucide-react';
import { PRODUCTS } from '../../data/products';
import { BATCH_RECORDS } from '../../data/batches';

export default function AdminDashboardPage() {
  const router = useRouter();

  const totalProducts = PRODUCTS.length;
  const activeBatchesCount = Object.keys(BATCH_RECORDS).length;
  const lowStockProducts = PRODUCTS.filter(p => p.stockCount < 50);

  return (
    <div className="space-y-8">
      
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-xs font-mono text-slate-400">Vial Foundry Operational Metrics</p>
        </div>
        <span className="mono-tag text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
          SYSTEM ACTIVE
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="mono-tag text-[10px] text-slate-400">ACTIVE PRODUCTS</span>
            <Package className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-mono text-3xl font-bold text-white">{totalProducts}</div>
          <div className="text-[10px] text-slate-400">Published in Catalog</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="mono-tag text-[10px] text-slate-400">VERIFIED BATCH COAS</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-3xl font-bold text-emerald-400">{activeBatchesCount}</div>
          <div className="text-[10px] text-slate-400">HPLC Records Active</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="mono-tag text-[10px] text-slate-400">INVENTORY ALERTS</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-3xl font-bold text-amber-400">{lowStockProducts.length}</div>
          <div className="text-[10px] text-slate-400">Stock &lt; 50 Vials</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="mono-tag text-[10px] text-slate-400">DISCOUNT CODES</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-mono text-3xl font-bold text-white">2</div>
          <div className="text-[10px] text-slate-400">Active Promos</div>
        </div>

      </div>

      {/* Low Stock Warnings */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="font-display text-base font-bold text-white flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Low Inventory Warnings</span>
        </h3>

        <div className="overflow-x-auto rounded-xl border border-white/10 font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Category</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-950">
              {lowStockProducts.map(p => (
                <tr key={p.id} className="text-slate-300">
                  <td className="p-3 font-bold text-white">{p.name}</td>
                  <td className="p-3 text-slate-400">{p.sku}</td>
                  <td className="p-3 text-cyan-400">{p.category}</td>
                  <td className="p-3 text-amber-400 font-bold">{p.stockCount} Vials</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => router.push('/admin/inventory')}
                      className="px-3 py-1 rounded bg-slate-900 border border-white/10 hover:border-cyan-500 text-cyan-300 text-[10px]"
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
