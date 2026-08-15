'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { calculateShippingRate } from '../../lib/adapters/shippingAdapter';
import { ShieldCheck, Lock, ArrowRight, CheckCircle2, ShoppingBag } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();

  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [ruoAgreed, setRuoAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    email: '',
    phone: ''
  });

  const shippingInfo = calculateShippingRate({
    subtotal,
    itemsCount: cart.length
  });

  const discountAmount = appliedDiscount ? appliedDiscount.amount : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingInfo.cost);

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    const code = discountCode.trim().toUpperCase();
    if (code === 'FOUNDRY10') {
      const amt = subtotal * 0.10;
      setAppliedDiscount({ code, amount: amt });
      setDiscountError('');
    } else if (code === 'RESEARCH25' && subtotal >= 200) {
      setAppliedDiscount({ code, amount: 25.00 });
      setDiscountError('');
    } else {
      setDiscountError('Invalid or inapplicable discount code.');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruoAgreed) {
      alert('You must confirm that materials are for Research Use Only (RUO).');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: grandTotal,
          customerEmail: shippingAddress.email,
          shippingAddress,
          items: cart.map(i => ({
            name: i.product.name,
            sku: i.product.sku,
            lotNumber: i.product.lotNumber,
            quantity: i.quantity,
            unitPrice: i.product.price,
          })),
        }),
      });

      const data = await res.json();
      const orderNumber = data?.orderNumber || `VF-${Date.now().toString().slice(-8)}`;
      clearCart();
      router.push(`/order-confirmation/${orderNumber}`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="pt-32 pb-20 max-w-xl mx-auto text-center space-y-4 px-4">
        <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="font-display text-2xl font-bold text-white">Your Research Cart is Empty</h2>
        <p className="text-xs text-slate-400 font-mono">Add reference materials or standards to proceed with checkout.</p>
        <button
          onClick={() => router.push('/catalog')}
          className="px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      <div className="space-y-2">
        <div className="mono-tag text-xs text-cyan-400 font-semibold uppercase tracking-wider">
          REQUEST ORDER / QUOTE
        </div>
        <h1 className="font-display text-3xl font-extrabold text-white">
          Submit Your Research Order Request
        </h1>
        <p className="text-xs text-slate-400 font-light max-w-2xl">
          No payment is taken now. Submit your request and our team will confirm availability and
          reply with a quote and secure payment instructions. All materials are supplied for research use only.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Addresses & Contact Information */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="font-display text-lg font-bold text-white">Shipping Address</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-400">First Name</label>
                <input
                  type="text" required
                  value={shippingAddress.firstName}
                  onChange={e => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Last Name</label>
                <input
                  type="text" required
                  value={shippingAddress.lastName}
                  onChange={e => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-400">Institution / Company (Optional)</label>
                <input
                  type="text"
                  value={shippingAddress.company}
                  onChange={e => setShippingAddress({ ...shippingAddress, company: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Email Address</label>
                <input
                  type="email" required
                  value={shippingAddress.email}
                  onChange={e => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs font-mono">
              <label className="text-slate-400">Street Address</label>
              <input
                type="text" required
                value={shippingAddress.address}
                onChange={e => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-400">City</label>
                <input
                  type="text" required
                  value={shippingAddress.city}
                  onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">State / Prov</label>
                <input
                  type="text" required
                  value={shippingAddress.state}
                  onChange={e => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">ZIP / Postal</label>
                <input
                  type="text" required
                  value={shippingAddress.zip}
                  onChange={e => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

          </div>

          {/* RUO Compliance Checkbox */}
          <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={ruoAgreed}
                onChange={e => setRuoAgreed(e.target.checked)}
                className="mt-1 rounded bg-slate-950 border-white/20 text-cyan-500 focus:ring-0"
              />
              <span className="text-xs font-mono text-slate-300">
                I certify that all products in this order will be used exclusively for in vitro laboratory, analytical, or scientific research purposes (RUO). Not for human, clinical, or therapeutic use.
              </span>
            </label>
          </div>

        </div>

        {/* Right Column: Order Summary & Payment Adapter */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="font-display text-lg font-bold text-white">Order Summary</h3>

            {/* Itemized List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 border-b border-white/10 pb-4">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-white font-bold">{product.name}</span>
                    <span className="text-slate-400 block text-[10px]">Qty: {quantity} | LOT: {product.lotNumber}</span>
                  </div>
                  <span className="text-cyan-300 font-bold">${(product.price * quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Discount Form */}
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={e => setDiscountCode(e.target.value)}
                  placeholder="Discount code (e.g. FOUNDRY10)..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleApplyDiscount}
                  type="button"
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-mono font-bold text-cyan-300 hover:bg-slate-700"
                >
                  Apply
                </button>
              </div>
              {appliedDiscount && (
                <div className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Code {appliedDiscount.code} applied (-${appliedDiscount.amount.toFixed(2)})</span>
                </div>
              )}
              {discountError && (
                <div className="text-[11px] font-mono text-rose-400">{discountError}</div>
              )}
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-2 text-xs font-mono pt-2">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount</span>
                  <span>-${appliedDiscount.amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Shipping ({shippingInfo.methodName})</span>
                <span className={shippingInfo.isFreeShipping ? 'text-emerald-400 font-bold' : ''}>
                  {shippingInfo.isFreeShipping ? 'FREE' : `$${shippingInfo.cost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-white font-bold text-base pt-3 border-t border-white/10">
                <span>Estimated Total</span>
                <span className="text-cyan-400">${grandTotal.toFixed(2)}</span>
              </div>
              <p className="text-[10px] font-mono text-slate-500">
                Estimate only. Final total is confirmed on your quote.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-cyan-500 text-slate-950 font-display font-bold text-sm hover:bg-cyan-400 transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting Request...' : 'Submit Order Request'}</span>
            </button>

            <div className="text-center text-[10px] font-mono text-slate-400 flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>No card charged — quote &amp; invoice follow-up</span>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
}
