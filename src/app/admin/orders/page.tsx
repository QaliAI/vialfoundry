'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { OrderDetailDrawer } from '../../../components/admin/OrderDetailDrawer';
import { ShoppingCart, Search, CheckCircle2, Truck, Mail, Archive, AlertCircle, RefreshCw, Bell } from 'lucide-react';
import { classifyFulfillmentQueue, FULFILLMENT_QUEUES } from '@/lib/admin/order-classification.mjs';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price_amount: number;
  line_total_amount: number;
  sku?: string;
  lot_number?: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: string;
  preferred_payment_method: string;
  payment_provider?: string;
  payment_status?: string;
  stripe_livemode?: boolean | null;
  subtotal_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  tracking_number?: string;
  is_test: boolean;
  archived_at?: string;
  created_at: string;
  manual_order_items?: OrderItem[];
}

interface TableColumn {
  id: keyof Order;
  label: string;
  className?: string;
}

const QUEUE_TABS = [
  { id: 'ALL', label: 'ALL' },
  ...FULFILLMENT_QUEUES,
  { id: 'AWAITING_PAYMENT', label: 'AWAITING PAYMENT' },
];

function AdminOrdersPageInner() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [queueFilter, setQueueFilter] = useState('ALL');
  const [actionMessage, setActionMessage] = useState('');
  const [editingTrackingId, setEditingTrackingId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Deep link from the dashboard: /admin/orders?order=VF-123456
  useEffect(() => {
    const q = searchParams?.get('order');
    if (q) setOpenOrder(q);
  }, [searchParams]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders', {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to load orders');
      }

      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('[admin/orders] fetch error:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: string, trackingNumber?: string) => {
    try {
      const res = await fetch('/api/admin/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, nextStatus, trackingNumber }),
      });
      if (res.ok) {
        setActionMessage(`Order status updated to ${nextStatus}`);
        loadOrders();
      }
    } catch (err) {
      console.error('[admin/orders/update] error:', err);
      setActionMessage('Failed to update order status');
    }
  };

  const handleSaveTracking = async (orderId: string) => {
    try {
      await fetch('/api/admin/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, nextStatus: 'shipped', trackingNumber: trackingInput }),
      });
      await fetch('/api/admin/orders/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, emailType: 'tracking' }),
      });
      setActionMessage('Tracking saved and customer notified via email');
      loadOrders();
    } catch (err) {
      console.error('[admin/orders/save-tracking] error:', err);
      setActionMessage('Failed to save tracking');
    }
    setEditingTrackingId(null);
    setTrackingInput('');
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleResendOrderEmail = async (orderId: string) => {
    try {
      await fetch('/api/admin/orders/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, emailType: 'order' }),
      });
      setActionMessage('Customer verification email resent');
    } catch (err) {
      console.error('[admin/orders/resend-email] error:', err);
      setActionMessage('Failed to resend email');
    }
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleResendOwnerEmail = async (orderId: string) => {
    try {
      const res = await fetch('/api/admin/orders/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, emailType: 'owner_alert' }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('Owner notification alert resent');
      } else {
        setActionMessage(data.error || 'Failed to resend owner alert');
      }
    } catch (err) {
      console.error('[admin/orders/resend-owner-email] error:', err);
      setActionMessage('Failed to resend owner alert');
    }
    setTimeout(() => setActionMessage(''), 3000);
  };

  const queueCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: orders.length };
    for (const tab of QUEUE_TABS) {
      counts[tab.id] = 0;
    }
    counts.ALL = orders.length;

    for (const o of orders) {
      const q = classifyFulfillmentQueue(o);
      counts[q] = (counts[q] || 0) + 1;
    }
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch =
        o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      if (queueFilter === 'ALL') return true;
      const q = classifyFulfillmentQueue(o);
      return q === queueFilter;
    });
  }, [orders, searchQuery, queueFilter]);

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Orders & Fulfillment</h1>
          <p className="text-xs font-mono text-slate-400">Inspect research procurement orders, update status lifecycles, and manage fulfillment queues</p>
        </div>
        <button
          onClick={loadOrders}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 hover:border-brand-graphite text-brand-paper text-xs font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-brand-mineral/20 border border-brand-mineral/40 text-brand-paper text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Queue Tabs */}
      <div className="flex items-center space-x-2 w-full overflow-x-auto pb-1 scrollbar-thin">
        {QUEUE_TABS.map(tab => {
          const count = queueCounts[tab.id] ?? 0;
          const isActive = queueFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setQueueFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg uppercase text-[10px] font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-brand-primary text-brand-paper shadow-sm'
                  : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                isActive ? 'bg-white/20 text-white font-mono' : 'bg-slate-800 text-slate-400 font-mono'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center text-xs font-mono">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by order # or customer..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-graphite"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 glass-panel font-mono text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="p-4">Order #</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Line Items</th>
              <th className="p-4">Total Due</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Queue & Status</th>
              <th className="p-4">Tracking</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-slate-950/60">
            {filteredOrders.map(o => (
              <tr key={o.id} className="text-slate-300 hover:bg-white/[0.02]">
                <td className="p-4 font-bold text-brand-paper">
                  <button
                    onClick={() => setOpenOrder(o.order_number)}
                    className="hover:text-brand-teal underline-offset-4 hover:underline"
                  >
                    {o.order_number}
                  </button>
                </td>
                <td className="p-4">
                  <div className="font-bold text-white">{o.customer_name}</div>
                  <div className="text-[10px] text-slate-400">{o.customer_email}</div>
                </td>
                <td className="p-4 text-slate-400 max-w-xs truncate">
                  {o.manual_order_items?.map(i => `${i.product_name} (×${i.quantity})`).join(', ') || 'Reference Standard'}
                </td>
                <td className="p-4 text-white font-bold">${(o.total_amount / 100).toFixed(2)}</td>
                <td className="p-4">
                  <div className="uppercase text-[10px] text-brand-paper font-bold">
                    {o.payment_status || o.preferred_payment_method}
                  </div>
                  {o.payment_provider === 'stripe' && (
                    <div className={`text-[10px] font-bold ${o.stripe_livemode === true ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {o.stripe_livemode === true ? 'LIVE' : 'TEST'} Stripe
                    </div>
                  )}
                </td>
                <td className="p-4">
                  {(() => {
                    const q = classifyFulfillmentQueue(o);
                    return (
                      <div className="space-y-1.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider ${
                          q === 'PAID_NEEDS_FULFILLMENT' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                          q === 'WAITING_ON_INVENTORY' ? 'bg-amber-950 text-amber-300 border border-amber-800/60' :
                          q === 'WAITING_ON_DOCUMENTATION' ? 'bg-purple-950 text-purple-300 border border-purple-800/60' :
                          q === 'SHIPPED' ? 'bg-sky-950 text-sky-300 border border-sky-800/60' :
                          q === 'DELIVERED_COMPLETED' ? 'bg-slate-800 text-slate-300 border border-slate-700' :
                          q === 'REFUND_EXCEPTION' ? 'bg-rose-950 text-rose-300 border border-rose-800/60' :
                          'bg-slate-900 text-slate-400 border border-white/10'
                        }`}>
                          {q.replace(/_/g, ' ')}
                        </span>
                        <div>
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                            className="bg-slate-900 border border-white/15 rounded px-2 py-1 text-[10px] font-bold text-white focus:outline-none focus:border-brand-graphite"
                          >
                            <option value="new">new</option>
                            <option value="invoice_sent">invoice_sent</option>
                            <option value="pending_payment">pending_payment</option>
                            <option value="paid">paid</option>
                            <option value="waiting_inventory">waiting_inventory</option>
                            <option value="waiting_documentation">waiting_documentation</option>
                            <option value="preparing">preparing</option>
                            <option value="shipped">shipped</option>
                            <option value="fulfilled">fulfilled</option>
                            <option value="canceled">canceled</option>
                            <option value="refunded">refunded</option>
                          </select>
                        </div>
                      </div>
                    );
                  })()}
                </td>
                <td className="p-4">
                  {editingTrackingId === o.id ? (
                    <div className="flex items-center space-x-1">
                      <input
                        type="text"
                        value={trackingInput}
                        onChange={e => setTrackingInput(e.target.value)}
                        placeholder="USPS Tracking #..."
                        className="px-2 py-1 rounded bg-slate-900 border border-brand-graphite text-white text-[10px] w-32"
                      />
                      <button
                        onClick={() => handleSaveTracking(o.id)}
                        className="px-2 py-1 rounded bg-brand-primary text-brand-paper font-bold text-[10px]"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {o.tracking_number ? `${o.tracking_number.slice(0, 10)}...` : 'None'}
                      </span>
                      <button
                        onClick={() => {
                          setEditingTrackingId(o.id);
                          setTrackingInput(o.tracking_number || '');
                        }}
                        className="text-[10px] text-brand-paper underline hover:text-brand-paper"
                      >
                        {o.tracking_number ? 'Edit' : 'Add'}
                      </button>
                    </div>
                  )}
                </td>
                <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                  <button
                    onClick={() => handleResendOrderEmail(o.id)}
                    title="Resend Customer Verification Email"
                    className="p-1.5 rounded bg-slate-900 border border-white/10 hover:border-brand-graphite text-brand-paper"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleResendOwnerEmail(o.id)}
                    title="Resend Owner Alert Email"
                    className="p-1.5 rounded bg-slate-900 border border-white/10 hover:border-brand-graphite text-brand-paper"
                  >
                    <Bell className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

          {openOrder && (
        <OrderDetailDrawer
          orderKey={openOrder}
          onClose={() => setOpenOrder(null)}
          onChanged={loadOrders}
        />
      )}
</div>
  );
}

/**
 * useSearchParams() (used for the ?order= deep link from the dashboard) opts
 * the page into client-side rendering, so Next requires a Suspense boundary.
 */
export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-400">Loading orders…</div>}>
      <AdminOrdersPageInner />
    </Suspense>
  );
}
