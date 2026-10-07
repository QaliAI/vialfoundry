'use client';

import React, { useEffect, useState } from 'react';
import {
  Tag,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Megaphone,
  Calendar,
  Lock,
  Edit2,
  AlertCircle,
  Percent,
} from 'lucide-react';

interface Promotion {
  id?: string;
  code: string;
  name: string;
  description?: string | null;
  discount_type: 'percentage' | 'fixed_amount';
  discount_rate_bps: number;
  fixed_discount_cents: number;
  minimum_subtotal_cents: number;
  first_order_only: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  enabled: boolean;
  max_total_uses?: number | null;
  times_used?: number;
  banner_enabled: boolean;
  banner_message?: string | null;
  banner_cta?: string | null;
  affiliate_stack_policy: 'exclusive' | 'allow_override';
  affiliate_commission_override_bps?: number | null;
}

export default function AdminDiscountsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal / Editor State
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Partial<Promotion>>({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_rate_bps: 2000,
    fixed_discount_cents: 0,
    minimum_subtotal_cents: 0,
    first_order_only: true,
    enabled: true,
    banner_enabled: true,
    banner_message: '20% OFF YOUR FIRST ORDER · CODE FOUNDRY20 · APPLY OFFER',
    banner_cta: 'APPLY OFFER',
    affiliate_stack_policy: 'exclusive',
    affiliate_commission_override_bps: 800,
  });

  const fetchPromotions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/promotions');
      const data = await res.json();
      if (data.success && Array.isArray(data.promotions)) {
        setPromotions(data.promotions);
      } else {
        setError(data.error || 'Failed to load promotions');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to promotions server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleToggleEnable = async (promo: Promotion) => {
    if (!promo.id) return;
    try {
      const res = await fetch(`/api/admin/promotions/${promo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !promo.enabled }),
      });
      const data = await res.json();
      if (data.success) {
        setPromotions((prev) =>
          prev.map((p) => (p.id === promo.id ? { ...p, enabled: !p.enabled } : p))
        );
        setSuccess(`Promotion ${promo.code} ${!promo.enabled ? 'activated' : 'disabled'}.`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleBanner = async (promo: Promotion) => {
    if (!promo.id) return;
    try {
      const res = await fetch(`/api/admin/promotions/${promo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banner_enabled: !promo.banner_enabled }),
      });
      const data = await res.json();
      if (data.success) {
        setPromotions((prev) =>
          prev.map((p) => (p.id === promo.id ? { ...p, banner_enabled: !p.banner_enabled } : p))
        );
        setSuccess(`Banner visibility updated for ${promo.code}.`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPromo),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setSuccess(`Promotion ${editingPromo.code?.toUpperCase()} saved successfully.`);
        setTimeout(() => setSuccess(null), 3000);
        await fetchPromotions();
      } else {
        setError(data.error || 'Failed to save promotion');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openNewPromoModal = () => {
    setEditingPromo({
      code: '',
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_rate_bps: 2000,
      fixed_discount_cents: 0,
      minimum_subtotal_cents: 0,
      first_order_only: true,
      enabled: true,
      banner_enabled: true,
      banner_message: '20% OFF YOUR FIRST ORDER · CODE FOUNDRY20 · APPLY OFFER',
      banner_cta: 'APPLY OFFER',
      affiliate_stack_policy: 'exclusive',
      affiliate_commission_override_bps: 800,
    });
    setShowModal(true);
  };

  const openEditModal = (p: Promotion) => {
    setEditingPromo({ ...p });
    setShowModal(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center space-x-2">
            <span>Promotion & Campaign Engine</span>
          </h1>
          <p className="text-xs font-mono text-slate-400">
            Database-authoritative promotion rules, announcement banners, first-order enforcement, and partner overrides
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchPromotions}
            className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Refresh Promotions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openNewPromoModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-brand-teal hover:bg-brand-teal/90 text-white font-medium text-xs transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Promotion</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2 font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 font-mono">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Authority Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-brand-teal/20 flex items-start space-x-3 text-xs font-mono text-slate-300">
        <ShieldCheck className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white">Database-Authoritative Promotion Architecture</span>
          <p className="text-slate-400 leading-relaxed">
            All promotional codes, first-order restrictions, subtotal thresholds, and banner states are saved to Supabase and evaluated strictly server-side at checkout.
          </p>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 glass-panel font-mono text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="p-4">Promo Code</th>
              <th className="p-4">Discount</th>
              <th className="p-4">Min Subtotal</th>
              <th className="p-4">Audience</th>
              <th className="p-4">Announcement Banner</th>
              <th className="p-4">Affiliate Override</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-slate-950/60">
            {promotions.map((p) => {
              const isPct = p.discount_type === 'percentage';
              const displayVal = isPct
                ? `${(p.discount_rate_bps / 100).toFixed(0)}% OFF`
                : `$${(p.fixed_discount_cents / 100).toFixed(2)} OFF`;
              const minSpend = p.minimum_subtotal_cents
                ? `$${(p.minimum_subtotal_cents / 100).toFixed(2)}`
                : 'None';
              const affOverride = p.affiliate_commission_override_bps
                ? `${(p.affiliate_commission_override_bps / 100).toFixed(1)}%`
                : 'Default (10%)';

              return (
                <tr key={p.code} className="text-slate-300 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white">
                    <div className="space-y-1">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-brand-paper">
                        <Tag className="w-3 h-3 text-brand-teal" />
                        <span className="font-semibold">{p.code}</span>
                      </span>
                      {p.name && <div className="text-[11px] text-slate-400 font-normal">{p.name}</div>}
                    </div>
                  </td>
                  <td className="p-4 text-emerald-400 font-bold">{displayVal}</td>
                  <td className="p-4 text-slate-400">{minSpend}</td>
                  <td className="p-4">
                    {p.first_order_only ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        <Lock className="w-3 h-3" />
                        <span>First Order Only</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">All Customers</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleBanner(p)}
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded text-[10px] font-medium border transition-colors ${
                        p.banner_enabled
                          ? 'bg-brand-teal/20 text-brand-teal border-brand-teal/40'
                          : 'bg-slate-800/40 text-slate-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Megaphone className="w-3 h-3" />
                      <span>{p.banner_enabled ? 'Active on Banner' : 'Banner Off'}</span>
                    </button>
                  </td>
                  <td className="p-4 text-slate-400">{affOverride}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleEnable(p)}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded text-[10px] font-semibold border transition-colors ${
                        p.enabled
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700/50'
                      }`}
                    >
                      {p.enabled ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{p.enabled ? 'Active' : 'Disabled'}</span>
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Edit Promotion"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
          <div className="bg-slate-900 border border-white/15 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                {editingPromo.id ? `Edit Promotion: ${editingPromo.code}` : 'Create New Promotion'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Promo Code *</label>
                  <input
                    type="text"
                    required
                    value={editingPromo.code || ''}
                    onChange={(e) =>
                      setEditingPromo({ ...editingPromo, code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. FOUNDRY20"
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white font-bold tracking-wider"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Customer Label *</label>
                  <input
                    type="text"
                    required
                    value={editingPromo.name || ''}
                    onChange={(e) => setEditingPromo({ ...editingPromo, name: e.target.value })}
                    placeholder="e.g. 20% First Order Discount"
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description / Internal Notes</label>
                <textarea
                  rows={2}
                  value={editingPromo.description || ''}
                  onChange={(e) =>
                    setEditingPromo({ ...editingPromo, description: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white"
                  placeholder="Terms, campaign source, or research notes"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Discount Type</label>
                  <select
                    value={editingPromo.discount_type || 'percentage'}
                    onChange={(e) =>
                      setEditingPromo({
                        ...editingPromo,
                        discount_type: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">
                    {editingPromo.discount_type === 'percentage'
                      ? 'Discount Rate (Basis Points: 2000 = 20%)'
                      : 'Fixed Discount (Cents: 2500 = $25.00)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={
                      editingPromo.discount_type === 'percentage'
                        ? editingPromo.discount_rate_bps || 0
                        : editingPromo.fixed_discount_cents || 0
                    }
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (editingPromo.discount_type === 'percentage') {
                        setEditingPromo({ ...editingPromo, discount_rate_bps: val });
                      } else {
                        setEditingPromo({ ...editingPromo, fixed_discount_cents: val });
                      }
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Minimum Subtotal (Cents)</label>
                  <input
                    type="number"
                    value={editingPromo.minimum_subtotal_cents || 0}
                    onChange={(e) =>
                      setEditingPromo({
                        ...editingPromo,
                        minimum_subtotal_cents: Number(e.target.value),
                      })
                    }
                    placeholder="e.g. 20000 for $200"
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Affiliate Commission (BPS)</label>
                  <input
                    type="number"
                    value={editingPromo.affiliate_commission_override_bps || 800}
                    onChange={(e) =>
                      setEditingPromo({
                        ...editingPromo,
                        affiliate_commission_override_bps: Number(e.target.value),
                      })
                    }
                    placeholder="800 for 8.00%"
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Restrictions */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-3">
                <label className="flex items-center space-x-2 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingPromo.first_order_only)}
                    onChange={(e) =>
                      setEditingPromo({ ...editingPromo, first_order_only: e.target.checked })
                    }
                    className="rounded bg-slate-900 border-white/20 text-brand-teal focus:ring-0"
                  />
                  <span className="font-semibold">Enforce First-Order Only</span>
                </label>
                <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                  Server strictly rejects this code if customer email has any prior paid production order.
                </p>

                <label className="flex items-center space-x-2 text-white cursor-pointer pt-2 border-t border-white/5">
                  <input
                    type="checkbox"
                    checked={Boolean(editingPromo.banner_enabled)}
                    onChange={(e) =>
                      setEditingPromo({ ...editingPromo, banner_enabled: e.target.checked })
                    }
                    className="rounded bg-slate-900 border-white/20 text-brand-teal focus:ring-0"
                  />
                  <span className="font-semibold">Show on Announcement Banner</span>
                </label>
              </div>

              {editingPromo.banner_enabled && (
                <div className="space-y-3 p-3.5 rounded-xl bg-slate-950 border border-brand-teal/20">
                  <div>
                    <label className="block text-slate-400 mb-1">Banner Announcement Text</label>
                    <input
                      type="text"
                      value={editingPromo.banner_message || ''}
                      onChange={(e) =>
                        setEditingPromo({ ...editingPromo, banner_message: e.target.value })
                      }
                      placeholder="e.g. 20% OFF YOUR FIRST ORDER · CODE FOUNDRY20 · APPLY OFFER"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Banner CTA Button Label</label>
                    <input
                      type="text"
                      value={editingPromo.banner_cta || 'APPLY OFFER'}
                      onChange={(e) =>
                        setEditingPromo({ ...editingPromo, banner_cta: e.target.value })
                      }
                      placeholder="e.g. APPLY OFFER"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-[11px]"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-brand-teal hover:bg-brand-teal/90 text-white font-bold transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
