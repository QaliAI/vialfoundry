import React from 'react';
import { verifyAdminSession } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import {
  TrendingUp,
  DollarSign,
  Tag,
  Share2,
  Users,
  Percent,
  Compass,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminMarketingPage() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    redirect('/admin/login');
  }

  const supabase = createAdminClient();
  let orders: any[] = [];
  let promotions: any[] = [];
  let affiliates: any[] = [];

  if (supabase) {
    const [ordersRes, promosRes, affsRes] = await Promise.all([
      supabase
        .from('manual_orders')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase.from('promotions').select('*'),
      supabase.from('affiliates').select('*'),
    ]);

    orders = ordersRes.data || [];
    promotions = promosRes.data || [];
    affiliates = affsRes.data || [];
  }

  // Filter for production valid orders (exclude test orders)
  const productionOrders = orders.filter((o) => !o.is_test && o.stripe_livemode !== false);
  const paidOrders = productionOrders.filter((o) => o.payment_status === 'paid' || o.status === 'paid');

  // Overall metrics
  const totalRevenueCents = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalSubtotalCents = paidOrders.reduce((sum, o) => sum + (o.subtotal_amount || 0), 0);
  const totalDiscountCents = paidOrders.reduce((sum, o) => sum + (o.discount_amount || 0), 0);
  const aovCents = paidOrders.length > 0 ? Math.round(totalRevenueCents / paidOrders.length) : 0;

  // First-order vs Repeat-order split
  const emailCounts = new Map<string, number>();
  for (const o of paidOrders) {
    const em = (o.customer_email || '').toLowerCase().trim();
    if (em) emailCounts.set(em, (emailCounts.get(em) || 0) + 1);
  }

  let firstOrderRevenueCents = 0;
  let repeatOrderRevenueCents = 0;
  let firstOrderCount = 0;
  let repeatOrderCount = 0;

  for (const o of paidOrders) {
    const em = (o.customer_email || '').toLowerCase().trim();
    const count = emailCounts.get(em) || 1;
    if (count > 1) {
      repeatOrderRevenueCents += o.total_amount || 0;
      repeatOrderCount++;
    } else {
      firstOrderRevenueCents += o.total_amount || 0;
      firstOrderCount++;
    }
  }

  // Attribution by Channel / UTM Source
  const channelBreakdown = new Map<string, { orders: number; revenueCents: number }>();
  for (const o of paidOrders) {
    const channel = o.last_touch_source || o.first_touch_source || 'direct / organic';
    const curr = channelBreakdown.get(channel) || { orders: 0, revenueCents: 0 };
    channelBreakdown.set(channel, {
      orders: curr.orders + 1,
      revenueCents: curr.revenueCents + (o.total_amount || 0),
    });
  }

  // Attribution by Campaign
  const campaignBreakdown = new Map<string, { orders: number; revenueCents: number }>();
  for (const o of paidOrders) {
    const campaign = o.last_touch_campaign || o.first_touch_campaign || 'none';
    const curr = campaignBreakdown.get(campaign) || { orders: 0, revenueCents: 0 };
    campaignBreakdown.set(campaign, {
      orders: curr.orders + 1,
      revenueCents: curr.revenueCents + (o.total_amount || 0),
    });
  }

  // Breakdown by Promo Code
  const promoBreakdown = new Map<string, { orders: number; discountCents: number; revenueCents: number }>();
  for (const o of paidOrders) {
    const code = o.promo_code ? o.promo_code.toUpperCase() : 'NO_CODE';
    const curr = promoBreakdown.get(code) || { orders: 0, discountCents: 0, revenueCents: 0 };
    promoBreakdown.set(code, {
      orders: curr.orders + 1,
      discountCents: curr.discountCents + (o.discount_amount || 0),
      revenueCents: curr.revenueCents + (o.total_amount || 0),
    });
  }

  // Breakdown by Affiliate Partner
  const affiliateBreakdown = new Map<string, { orders: number; revenueCents: number; commissionCents: number }>();
  for (const o of paidOrders) {
    if (o.affiliate_code) {
      const code = o.affiliate_code.toUpperCase();
      const curr = affiliateBreakdown.get(code) || { orders: 0, revenueCents: 0, commissionCents: 0 };
      affiliateBreakdown.set(code, {
        orders: curr.orders + 1,
        revenueCents: curr.revenueCents + (o.total_amount || 0),
        commissionCents: curr.commissionCents + (o.affiliate_commission_amount || 0),
      });
    }
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-graphite/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              Growth Engine
            </span>
            <span className="text-xs text-slate-400">· Production Attributed Data</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-100 mt-1">
            Marketing & Attribution Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live revenue breakdown by channel, UTM campaigns, promotional codes, and affiliate partners.
          </p>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40 space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Attributed Revenue</span>
          </div>
          <div className="text-2xl font-mono font-bold text-slate-100">
            ${(totalRevenueCents / 100).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500">Across {paidOrders.length} paid orders</div>
        </div>

        <div className="p-5 rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40 space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-brand-accent" />
            <span>Average Order Value</span>
          </div>
          <div className="text-2xl font-mono font-bold text-slate-100">
            ${(aovCents / 100).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500">Gross revenue per checkout</div>
        </div>

        <div className="p-5 rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40 space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>Promo Discounts Given</span>
          </div>
          <div className="text-2xl font-mono font-bold text-amber-400">
            ${(totalDiscountCents / 100).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500">
            {totalSubtotalCents > 0
              ? `${((totalDiscountCents / totalSubtotalCents) * 100).toFixed(1)}% effective discount rate`
              : 'No discounts redeemed'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40 space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Repeat Customer Ratio</span>
          </div>
          <div className="text-2xl font-mono font-bold text-slate-100">
            {paidOrders.length > 0
              ? `${((repeatOrderCount / paidOrders.length) * 100).toFixed(1)}%`
              : '0.0%'}
          </div>
          <div className="text-[11px] text-slate-500">
            ${(repeatOrderRevenueCents / 100).toFixed(2)} repeat revenue
          </div>
        </div>
      </div>

      {/* Split: First Order vs Repeat Order */}
      <div className="p-6 rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40 space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-accent" />
          <span>First-Order vs Repeat-Order Economics</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-brand-ink/40 border border-brand-graphite/30 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">New Customer First Orders</span>
              <span className="font-mono text-emerald-400">{firstOrderCount} orders</span>
            </div>
            <div className="text-xl font-mono font-bold text-slate-100">
              ${(firstOrderRevenueCents / 100).toFixed(2)}
            </div>
            <div className="w-full bg-brand-graphite/30 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{
                  width: totalRevenueCents > 0 ? `${(firstOrderRevenueCents / totalRevenueCents) * 100}%` : '0%',
                }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-brand-ink/40 border border-brand-graphite/30 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Repeat Customer Orders</span>
              <span className="font-mono text-blue-400">{repeatOrderCount} orders</span>
            </div>
            <div className="text-xl font-mono font-bold text-slate-100">
              ${(repeatOrderRevenueCents / 100).toFixed(2)}
            </div>
            <div className="w-full bg-brand-graphite/30 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{
                  width: totalRevenueCents > 0 ? `${(repeatOrderRevenueCents / totalRevenueCents) * 100}%` : '0%',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Promo Codes & Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Promo Codes */}
        <div className="p-6 rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-accent" />
              <span>Promotional Code Performance</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-graphite/40 text-slate-400 font-semibold">
                  <th className="pb-2">Code</th>
                  <th className="pb-2 text-right">Orders</th>
                  <th className="pb-2 text-right">Discount</th>
                  <th className="pb-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-graphite/20">
                {Array.from(promoBreakdown.entries()).map(([code, stats]) => (
                  <tr key={code} className="hover:bg-brand-graphite/10">
                    <td className="py-2.5 font-mono text-slate-200">{code}</td>
                    <td className="py-2.5 text-right font-mono text-slate-400">{stats.orders}</td>
                    <td className="py-2.5 text-right font-mono text-amber-400">
                      -${(stats.discountCents / 100).toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-100">
                      ${(stats.revenueCents / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Traffic Channels / UTM Source */}
        <div className="p-6 rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-accent" />
              <span>Revenue by Channel / UTM Source</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-graphite/40 text-slate-400 font-semibold">
                  <th className="pb-2">Source</th>
                  <th className="pb-2 text-right">Orders</th>
                  <th className="pb-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-graphite/20">
                {Array.from(channelBreakdown.entries()).map(([source, stats]) => (
                  <tr key={source} className="hover:bg-brand-graphite/10">
                    <td className="py-2.5 font-mono text-slate-200">{source}</td>
                    <td className="py-2.5 text-right font-mono text-slate-400">{stats.orders}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-100">
                      ${(stats.revenueCents / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Affiliate Partner Revenue */}
      <div className="p-6 rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40 space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-brand-accent" />
          <span>Affiliate Partner Attributed Orders</span>
        </h2>
        {affiliateBreakdown.size === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-brand-graphite/40 rounded-xl">
            No partner orders recorded yet. As affiliates drive orders via /r/[code] or their partner codes, revenue and commission will show here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-graphite/40 text-slate-400 font-semibold">
                  <th className="pb-2">Partner Code</th>
                  <th className="pb-2 text-right">Attributed Orders</th>
                  <th className="pb-2 text-right">Gross Order Total</th>
                  <th className="pb-2 text-right">Commission Accrued</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-graphite/20">
                {Array.from(affiliateBreakdown.entries()).map(([code, stats]) => (
                  <tr key={code} className="hover:bg-brand-graphite/10">
                    <td className="py-2.5 font-mono text-slate-200">{code}</td>
                    <td className="py-2.5 text-right font-mono text-slate-400">{stats.orders}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-100">
                      ${(stats.revenueCents / 100).toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-emerald-400">
                      ${(stats.commissionCents / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
