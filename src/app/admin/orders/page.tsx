'use client';

import React, { useState } from 'react';
import { ShoppingCart, Search, CheckCircle2, Truck, FileText } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([
    {
      id: 'ORD-VF-881920',
      customer: 'Dr. Alex Vance (vance@mit.edu)',
      total: 192.00,
      status: 'Paid',
      fulfillment: 'Unfulfilled',
      date: '2026-08-11',
      items: 'BPC-157 Reference Standard (x3)'
    },
    {
      id: 'ORD-VF-772104',
      customer: 'BioTech Research Labs (purchasing@biotech.org)',
      total: 356.00,
      status: 'Paid',
      fulfillment: 'Shipped',
      date: '2026-08-10',
      items: 'Semaglutide Standard (x2), Tirzepatide Standard (x1)'
    }
  ]);

  const handleUpdateFulfillment = (id: string, nextStatus: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, fulfillment: nextStatus } : o));
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-white/10 pb-4">
        <h1 className="font-display text-2xl font-bold text-white">Orders & Fulfillment</h1>
        <p className="text-xs font-mono text-slate-400">Inspect customer research orders, update fulfillment states, and track cold storage packaging</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 glass-panel font-mono text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Line Items</th>
              <th className="p-4">Total</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Fulfillment</th>
              <th className="p-4 text-right">Update Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-slate-950/60">
            {orders.map(o => (
              <tr key={o.id} className="text-slate-300">
                <td className="p-4 font-bold text-cyan-300">{o.id}</td>
                <td className="p-4 font-bold text-white">{o.customer}</td>
                <td className="p-4 text-slate-400">{o.items}</td>
                <td className="p-4 text-white font-bold">${o.total.toFixed(2)}</td>
                <td className="p-4 text-emerald-400 font-bold">{o.status}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    o.fulfillment === 'Shipped' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {o.fulfillment}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {o.fulfillment === 'Unfulfilled' ? (
                    <button
                      onClick={() => handleUpdateFulfillment(o.id, 'Shipped')}
                      className="px-3 py-1 rounded bg-cyan-500 text-slate-950 font-bold text-[10px]"
                    >
                      Mark Shipped
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-500">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
