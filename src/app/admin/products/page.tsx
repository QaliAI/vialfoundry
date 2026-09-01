'use client';

import React, { useState } from 'react';
import { PRODUCTS } from '../../../data/products';
import { Product } from '../../../types';
import { Plus, Edit2, Trash2, ShieldCheck, Search, CheckCircle2 } from 'lucide-react';

export default function AdminProductsPage() {
  const [productList, setProductList] = useState<Product[]>(PRODUCTS);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    casNumber: '',
    molecularWeight: '',
    chemicalFormula: '',
    category: 'Reference Materials',
    size: '5 mg Lyophilized Vial',
    price: 64.00,
    purityPercentage: 99.50,
    lotNumber: 'LOT-VF-8842',
    stockCount: 100
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProductList(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...formData } as Product : p));
      setEditingProduct(null);
    } else {
      const newProd: Product = {
        id: `vf-std-${Date.now()}`,
        sku: formData.sku || `VF-SKU-${Math.floor(Math.random()*1000)}`,
        name: formData.name || 'New Reference Standard',
        casNumber: formData.casNumber || '000-00-0',
        chemicalFormula: formData.chemicalFormula || 'C60H90N16O20',
        molecularWeight: formData.molecularWeight || '1000 g/mol',
        category: formData.category as any || 'Reference Materials',
        size: formData.size || '5 mg Lyophilized Vial',
        purityPercentage: formData.purityPercentage || 99.5,
        lotNumber: formData.lotNumber || 'LOT-VF-8842',
        price: formData.price || 64.0,
        inStock: true,
        stockCount: formData.stockCount || 100,
        description: 'Synthetic reference material verified for analytical testing.',
        materialNotes: [],
        storageConditions: 'Store at -20°C',
        appearance: 'White lyophilized powder',
        solubility: 'Soluble in sterile water',
        image: '/assets/vials/single-vial-dark.webp',
        transparentImage: '/assets/vials/vial-transparent.webp',
        coaAvailable: true,
        coaDate: '2026-08-01'
      };
      setProductList([newProd, ...productList]);
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Products CRUD Management</h1>
          <p className="text-xs font-mono text-slate-400">Manage catalog reference materials, pricing, and active inventory</p>
        </div>
        <button
          onClick={() => {
            setFormData({
              name: '', sku: `VF-SKU-${Math.floor(Math.random()*1000)}`,
              casNumber: '', price: 64.0, purityPercentage: 99.5, stockCount: 100
            });
            setIsCreating(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-primary text-brand-paper font-display font-bold text-xs hover:bg-brand-graphite"
        >
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </button>
      </div>

      {/* Create / Edit Modal */}
      {(isCreating || editingProduct) && (
        <form onSubmit={handleSave} className="glass-panel p-6 rounded-2xl border border-white/15 space-y-4 max-w-2xl font-mono text-xs">
          <h3 className="font-display text-lg font-bold text-white">
            {editingProduct ? `Edit ${editingProduct.name}` : 'Create New Catalog Product'}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300">Product Name</label>
              <input
                type="text" required
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300">SKU Code</label>
              <input
                type="text" required
                value={formData.sku || ''}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300">CAS Number</label>
              <input
                type="text"
                value={formData.casNumber || ''}
                onChange={e => setFormData({ ...formData, casNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300">Price ($)</label>
              <input
                type="number" step="0.01" required
                value={formData.price || 0}
                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300">Purity %</label>
              <input
                type="number" step="0.01" required
                value={formData.purityPercentage || 99.5}
                onChange={e => setFormData({ ...formData, purityPercentage: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button type="submit" className="px-5 py-2 rounded-xl bg-brand-primary text-brand-paper font-bold">
              Save Product
            </button>
            <button
              type="button"
              onClick={() => { setIsCreating(false); setEditingProduct(null); }}
              className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table of Products */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 glass-panel font-mono text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Purity %</th>
              <th className="p-4">Lot Code</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-slate-950/60">
            {productList.map(p => (
              <tr key={p.id} className="text-slate-300 hover:bg-white/5">
                <td className="p-4 font-bold text-white">{p.name}</td>
                <td className="p-4 text-slate-400">{p.sku}</td>
                <td className="p-4 text-brand-paper">{p.category}</td>
                <td className="p-4 text-white font-bold">${p.price.toFixed(2)}</td>
                <td className="p-4 text-emerald-400 font-bold">{p.purityPercentage}%</td>
                <td className="p-4 text-slate-300">{p.lotNumber}</td>
                <td className="p-4 text-slate-300">{p.stockCount}</td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => { setEditingProduct(p); setFormData(p); }}
                    className="p-1.5 rounded bg-slate-900 border border-white/10 hover:border-brand-graphite text-brand-paper"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setProductList(productList.filter(x => x.id !== p.id))}
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
