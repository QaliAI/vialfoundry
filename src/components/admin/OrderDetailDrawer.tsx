'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { X, Truck, RotateCcw, Mail, Clock, CreditCard } from 'lucide-react';

/**
 * Everything about one order, in one place: what was bought, what was paid,
 * what Stripe recorded, and every change anyone has made.
 *
 * Refunds are deliberately two-step (type the amount, then confirm) — there is
 * no one-click destructive money action here.
 */

const money = (c?: number | null) => `$${(((c ?? 0) as number) / 100).toFixed(2)}`;

const NEXT_STATUSES: Record<string, string[]> = {
  new: ['pending_payment', 'paid', 'canceled'],
  invoice_sent: ['pending_payment', 'paid', 'canceled'],
  pending_payment: ['paid', 'canceled'],
  paid: ['preparing', 'packed', 'shipped', 'canceled'],
  preparing: ['packed', 'shipped'],
  packed: ['shipped'],
  shipped: ['fulfilled'],
  fulfilled: [],
  canceled: [],
  cancelled: [],
  refunded: [],
};

interface Props {
  orderKey: string;
  onClose: () => void;
  onChanged?: () => void;
}

export const OrderDetailDrawer: React.FC<Props> = ({ orderKey, onClose, onChanged }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tracking, setTracking] = useState('');
  const [carrier, setCarrier] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundConfirm, setRefundConfirm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderKey)}`, { credentials: 'include' });
      if (res.ok) {
        const d = await res.json();
        setData(d);
        setTracking(d.order?.tracking_number || '');
        setCarrier(d.order?.carrier || '');
      } else {
        setMsg('Could not load this order.');
      }
    } finally {
      setLoading(false);
    }
  }, [orderKey]);

  useEffect(() => { load(); }, [load]);

  const o = data?.order;

  const changeStatus = async (nextStatus: string) => {
    if (!o) return;
    setBusy(true); setMsg(null);
    try {
      const res = await fetch('/api/admin/orders/update', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: o.id, nextStatus, trackingNumber: tracking || undefined, carrier: carrier || undefined }),
      });
      const j = await res.json();
      setMsg(j.success ? `Status set to ${nextStatus}.` : j.error || 'Update failed.');
      if (j.success) { await load(); onChanged?.(); }
    } finally { setBusy(false); }
  };

  const doRefund = async () => {
    if (!o) return;
    const cents = Math.round(parseFloat(refundAmount) * 100);
    if (!Number.isFinite(cents) || cents <= 0) { setMsg('Enter a refund amount.'); return; }
    setBusy(true); setMsg(null);
    try {
      const res = await fetch('/api/admin/orders/refund', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: o.id, amountCents: cents, confirm: true }),
      });
      const j = await res.json();
      setMsg(j.success ? j.note || 'Refund submitted.' : j.error || 'Refund failed.');
      if (j.success) { setRefundConfirm(false); setRefundAmount(''); await load(); onChanged?.(); }
    } finally { setBusy(false); }
  };

  const resendEmail = async () => {
    if (!o) return;
    setBusy(true); setMsg(null);
    try {
      const res = await fetch('/api/admin/orders/resend-email', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: o.id }),
      });
      const j = await res.json();
      setMsg(j.success ? 'Order email resent.' : j.error || 'Could not resend.');
    } finally { setBusy(false); }
  };

  const addr = o?.shipping_address_snapshot || {};
  const refundable = (o?.total_amount || 0) - (o?.amount_refunded || 0);

  return (
    <div className="fixed inset-0 z-[300] flex justify-end bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-2xl h-full overflow-y-auto bg-brand-ink border-l border-brand-graphite/40 p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono text-sm text-brand-teal">{o?.order_number || orderKey}</div>
            <h2 className="font-display text-xl font-bold text-white">{o?.customer_name || 'Order'}</h2>
            <div className="flex flex-wrap gap-2 pt-1">
              {o?.payment_provider === 'stripe' && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${o.stripe_livemode === true ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'}`}>
                  {o.stripe_livemode === true ? 'STRIPE LIVE' : 'STRIPE TEST'}
                </span>
              )}
              {o?.is_test && <span className="text-[10px] text-amber-400 font-bold">QA TEST ORDER — do not fulfil</span>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {msg && <div className="p-3 rounded-lg bg-brand-graphite/40 border border-brand-graphite text-xs text-white">{msg}</div>}
        {loading && <p className="text-sm text-slate-400">Loading…</p>}

        {o && (
          <>
            {/* Payment */}
            <Section title="Payment" icon={CreditCard}>
              <KV k="Status" v={<span className={o.payment_status === 'paid' ? 'text-emerald-400' : 'text-slate-300'}>{o.payment_status}</span>} />
              <KV k="Provider" v={o.payment_provider || '—'} />
              <KV k="Total" v={money(o.total_amount)} />
              {o.amount_refunded > 0 && <KV k="Refunded" v={money(o.amount_refunded)} />}
              {o.paid_at && <KV k="Paid at" v={new Date(o.paid_at).toLocaleString()} />}
              {o.refunded_at && <KV k="Refunded at" v={new Date(o.refunded_at).toLocaleString()} />}
              {o.stripe_checkout_session_id && <KV k="Stripe session" v={<span className="font-mono text-[10px] break-all">{o.stripe_checkout_session_id}</span>} />}
              {o.stripe_payment_intent_id && <KV k="Payment intent" v={<span className="font-mono text-[10px] break-all">{o.stripe_payment_intent_id}</span>} />}
              {(() => {
                const dash = o.stripe_livemode === true ? 'https://dashboard.stripe.com' : 'https://dashboard.stripe.com/test';
                const href = o.stripe_payment_intent_id
                  ? `${dash}/payments/${o.stripe_payment_intent_id}`
                  : o.stripe_checkout_session_id
                    ? `${dash}/checkout/sessions/${o.stripe_checkout_session_id}`
                    : null;
                if (!href) return null;
                return (
                  <div className="pt-2">
                    <a href={href} target="_blank" rel="noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white text-brand-ink text-xs font-semibold">
                      View in Stripe
                    </a>
                    <p className="text-[10px] text-slate-500 pt-1">
                      Opens the {o.stripe_livemode === true ? 'LIVE' : 'TEST'} Stripe Dashboard. Test charges are not live revenue.
                    </p>
                  </div>
                );
              })()}
            </Section>

            {/* Items */}
            <Section title="Items">
              {(data.items || []).map((it: any) => (
                <div key={it.id} className="flex justify-between py-1.5 text-sm border-b border-brand-graphite/30 last:border-0">
                  <span className="text-slate-300">{it.product_name} × {it.quantity}</span>
                  <span className="text-white">{money(it.line_total_amount)}</span>
                </div>
              ))}
              <div className="pt-2 space-y-1 text-sm">
                <KV k="Subtotal" v={money(o.subtotal_amount)} />
                {o.discount_amount > 0 && <KV k={`Discount${o.promo_code ? ` (${o.promo_code})` : ''}`} v={`−${money(o.discount_amount)}`} />}
                <KV k="Shipping" v={money(o.shipping_amount)} />
                <KV k="Total" v={<span className="font-bold text-white">{money(o.total_amount)}</span>} />
              </div>
            </Section>

            {/* Customer */}
            <Section title="Customer">
              <KV k="Email" v={<a href={`mailto:${o.customer_email}`} className="text-brand-teal break-all">{o.customer_email}</a>} />
              {o.customer_phone && <KV k="Phone" v={o.customer_phone} />}
              <KV k="Ship to" v={
                <span className="text-right">
                  {[addr.firstName, addr.lastName].filter(Boolean).join(' ')}<br />
                  {addr.company && <>{addr.company}<br /></>}
                  {addr.address}{addr.address2 ? `, ${addr.address2}` : ''}<br />
                  {[addr.city, addr.state, addr.zip].filter(Boolean).join(', ')}<br />
                  {addr.country}
                </span>
              } />
              {o.affiliate_code && <KV k="Affiliate" v={`${o.affiliate_code} · ${money(o.affiliate_commission_amount)} (${o.affiliate_status})`} />}
              {o.acknowledgement_snapshot?.timestamp && (
                <KV k="RUO accepted" v={new Date(o.acknowledgement_snapshot.timestamp).toLocaleString()} />
              )}
            </Section>

            {/* Fulfilment */}
            <Section title="Fulfilment" icon={Truck}>
              <KV k="Status" v={<span className="uppercase text-brand-teal text-xs">{o.status}</span>} />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Carrier (e.g. USPS)"
                  className="bg-brand-graphite/40 border border-brand-graphite rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500" />
                <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Tracking number"
                  className="bg-brand-graphite/40 border border-brand-graphite rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500" />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {(NEXT_STATUSES[o.status] || []).map((s) => (
                  <button key={s} disabled={busy} onClick={() => changeStatus(s)}
                    className="px-3 py-1.5 rounded-lg bg-white text-brand-ink text-xs font-semibold capitalize disabled:opacity-50">
                    Mark {s.replace('_', ' ')}
                  </button>
                ))}
                {(NEXT_STATUSES[o.status] || []).length === 0 && (
                  <span className="text-xs text-slate-500">No further transitions from “{o.status}”.</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Marking shipped emails the customer their tracking number, if one is set.
              </p>
            </Section>

            {/* Refund */}
            {o.payment_provider === 'stripe' && ['paid', 'partially_refunded'].includes(o.payment_status) && (
              <Section title="Refund" icon={RotateCcw}>
                <p className="text-[11px] text-slate-400">Refundable: {money(refundable)}</p>
                <div className="flex gap-2 pt-2">
                  <input value={refundAmount} onChange={(e) => { setRefundAmount(e.target.value); setRefundConfirm(false); }}
                    placeholder={(refundable / 100).toFixed(2)} inputMode="decimal"
                    className="flex-1 bg-brand-graphite/40 border border-brand-graphite rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500" />
                  {!refundConfirm ? (
                    <button disabled={busy || !refundAmount} onClick={() => setRefundConfirm(true)}
                      className="px-3 py-2 rounded-lg border border-red-500/40 text-red-300 text-xs font-semibold disabled:opacity-40">
                      Refund…
                    </button>
                  ) : (
                    <button disabled={busy} onClick={doRefund}
                      className="px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-bold disabled:opacity-50">
                      Confirm ${refundAmount}
                    </button>
                  )}
                </div>
              </Section>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button disabled={busy} onClick={resendEmail}
                className="px-3 py-2 rounded-lg bg-brand-graphite/40 border border-brand-graphite text-white text-xs flex items-center gap-1.5 disabled:opacity-50">
                <Mail className="w-3.5 h-3.5" /> Resend order email
              </button>
            </div>

            {/* Timeline */}
            <Section title="History" icon={Clock}>
              {(data.events || []).length === 0 && <p className="text-xs text-slate-500">No recorded events.</p>}
              {(data.events || []).map((e: any) => (
                <div key={e.id} className="py-2 border-b border-brand-graphite/30 last:border-0">
                  <div className="flex justify-between gap-3">
                    <span className="text-xs text-white">{e.message || e.event_type}</span>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">{new Date(e.created_at).toLocaleString()}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{e.event_type} · {e.actor}</span>
                </div>
              ))}
            </Section>
          </>
        )}
      </div>
    </div>
  );
};

function Section({ title, icon: Icon, children }: any) {
  return (
    <div className="rounded-2xl bg-brand-graphite/20 border border-brand-graphite/40 p-4 space-y-1.5">
      <h3 className="font-display text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pb-1">
        {Icon && <Icon className="w-3.5 h-3.5 text-brand-teal" />}{title}
      </h3>
      {children}
    </div>
  );
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-sm py-1">
      <span className="text-slate-400 whitespace-nowrap">{k}</span>
      <span className="text-slate-200 text-right">{v}</span>
    </div>
  );
}
