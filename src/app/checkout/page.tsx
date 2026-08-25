'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { vialFoundryBrandConfig } from '../../config/brand';
import { calculateShipping } from '../../lib/manual-orders/shipping.mjs';
import { calculateConfiguredPromoDiscount } from '../../lib/promotions/promotions.mjs';
import { getClientAffiliateCode } from '../../lib/affiliates/client-storage.mjs';
import { PAYMENT_METHODS, PaymentMethodId, getPaymentMethod } from '../../data/payment';
import { ShieldCheck, Lock, CheckCircle2, ShoppingBag, Truck } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();

  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; discountCents: number; name?: string } | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [ruoAgreed, setRuoAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState<PaymentMethodId>('zelle');
  const [shippingMethodId, setShippingMethodId] = useState('standard');
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);

  useEffect(() => {
    const detected = getClientAffiliateCode();
    if (detected) {
      setAffiliateCode(detected);
    }
  }, []);

  const selectedMethod = getPaymentMethod(paymentMethodId);
  const subtotalCents = Math.round(subtotal * 100);

  const shippingInfo = calculateShipping(
    subtotalCents,
    shippingMethodId,
    vialFoundryBrandConfig.shippingOptions as any
  );

  const discountAmountCents = appliedDiscount ? appliedDiscount.discountCents : 0;
  const grandTotalCents = Math.max(0, subtotalCents - discountAmountCents + shippingInfo.amountCents);
  const grandTotalDollars = (grandTotalCents / 100).toFixed(2);

  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    email: '',
    phone: '',
  });

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    const code = discountCode.trim().toUpperCase();
    if (!code) {
      setAppliedDiscount(null);
      setDiscountError('');
      return;
    }

    const promoResult = calculateConfiguredPromoDiscount(
      subtotalCents,
      code,
      vialFoundryBrandConfig.promotions
    );

    if (promoResult.valid && promoResult.discountCents > 0) {
      setAppliedDiscount({
        code: promoResult.code || code,
        discountCents: promoResult.discountCents,
        name: promoResult.name,
      });
      setDiscountError('');
    } else {
      setAppliedDiscount(null);
      setDiscountError(promoResult.error || 'Invalid or inapplicable promotional code.');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruoAgreed) {
      alert('You must confirm that materials are for Research Use Only (RUO).');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    // Generate unique idempotency key
    const submissionKey = `vf_sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const payload = {
        submissionKey,
        customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
        customerEmail: shippingAddress.email.trim(),
        customerPhone: shippingAddress.phone || null,
        shippingAddress: {
          firstName: shippingAddress.firstName.trim(),
          lastName: shippingAddress.lastName.trim(),
          company: shippingAddress.company ? shippingAddress.company.trim() : null,
          address: shippingAddress.address.trim(),
          address2: shippingAddress.address2 ? shippingAddress.address2.trim() : null,
          city: shippingAddress.city.trim(),
          state: shippingAddress.state.trim(),
          zip: shippingAddress.zip.trim(),
          country: shippingAddress.country || 'United States',
          email: shippingAddress.email.trim(),
          phone: shippingAddress.phone || null,
        },
        shippingMethodId,
        preferredPaymentMethod: paymentMethodId,
        promoCode: appliedDiscount ? appliedDiscount.code : null,
        affiliateCode: affiliateCode || null,
        ruoAgreed: true,
        items: cart.map((i) => ({
          productId: i.product.id || null,
          variantId: null,
          productName: i.product.name,
          configurationLabel: `${i.product.category} Standard`,
          quantity: i.quantity,
          unitPriceAmount: Math.round(i.product.price * 100),
          priceStatus: 'fixed',
          sku: i.product.sku,
          lotNumber: i.product.lotNumber,
        })),
        notes: null,
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Order request submission failed. Please check your details.');
      }

      const orderNumber = data.orderNumber || `VF-${Date.now().toString().slice(-6)}`;
      clearCart();

      // Store authoritative order totals in sessionStorage for confirmation page
      if (typeof window !== 'undefined') {
        const orderData = {
          totalCents: data.totalAmount || 0,
          subtotalCents: data.subtotalAmount || 0,
          discountCents: data.discountAmount || 0,
          shippingCents: data.shippingAmount || 0,
          paymentMethod: data.preferredPaymentMethod,
        };
        sessionStorage.setItem(`vf_order_${orderNumber}`, JSON.stringify(orderData));
      }

      router.push(`/order-confirmation/${orderNumber}?method=${paymentMethodId}`);
    } catch (err: any) {
      console.error('[checkout] error submitting order:', err);
      setSubmitError(err?.message || 'An error occurred during submission.');
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
          REQUEST ORDER / PROCUREMENT
        </div>
        <h1 className="font-display text-3xl font-extrabold text-white">
          Submit Your Research Order Request
        </h1>
        <p className="text-xs text-slate-400 font-light max-w-2xl">
          No credit card is charged on this site. Submit your order request and our procurement team
          will immediately log your order, verify lot availability, and email secure payment instructions.
        </p>
      </div>

      {submitError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
          {submitError}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Addresses & Contact Information */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="font-display text-lg font-bold text-white">Shipping Address</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-400">First Name *</label>
                <input
                  type="text" required
                  value={shippingAddress.firstName}
                  onChange={e => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Last Name *</label>
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
                <label className="text-slate-400">Email Address *</label>
                <input
                  type="email" required
                  value={shippingAddress.email}
                  onChange={e => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs font-mono">
              <label className="text-slate-400">Street Address *</label>
              <input
                type="text" required
                value={shippingAddress.address}
                onChange={e => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-400">City *</label>
                <input
                  type="text" required
                  value={shippingAddress.city}
                  onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">State / Prov *</label>
                <input
                  type="text" required
                  value={shippingAddress.state}
                  onChange={e => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">ZIP / Postal *</label>
                <input
                  type="text" required
                  value={shippingAddress.zip}
                  onChange={e => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

          </div>

          {/* Shipping Method Selector */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan-400" />
                <span>Shipping Method</span>
              </h3>
              <span className="mono-tag text-[10px] uppercase tracking-widest text-slate-500">Insulated</span>
            </div>
            
            <div className="grid gap-3">
              {vialFoundryBrandConfig.shippingOptions.map((opt) => {
                const isSelected = shippingMethodId === opt.id;
                const costDisplay =
                  opt.id === 'standard' && subtotalCents >= (opt.freeShippingThresholdCents ?? 20000)
                    ? 'FREE'
                    : `$${(opt.costCents / 100).toFixed(2)}`;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setShippingMethodId(opt.id)}
                    className={`text-left p-4 rounded-xl border transition-all flex items-start justify-between ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500/60 ring-1 ring-cyan-500/30'
                        : 'bg-slate-950 border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div>
                      <div className="font-display text-sm font-bold text-white">{opt.name}</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">{opt.description}</div>
                    </div>
                    <div className="font-mono text-sm font-bold text-cyan-300">
                      {costDisplay}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-white">Payment Method</h3>
              <span className="mono-tag text-[10px] uppercase tracking-widest text-slate-500">Select one</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                const active = paymentMethodId === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethodId(m.id)}
                    className={`text-left p-4 rounded-xl border transition-all flex items-start space-x-3 ${
                      active
                        ? 'bg-cyan-500/10 border-cyan-500/60'
                        : 'bg-slate-950 border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-cyan-400 border border-white/10'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-sm font-bold text-white flex items-center gap-2">
                        {m.label}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">{m.tagline}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] font-mono text-slate-500">
              Choose your preferred method. After submitting, you&apos;ll receive exact payment
              details and reference verification. No card is charged on this site.
            </p>
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
                I certify that all products in this order will be used exclusively for in vitro laboratory, analytical, or scientific research purposes (RUO). Not for human, clinical, veterinary, or diagnostic use.
              </span>
            </label>
          </div>

        </div>

        {/* Right Column: Order Summary */}
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
                  <span>Code {appliedDiscount.code} applied (-${(appliedDiscount.discountCents / 100).toFixed(2)})</span>
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
                  <span>Discount ({appliedDiscount.code})</span>
                  <span>-${(appliedDiscount.discountCents / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Shipping ({shippingInfo.label || 'Standard Shipping'})</span>
                <span className={shippingInfo.amountCents === 0 ? 'text-emerald-400 font-bold' : ''}>
                  {shippingInfo.displayPrice}
                </span>
              </div>
              <div className="flex justify-between text-white font-bold text-base pt-3 border-t border-white/10">
                <span>Total Due</span>
                <span className="text-cyan-400">${grandTotalDollars}</span>
              </div>
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
              <span>Direct Laboratory Procurement &bull; Instant Confirmation</span>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
}
