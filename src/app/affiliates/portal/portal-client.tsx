'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Copy,
  Check,
  LogOut,
  MousePointerClick,
  ShoppingBag,
  Percent,
  Clock,
  CheckCircle2,
  Tag,
  ShieldCheck,
  Wallet,
  ExternalLink,
} from 'lucide-react';

export interface PortalClientProps {
  partner: {
    id: string;
    name: string;
    email: string;
    code: string;
    status: string;
    commissionRateBps: number;
    customerDiscountBps: number;
    payoutMethod: string;
  };
  metrics: {
    clicksCount: number;
    ordersCount: number;
    lifetimeEarningsCents: number;
    pendingCommissionCents: number;
    paidCommissionCents: number;
  };
  orders: Array<{
    id: string;
    orderNumber: string;
    createdAt: string;
    subtotalCents: number;
    commissionRateBps: number;
    commissionCents: number;
    status: string;
  }>;
}

export function AffiliatePortalClient({ partner, metrics, orders }: PortalClientProps) {
  const router = useRouter();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const referralUrl = `https://www.vialfoundry.com/r/${partner.code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(partner.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/affiliates/auth/logout', { method: 'POST' });
      router.push('/affiliates/login');
      router.refresh();
    } catch {
      window.location.href = '/affiliates/login';
    }
  };

  const conversionRate =
    metrics.clicksCount > 0
      ? ((metrics.ordersCount / metrics.clicksCount) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="pt-28 pb-24 min-h-screen bg-brand-canvas px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-brand-ink bg-brand-surface-muted px-2 py-0.5 rounded border border-brand-border">
                Partner Dashboard
              </span>
              <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                {partner.status}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-ink">
              {partner.name}
            </h1>
            <p className="text-xs text-brand-steel font-mono">{partner.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="px-3.5 py-2 rounded-xl bg-brand-paper hover:bg-brand-canvas border border-brand-border text-xs font-sans font-semibold text-brand-steel hover:text-brand-ink transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>

        {/* Share Tools: Link & Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Custom Referral Link */}
          <div className="p-5 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans font-semibold text-brand-steel flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-brand-accent" />
                Custom Referral Link
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-medium">30-day cookie</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralUrl}
                className="flex-1 px-3 py-2 rounded-xl bg-brand-canvas border border-brand-border font-mono text-xs text-brand-ink select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-brand-ink hover:bg-brand-graphite text-brand-paper text-xs font-sans font-bold transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
            <p className="text-[11px] font-sans text-brand-steel">
              Visitors arriving via this link receive cookie attribution and automatic partner discount.
            </p>
          </div>

          {/* Partner Promo Code */}
          <div className="p-5 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans font-semibold text-brand-steel flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand-accent" />
                Partner Promo Code
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-medium">
                {(partner.customerDiscountBps / 100).toFixed(0)}% Off for Audience
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={partner.code}
                className="flex-1 px-3 py-2 rounded-xl bg-brand-canvas border border-brand-border font-mono text-xs text-brand-ink font-bold select-all focus:outline-none tracking-wider"
              />
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-xl bg-brand-ink hover:bg-brand-graphite text-brand-paper text-xs font-sans font-bold transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <p className="text-[11px] font-sans text-brand-steel">
              Enterable directly at checkout or in the cart promo field.
            </p>
          </div>
        </div>

        {/* Economics Banner */}
        <div className="p-4 rounded-xl bg-brand-paper border border-brand-border flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
          <div className="flex items-center gap-2 text-brand-ink font-semibold">
            <Percent className="w-4 h-4 text-brand-accent" />
            <span>Commission Terms:</span>
            <span className="font-mono text-emerald-400">{(partner.commissionRateBps / 100).toFixed(1)}% Standard</span>
            <span className="text-brand-steel font-normal">·</span>
            <span className="text-brand-steel font-normal">8.0% override on FOUNDRY20 promotional orders</span>
          </div>
          <div className="flex items-center gap-2 text-brand-steel">
            <Wallet className="w-3.5 h-3.5" />
            <span>Payout Channel:</span>
            <span className="font-medium text-brand-ink">{partner.payoutMethod}</span>
          </div>
        </div>

        {/* Performance Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-1">
            <div className="text-[11px] font-sans text-brand-steel flex items-center gap-1">
              <MousePointerClick className="w-3.5 h-3.5 text-brand-accent" />
              <span>Clicks</span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-brand-ink">
              {metrics.clicksCount.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-1">
            <div className="text-[11px] font-sans text-brand-steel flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-brand-accent" />
              <span>Attributed Orders</span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-brand-ink">
              {metrics.ordersCount.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-1">
            <div className="text-[11px] font-sans text-brand-steel flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-brand-accent" />
              <span>Conversion Rate</span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-brand-ink">
              {conversionRate}%
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-1">
            <div className="text-[11px] font-sans text-brand-steel flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Pending Commission</span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-amber-400">
              ${(metrics.pendingCommissionCents / 100).toFixed(2)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-1">
            <div className="text-[11px] font-sans text-brand-steel flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Paid Out</span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-400">
              ${(metrics.paidCommissionCents / 100).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Attributed Orders History (ZERO PII) */}
        <div className="p-6 sm:p-8 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-brand-ink">
              Recent Attributed Orders
            </h2>
            <span className="text-xs font-mono text-brand-steel">
              Showing {orders.length} order{orders.length === 1 ? '' : 's'}
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed border-brand-border rounded-xl">
              <ShoppingBag className="w-8 h-8 text-brand-steel mx-auto" />
              <p className="text-xs font-sans text-brand-steel">
                No orders attributed yet. Share your referral link or partner code to start earning.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-brand-border text-brand-steel font-semibold">
                    <th className="pb-3 font-mono">Order #</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right">Subtotal</th>
                    <th className="pb-3 text-right">Commission Rate</th>
                    <th className="pb-3 text-right font-mono">Earned</th>
                    <th className="pb-3 text-right">Payout Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-brand-canvas/50">
                      <td className="py-3 font-mono font-medium text-brand-ink">{o.orderNumber}</td>
                      <td className="py-3 text-brand-steel">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right font-mono text-brand-ink">
                        ${(o.subtotalCents / 100).toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-mono text-brand-steel">
                        {(o.commissionRateBps / 100).toFixed(1)}%
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-400">
                        ${(o.commissionCents / 100).toFixed(2)}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase ${
                            o.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {o.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RUO Compliance Safeguard Notice */}
        <div className="p-4 rounded-xl bg-brand-paper border border-brand-border text-xs font-sans text-brand-steel leading-relaxed flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-brand-ink block">
              Research Use Only (RUO) Compliance Requirement
            </span>
            <span>
              All materials supplied by Vial Foundry are strictly for research and laboratory evaluation.
              Partners and affiliates are prohibited from making human-consumption, therapeutic, medical, or diagnostic claims in connection with their referral links or codes.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
