'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, CheckCircle2, Truck, Mail, Archive, AlertCircle, RefreshCw } from 'lucide-react';

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionMessage, setActionMessage] = useState('');
  const [editingTrackingId, setEditingTrackingId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

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
      setActionMessage('Order verification email resent');
    } catch (err) {
      console.error('[admin/orders/resend-email] error:', err);
      setActionMessage('Failed to resend email');
    }
    setTimeout(() => setActionMessage(''), 3000);
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch =
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || o.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Orders & Fulfillment</h1>
          <p className="text-xs font-mono text-slate-400">Inspect research procurement orders, update status lifecycles, and issue tracking notices</p>
        </div>
        <button
          onClick={loadOrders}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 hover:border-cyan-500 text-cyan-300 text-xs font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center text-xs font-mono">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by order # or customer..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'new', 'pending_payment', 'paid', 'preparing', 'shipped', 'fulfilled', 'canceled', 'refunded'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg uppercase text-[10px] font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
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
              <th className="p-4">Status</th>
              <th className="p-4">Tracking</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-slate-950/60">
            {filteredOrders.map(o => (
              <tr key={o.id} className="text-slate-300 hover:bg-white/[0.02]">
                <td className="p-4 font-bold text-cyan-300">{o.order_number}</td>
                <td className="p-4">
                  <div className="font-bold text-white">{o.customer_name}</div>
                  <div className="text-[10px] text-slate-400">{o.customer_email}</div>
                </td>
                <td className="p-4 text-slate-400 max-w-xs truncate">
                  {o.manual_order_items?.map(i => `${i.product_name} (×${i.quantity})`).join(', ') || 'Reference Standard'}
                </td>
                <td className="p-4 text-white font-bold">${(o.total_amount / 100).toFixed(2)}</td>
                <td className="p-4 uppercase text-[10px] text-cyan-400 font-bold">{o.preferred_payment_method}</td>
                <td className="p-4">
                  <select
                    value={o.status}
                    onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                    className="bg-slate-900 border border-white/15 rounded px-2 py-1 text-[10px] font-bold text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="new">new</option>
                    <option value="invoice_sent">invoice_sent</option>
                    <option value="pending_payment">pending_payment</option>
                    <option value="paid">paid</option>
                    <option value="preparing">preparing</option>
                    <option value="shipped">shipped</option>
                    <option value="fulfilled">fulfilled</option>
                    <option value="canceled">canceled</option>
                    <option value="refunded">refunded</option>
                  </select>
                </td>
                <td className="p-4">
                  {editingTrackingId === o.id ? (
                    <div className="flex items-center space-x-1">
                      <input
                        type="text"
                        value={trackingInput}
                        onChange={e => setTrackingInput(e.target.value)}
                        placeholder="USPS Tracking #..."
                        className="px-2 py-1 rounded bg-slate-900 border border-cyan-500 text-white text-[10px] w-32"
                      />
                      <button
                        onClick={() => handleSaveTracking(o.id)}
                        className="px-2 py-1 rounded bg-cyan-500 text-slate-950 font-bold text-[10px]"
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
                        className="text-[10px] text-cyan-400 underline hover:text-cyan-300"
                      >
                        {o.tracking_number ? 'Edit' : 'Add'}
                      </button>
                    </div>
                  )}
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleResendOrderEmail(o.id)}
                    title="Resend Verification Email"
                    className="p-1.5 rounded bg-slate-900 border border-white/10 hover:border-cyan-500 text-cyan-300"
                  >
                    <Mail className="w-3.5 h-3.5" />
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