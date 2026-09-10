'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign, ShoppingCart, Clock, PackageCheck, Truck, TrendingUp,
  AlertTriangle, Share2, ArrowRight, Inbox,
} from 'lucide-react';

/**
 * Mission control.
 *
 * Every figure is measured from real order rows. When there is no data the
 * panel says so — it never shows a placeholder number that could be mistaken
 * for a real one.
 */

interface Metrics {
  todayRevenueCents: number;
  netRevenueCents: number;
  refundedCents: number;
  paidOrders: number;
  awaitingPayment: number;
  toFulfil: number;
  shippedToday: number;
  averageOrderValueCents: number;
  pendingCommissionCents: number;
  totalCountableOrders: number;
}

interface Dash {
  metrics: Metrics;
  recentOrders: any[];
  needsAction: any[];
  lowStock: any[];
  outOfStock: any[];
  lowStockThreshold: number;
  inquiries: any[];
  affiliateApplications: any[];
}

const money = (c: number) => `$${((c || 0) / 100).toFixed(2)}`;

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<Dash | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/dashboard', { credentials: 'include' });
        if (res.status === 401) {
          setUnauthorized(true);
          return;
        }
        if (res.ok) setData(await res.json());
      } catch (err) {
        console.warn('[admin/dashboard] load failed:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (unauthorized) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-4">
        <p className="text-slate-300">Your admin session has expired.</p>
        <button
          onClick={() => router.push('/admin/login')}
          className="px-5 py-2.5 rounded-xl bg-white text-brand-ink font-semibold text-sm"
        >
          Sign in again
        </button>
      </div>
    );
  }

  const m = data?.metrics;

  const tiles = [
    { label: "Today's revenue", value: money(m?.todayRevenueCents ?? 0), icon: DollarSign },
    { label: 'Paid orders', value: String(m?.paidOrders ?? 0), icon: ShoppingCart },
    { label: 'Awaiting payment', value: String(m?.awaitingPayment ?? 0), icon: Clock },
    { label: 'To fulfil', value: String(m?.toFulfil ?? 0), icon: PackageCheck, href: '/admin/orders' },
    { label: 'Shipped today', value: String(m?.shippedToday ?? 0), icon: Truck },
    { label: 'Average order', value: money(m?.averageOrderValueCents ?? 0), icon: TrendingUp },
    { label: 'Low stock', value: String(data?.lowStock?.length ?? 0), icon: AlertTriangle, href: '/admin/inventory' },
    { label: 'Commission owed', value: money(m?.pendingCommissionCents ?? 0), icon: Share2, href: '/admin/affiliates' },
  ];

  return (
    <div className="space-y-8">
      <div className="border-b border-brand-graphite/40 pb-4">
        <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-xs text-slate-400 mt-1">
          {loading
            ? 'Loading live figures…'
            : m?.totalCountableOrders
              ? `Across ${m.totalCountableOrders} real orders. Test orders are excluded.`
              : 'No real orders yet. Every figure below is zero because nothing has been sold.'}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => {
          const Icon = t.icon;
          const clickable = Boolean(t.href);
          return (
            <div
              key={t.label}
              onClick={() => t.href && router.push(t.href)}
              className={`p-5 rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40 space-y-2 ${
                clickable ? 'cursor-pointer hover:border-brand-teal/50 transition-colors' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{t.label}</span>
                <Icon className="w-4 h-4 text-brand-teal" />
              </div>
              <div className="font-display text-2xl font-bold text-white">{loading ? '—' : t.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Needs action */}
        <Panel title="Needs action" subtitle="Paid, not yet shipped" href="/admin/orders" router={router}>
          {data?.needsAction?.length ? (
            data.needsAction.map((o) => (
              <Row
                key={o.id}
                onClick={() => router.push(`/admin/orders?order=${o.order_number}`)}
                left={<><span className="font-mono text-xs text-white">{o.order_number}</span>
                  <span className="text-slate-400 ml-2">{o.customer_name}</span></>}
                right={<><span className="text-white font-semibold">{money(o.total_amount)}</span>
                  <span className="ml-2 text-[10px] uppercase text-brand-teal">{o.status}</span></>}
              />
            ))
          ) : (
            <Empty>{loading ? 'Loading…' : 'Nothing waiting to be fulfilled.'}</Empty>
          )}
        </Panel>

        {/* Recent orders */}
        <Panel title="Recent orders" href="/admin/orders" router={router}>
          {data?.recentOrders?.length ? (
            data.recentOrders.map((o) => (
              <Row
                key={o.id}
                onClick={() => router.push(`/admin/orders?order=${o.order_number}`)}
                left={<><span className="font-mono text-xs text-white">{o.order_number}</span>
                  {o.is_test && <span className="ml-2 text-[10px] text-amber-400">TEST</span>}
                  <span className="text-slate-400 ml-2">{o.customer_name}</span></>}
                right={<><span className="text-white font-semibold">{money(o.total_amount)}</span>
                  <span className={`ml-2 text-[10px] uppercase ${o.payment_status === 'paid' ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {o.payment_status}
                  </span></>}
              />
            ))
          ) : (
            <Empty>{loading ? 'Loading…' : 'No orders yet.'}</Empty>
          )}
        </Panel>

        {/* Inventory */}
        <Panel title="Low stock" subtitle={`At or below ${data?.lowStockThreshold ?? 25} units`} href="/admin/inventory" router={router}>
          {data?.outOfStock?.length ? (
            data.outOfStock.map((p) => (
              <Row key={p.id} left={<span className="text-white">{p.name}</span>}
                right={<span className="text-red-400 text-xs font-semibold">OUT OF STOCK</span>} />
            ))
          ) : null}
          {data?.lowStock?.length ? (
            data.lowStock.map((p) => (
              <Row key={p.id} left={<span className="text-white">{p.name}</span>}
                right={<span className="text-amber-400 font-mono text-xs">{p.stockCount} left</span>} />
            ))
          ) : (
            !data?.outOfStock?.length && <Empty>{loading ? 'Loading…' : 'All products are well stocked.'}</Empty>
          )}
        </Panel>

        {/* Inbox */}
        <Panel title="Recent enquiries" href="/admin/inquiries" router={router}>
          {data?.inquiries?.length ? (
            data.inquiries.map((q) => (
              <Row
                key={q.id}
                onClick={() => router.push('/admin/inquiries')}
                left={<><span className="text-white">{q.name}</span>
                  <span className="text-slate-400 ml-2 text-xs">{q.subject}</span></>}
                right={<span className={`text-[10px] uppercase ${q.status === 'new' ? 'text-brand-teal' : 'text-slate-500'}`}>{q.status}</span>}
              />
            ))
          ) : (
            <Empty>{loading ? 'Loading…' : 'No enquiries yet.'}</Empty>
          )}
          {data?.affiliateApplications?.length ? (
            <div className="pt-3 mt-2 border-t border-brand-graphite/40">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">New affiliate applications</div>
              {data.affiliateApplications.map((a) => (
                <Row key={a.id} onClick={() => router.push('/admin/affiliates')}
                  left={<span className="text-white">{a.name}</span>}
                  right={<span className="text-[10px] uppercase text-slate-400">{a.status}</span>} />
              ))}
            </div>
          ) : null}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, href, router, children }: any) {
  return (
    <div className="rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40 p-5 space-y-1">
      <div className="flex items-center justify-between pb-2">
        <div>
          <h2 className="font-display text-sm font-bold text-white">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
        </div>
        {href && (
          <button onClick={() => router.push(href)} className="text-[11px] text-brand-teal flex items-center gap-1 hover:text-white">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="divide-y divide-brand-graphite/30">{children}</div>
    </div>
  );
}

function Row({ left, right, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between py-2.5 text-sm ${onClick ? 'cursor-pointer hover:bg-white/[0.03] -mx-2 px-2 rounded' : ''}`}
    >
      <div className="truncate">{left}</div>
      <div className="whitespace-nowrap ml-3">{right}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
      <Inbox className="w-5 h-5 text-slate-600" />
      {children}
    </div>
  );
}
