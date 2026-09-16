'use client';

import React from 'react';
import { Tag, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { vialFoundryBrandConfig } from '../../../config/brand';

export default function AdminDiscountsPage() {
  const promotions = vialFoundryBrandConfig.promotions;

  return (
    <div className="space-y-8">
      <div className="border-b border-white/10 pb-4">
        <h1 className="font-display text-2xl font-bold text-white">Promotion & Discount Configuration</h1>
        <p className="text-xs font-mono text-slate-400">
          Authoritative promotion rules, active discount rates, and order qualification thresholds
        </p>
      </div>

      {/* Authority Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-brand-accent/20 flex items-start space-x-3 text-xs font-mono text-slate-300">
        <ShieldAlert className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white">Application Configuration Notice:</span>
          <p className="text-slate-400 leading-relaxed">
            Promotion configuration is currently managed in application configuration. All promo codes, percentage rates, and subtotal thresholds are evaluated deterministically server-side in checkout to prevent tampering.
          </p>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 glass-panel font-mono text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="p-4">Promo Code</th>
              <th className="p-4">Customer Label</th>
              <th className="p-4">Discount Type</th>
              <th className="p-4">Discount Value</th>
              <th className="p-4">Minimum Subtotal</th>
              <th className="p-4">Affiliate Commission</th>
              <th className="p-4 text-right">Launch Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-slate-950/60">
            {promotions.map(p => {
              const isPercentage = typeof p.discountRateBps === 'number' && p.discountRateBps > 0;
              const isFixed = typeof p.fixedDiscountCents === 'number' && p.fixedDiscountCents > 0;
              const type = isPercentage ? 'Percentage' : isFixed ? 'Fixed Amount' : 'None';
              const value = isPercentage
                ? `${(p.discountRateBps! / 100).toFixed(0)}%`
                : isFixed
                ? `$${(p.fixedDiscountCents! / 100).toFixed(2)}`
                : '$0.00';
              const minOrder = p.minSubtotalCents
                ? `$${(p.minSubtotalCents / 100).toFixed(2)}`
                : 'None';
              const affRate = p.affiliateCommissionRateBps
                ? `${(p.affiliateCommissionRateBps / 100).toFixed(1)}%`
                : 'Default (10.0%)';

              return (
                <tr key={p.code} className="text-slate-300 hover:bg-white/5">
                  <td className="p-4 font-bold text-white">
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-brand-paper">
                      <Tag className="w-3 h-3 text-brand-accent" />
                      <span>{p.code}</span>
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{p.name}</td>
                  <td className="p-4 text-white">{type}</td>
                  <td className="p-4 text-emerald-400 font-bold">{value}</td>
                  <td className="p-4 text-slate-400">{minOrder}</td>
                  <td className="p-4 text-slate-400">{affRate}</td>
                  <td className="p-4 text-right">
                    {p.enabled ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-white/10">
                        <XCircle className="w-3 h-3" />
                        <span>Disabled</span>
                      </span>
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
