'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  RotateCcw,
  LogOut,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShoppingBag,
  Bell,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { PRODUCTS } from '@/data/products';
import { resolveProductForReorder } from '@/lib/commerce/repeat-purchase.mjs';

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  subtotalAmount: number;
  shippingAmount: number;
  discountAmount: number;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippingCarrier?: string | null;
  items: Array<{
    productId?: string | null;
    productName: string;
    configurationLabel?: string | null;
    sku?: string | null;
    quantity: number;
    unitPriceAmount?: number | null;
    lineTotalAmount?: number | null;
  }>;
}

export interface CustomerAccountClientProps {
  sessionEmail: string;
  profile?: any;
  isMarketingSubscribed: boolean;
  orders: CustomerOrder[];
}

export function CustomerAccountClient({
  sessionEmail,
  isMarketingSubscribed: initialSubscribed,
  orders,
}: CustomerAccountClientProps) {
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();

  const [loggingOut, setLoggingOut] = useState(false);
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [prefUpdating, setPrefUpdating] = useState(false);
  const [reorderStatus, setReorderStatus] = useState<string | null>(null);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/customer/auth/logout', { method: 'POST' });
      router.refresh();
    } catch {
      window.location.reload();
    }
  };

  const handleToggleMarketing = async () => {
    setPrefUpdating(true);
    try {
      const next = !subscribed;
      const res = await fetch(next ? '/api/newsletter' : '/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sessionEmail }),
      });
      if (res.ok) {
        setSubscribed(next);
      }
    } catch {
      // Ignore
    } finally {
      setPrefUpdating(false);
    }
  };

  const handleReorderOrder = (order: CustomerOrder) => {
    let countAdded = 0;
    const unavailable: string[] = [];

    for (const item of order.items) {
      const resolved = resolveProductForReorder(
        {
          productId: item.productId || undefined,
          sku: item.sku || undefined,
          productName: item.productName,
          quantity: item.quantity,
        },
        PRODUCTS
      );

      if (resolved) {
        addToCart(resolved, item.quantity);
        countAdded += item.quantity;
      } else {
        unavailable.push(item.productName);
      }
    }

    if (countAdded > 0) {
      setReorderStatus(
        `Added ${countAdded} item${countAdded === 1 ? '' : 's'} to your cart.${
          unavailable.length > 0 ? ` (${unavailable.join(', ')} currently unavailable)` : ''
        }`
      );
      setIsCartOpen(true);
    } else {
      setReorderStatus('Items in this order are currently out of stock or retired.');
    }

    setTimeout(() => setReorderStatus(null), 5000);
  };

  return (
    <div className="pt-28 pb-24 min-h-screen bg-brand-canvas px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-border">
          <div className="space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-brand-ink bg-brand-surface-muted px-2 py-0.5 rounded border border-brand-border">
              Customer Portal
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-ink">
              Research Order History
            </h1>
            <p className="text-xs text-brand-steel font-mono">{sessionEmail}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/catalog"
              className="px-4 py-2 rounded-xl bg-brand-ink hover:bg-brand-graphite text-brand-paper text-xs font-sans font-bold transition-all"
            >
              Order Materials
            </Link>
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

        {reorderStatus && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-sans text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{reorderStatus}</span>
          </div>
        )}

        {/* Email Preferences Card */}
        <div className="p-5 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-sans font-bold text-brand-ink flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-brand-accent" />
              <span>Newsletter & Research Announcements</span>
            </div>
            <p className="text-[11px] text-brand-steel">
              {subscribed
                ? 'You are opted in to receive promotional codes, analytical batch releases, and catalog updates.'
                : 'You are unsubscribed from marketing emails. Transactional receipts will still be delivered.'}
            </p>
          </div>

          <button
            onClick={handleToggleMarketing}
            disabled={prefUpdating}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold transition-colors ${
              subscribed
                ? 'bg-brand-canvas hover:bg-brand-border border border-brand-border text-brand-steel'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {prefUpdating ? 'Saving...' : subscribed ? 'Opt Out of Marketing' : 'Opt In to Updates'}
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-brand-ink flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-accent" />
              <span>Your Orders ({orders.length})</span>
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-3">
              <ShoppingBag className="w-10 h-10 text-brand-steel mx-auto" />
              <h3 className="font-display text-base font-bold text-brand-ink">No Orders Found</h3>
              <p className="text-xs text-brand-steel max-w-sm mx-auto">
                No orders have been placed under {sessionEmail} yet. When you complete an order, tracking numbers and invoices will appear here.
              </p>
              <div className="pt-2">
                <Link
                  href="/catalog"
                  className="inline-block px-4 py-2 rounded-xl bg-brand-ink hover:bg-brand-graphite text-brand-paper text-xs font-sans font-bold transition-all"
                >
                  Browse Catalog
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="p-6 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-brand-border/60">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand-ink">
                          Order {o.orderNumber}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                            o.paymentStatus === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {o.paymentStatus}
                        </span>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-brand-canvas border border-brand-border text-brand-steel">
                          {o.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-brand-steel">
                        Placed on {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReorderOrder(o)}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-canvas hover:bg-brand-border/50 border border-brand-border text-xs font-sans font-bold text-brand-ink transition-colors flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-brand-accent" />
                        <span>Order These Materials Again</span>
                      </button>
                    </div>
                  </div>

                  {/* Tracking info if present */}
                  {o.trackingNumber && (
                    <div className="p-3 rounded-xl bg-brand-canvas border border-brand-border flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-brand-ink">
                        <Truck className="w-4 h-4 text-brand-accent" />
                        <span className="font-semibold">{o.shippingCarrier || 'USPS / UPS'}:</span>
                        <span className="font-mono text-brand-steel">{o.trackingNumber}</span>
                      </div>
                      {o.trackingUrl && (
                        <a
                          href={o.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-brand-ink hover:underline flex items-center gap-1"
                        >
                          <span>Track Package</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Line items list */}
                  <div className="space-y-2 pt-1">
                    {o.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="space-x-2">
                          <span className="font-medium text-brand-ink">{i.productName}</span>
                          {i.configurationLabel && (
                            <span className="text-[11px] text-brand-steel font-mono">
                              ({i.configurationLabel})
                            </span>
                          )}
                          <span className="text-brand-steel font-mono">× {i.quantity}</span>
                        </div>
                        {typeof i.lineTotalAmount === 'number' && (
                          <span className="font-mono text-brand-ink">
                            ${(i.lineTotalAmount / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Totals breakdown */}
                  <div className="pt-3 border-t border-brand-border/60 flex justify-between items-center text-xs font-mono">
                    <span className="text-brand-steel">Total</span>
                    <span className="text-sm font-bold text-brand-ink">
                      ${(o.totalAmount / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RUO notice */}
        <div className="p-4 rounded-xl bg-brand-paper border border-brand-border text-xs font-sans text-brand-steel leading-relaxed flex items-start space-x-3">
          <ShieldCheck className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
          <span>
            Reminder: All products supplied by Vial Foundry are intended solely for in vitro laboratory research and academic investigation. They are not intended for human or animal application.
          </span>
        </div>
      </div>
    </div>
  );
}
