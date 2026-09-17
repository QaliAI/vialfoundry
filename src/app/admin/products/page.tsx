'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { PRODUCTS } from '../../../data/products';
import { Search, ShieldAlert, ExternalLink, Package } from 'lucide-react';
import { productTitle } from '../../../lib/catalog-display';

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set(PRODUCTS.map(p => p.category));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        (p.casNumber || '').toLowerCase().includes(term) ||
        (p.lotNumber && p.lotNumber.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Product Catalog & Pricing</h1>
          <p className="text-xs font-mono text-slate-400">
            Authoritative catalog specifications, launch pricing, and chemical identifiers
          </p>
        </div>
        <Link
          href="/admin/inventory"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-paper font-display font-semibold text-xs border border-white/10 transition-colors"
        >
          <Package className="w-4 h-4 text-emerald-400" />
          <span>Adjust Live Inventory</span>
        </Link>
      </div>

      {/* Authority Notice */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-brand-accent/20 flex items-start space-x-3 text-xs font-mono text-slate-300">
        <ShieldAlert className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white">Read-Only Source of Truth Notice:</span>
          <p className="text-slate-400 leading-relaxed">
            Product specifications, molecular constants, and retail pricing are code-authoritative in{' '}
            <code className="text-brand-paper bg-white/5 px-1 py-0.5 rounded">src/data/products.ts</code>.
            This ensures deterministic checkout validation and eliminates price-drift vulnerabilities.
            Live stock counts are managed dynamically through the Supabase-backed{' '}
            <Link href="/admin/inventory" className="text-brand-accent underline hover:text-white">
              Inventory console
            </Link>.
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by product name, SKU, CAS, or lot..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-white/15 text-white placeholder:text-slate-500 font-mono text-xs focus:outline-none focus:border-brand-accent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-brand-accent"
        >
          {categories.map(c => (
            <option key={c} value={c}>
              {c === 'all' ? 'All Categories' : c}
            </option>
          ))}
        </select>
      </div>

      {/* Table of Products */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 glass-panel font-mono text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="p-4">Product Name</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Category</th>
              <th className="p-4">Retail Price</th>
              <th className="p-4">Lot Reference</th>
              <th className="p-4">Catalog Stock</th>
              <th className="p-4">Catalog Status</th>
              <th className="p-4 text-right">Storefront</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-slate-950/60">
            {filteredProducts.map(p => {
              const isWithheld = Boolean(p.hiddenFromCatalogReason);
              const isOutOfStock = !p.inStock || p.stockCount <= 0;

              return (
                <tr key={p.id} className="text-slate-300 hover:bg-white/5">
                  <td className="p-4">
                    <div className="font-bold text-white">{productTitle(p)}</div>
                    <div className="text-[10px] text-slate-500">CAS: {p.casNumber}</div>
                  </td>
                  <td className="p-4 text-slate-400">{p.sku}</td>
                  <td className="p-4 text-brand-paper">{p.category}</td>
                  <td className="p-4 text-emerald-400 font-bold">${p.price.toFixed(2)}</td>
                  <td className="p-4 text-slate-400">{p.lotNumber}</td>
                  <td className="p-4 text-slate-300">{p.stockCount}</td>
                  <td className="p-4">
                    {isWithheld ? (
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Withheld
                      </span>
                    ) : isOutOfStock ? (
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        Public
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {!isWithheld ? (
                      <Link
                        href={`/product/${p.id}`}
                        target="_blank"
                        className="inline-flex items-center space-x-1 text-brand-accent hover:text-white"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="text-[10px] text-slate-600">Hidden</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
