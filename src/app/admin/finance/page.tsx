'use client';

import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

/** Collected revenue from our own synchronized records. No profit figure: there is no COGS data. */

const money = (c: number) => `$${((c || 0) / 100).toFixed(2)}`;

export default function AdminFinance() {
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/finance?days=${days}`, { credentials: 'include' });
        if (res.ok) setD(await res.json());
      } finally {
        setLoading(false);
      }
    })();
  }, [days]);

  const exportCsv = (name: string, rows: any[], cols: string[]) => {
    const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => JSON.stringify(r[c] ?? '')).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = `vialfoundry-${name}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const m = d?.metrics;
  const empty = !loading && (m?.totalCountableOrders ?? 0) === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-brand-graphite/40 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Finance</h1>
          <p className="text-xs text-slate-400 mt-1">Money actually collected, net of refunds. Test orders excluded.</p>
        </div>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))}
          className="bg-brand-graphite/40 border border-brand-graphite text-white text-xs rounded-lg px-3 py-2">
          {[7, 30, 90, 365].map((n) => <option key={n} value={n}>Last {n} days</option>)}
        </select>
      </div>

      {empty && (
        <div className="rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40 p-8 text-center text-sm text-slate-400">
          No paid orders yet, so there is nothing to report. These figures fill in automatically once real orders are paid.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Gross collected', money((m?.netRevenueCents ?? 0) + (m?.refundedCents ?? 0))],
          ['Refunds', money(m?.refundedCents ?? 0)],
          ['Net collected', money(m?.netRevenueCents ?? 0)],
          ['Average order', money(m?.averageOrderValueCents ?? 0)],
        ].map(([label, value]) => (
          <div key={label} className="p-5 rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
            <div className="font-display text-2xl font-bold text-white mt-1">{loading ? '—' : value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="By payment method" onExport={d?.revenueByPaymentMethod?.length ? () => exportCsv('payment-methods', d.revenueByPaymentMethod, ['method','orders','revenueCents']) : undefined}>
          {d?.revenueByPaymentMethod?.length ? d.revenueByPaymentMethod.map((r: any) => (
            <Line key={r.method} left={r.method} mid={`${r.orders} orders`} right={money(r.revenueCents)} />
          )) : <NoData loading={loading} />}
        </Card>

        <Card title="Top products" onExport={d?.topProducts?.length ? () => exportCsv('top-products', d.topProducts, ['name','sku','units','revenueCents']) : undefined}>
          {d?.topProducts?.length ? d.topProducts.map((p: any) => (
            <Line key={p.key} left={p.name} mid={`${p.units} units`} right={money(p.revenueCents)} />
          )) : <NoData loading={loading} />}
        </Card>

        <Card title="Promo usage" onExport={d?.promoUsage?.length ? () => exportCsv('promos', d.promoUsage, ['code','orders','revenueCents','discountCents']) : undefined}>
          {d?.promoUsage?.length ? d.promoUsage.map((p: any) => (
            <Line key={p.code} left={p.code} mid={`${p.orders} orders · −${money(p.discountCents)}`} right={money(p.revenueCents)} />
          )) : <NoData loading={loading} />}
        </Card>

        <Card title="Affiliate revenue" onExport={d?.affiliateRevenue?.length ? () => exportCsv('affiliates', d.affiliateRevenue, ['code','orders','revenueCents','commissionCents']) : undefined}>
          {d?.affiliateRevenue?.length ? d.affiliateRevenue.map((a: any) => (
            <Line key={a.code} left={a.code} mid={`${a.orders} orders`} right={`${money(a.revenueCents)} · ${money(a.commissionCents)} owed`} />
          )) : <NoData loading={loading} />}
        </Card>
      </div>

      <Card title={`Revenue by day (last ${days})`} onExport={d?.revenueByDay?.length ? () => exportCsv('revenue-by-day', d.revenueByDay, ['date','orders','revenueCents']) : undefined}>
        {d?.revenueByDay?.some((r: any) => r.revenueCents > 0)
          ? d.revenueByDay.filter((r: any) => r.revenueCents > 0).map((r: any) => (
              <Line key={r.date} left={r.date} mid={`${r.orders} orders`} right={money(r.revenueCents)} />
            ))
          : <NoData loading={loading} />}
      </Card>

      {d?.customers && (m?.paidOrders ?? 0) > 0 && (
        <Card title="Customers">
          <Line left="Unique paying customers" mid="" right={String(d.customers.uniquePaying)} />
          <Line left="Returning" mid="" right={String(d.customers.returning)} />
          <Line left="New" mid="" right={String(d.customers.new)} />
        </Card>
      )}

      {d?.notes && (
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {d.notes.cogs} {d.notes.source}
        </p>
      )}
    </div>
  );
}

function Card({ title, children, onExport }: any) {
  return (
    <div className="rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40 p-5">
      <div className="flex items-center justify-between pb-2">
        <h2 className="font-display text-sm font-bold text-white">{title}</h2>
        {onExport && (
          <button onClick={onExport} className="text-[11px] text-brand-teal hover:text-white flex items-center gap-1">
            <Download className="w-3 h-3" /> CSV
          </button>
        )}
      </div>
      <div className="divide-y divide-brand-graphite/30">{children}</div>
    </div>
  );
}

function Line({ left, mid, right }: any) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm gap-3">
      <span className="text-white truncate">{left}</span>
      <span className="text-xs text-slate-500 hidden sm:block flex-1 text-right pr-3">{mid}</span>
      <span className="text-white font-semibold whitespace-nowrap">{right}</span>
    </div>
  );
}

function NoData({ loading }: { loading: boolean }) {
  return <div className="py-6 text-center text-xs text-slate-500">{loading ? 'Loading…' : 'No data yet.'}</div>;
}
