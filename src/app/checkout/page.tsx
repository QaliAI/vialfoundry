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
import { trackEvent } from '../../lib/analytics';

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

  // Funnel entry. Fires once per checkout visit that has something to buy.
  const cartCount = cart.length;
  useEffect(() => {
    if (cartCount === 0) return;
    trackEvent('checkout_started', { items: cartCount, subtotal });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartCount > 0]);

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

      trackEvent('order_submitted', {
        items: cart.length,
        totalCents: data.totalAmount || grandTotalCents,
        paymentMethod: paymentMethodId,
        shippingMethod: shippingMethodId,
        promoApplied: !!appliedDiscount,
        affiliate: !!affiliateCode,
      });

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
      <div className="pt-32 pb-20 max-w-xl mx-auto px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-brand-canvas flex items-center justify-center mx-auto text-brand-steel">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h2 className="font-display text-2xl font-bold text-brand-ink">Your Cart is Empty</h2>
        <p className="text-xs text-brand-steel font-sans">Add reference materials or standards to proceed with checkout.</p>
        <button
          onClick={() => router.push('/catalog')}
          className="px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-graphite text-brand-paper font-semibold text-xs font-display shadow-xs"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 bg-brand-canvas">
      
      <div className="space-y-2">
        <div className="text-xs font-sans font-semibold text-brand-steel uppercase tracking-wider">
          Procurement Order
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink tracking-tight">
          Submit Research Order Request
        </h1>
        <p className="text-sm text-brand-steel font-normal max-w-2xl leading-relaxed">
          Submit your order request and our procurement team will log your order, verify lot allocation, and issue invoice and payment instructions.
        </p>
      </div>

      {submitError && (
        <div className="p-4 rounded-xl bg-brand-paper border border-brand-danger text-brand-danger text-xs font-sans font-medium">
          {submitError}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Addresses & Contact Information */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="storefront-card p-6 sm:p-8 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-4">
            <h3 className="font-display text-lg font-bold text-brand-ink">Shipping Address</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-brand-steel font-medium">First Name *</label>
                <input
                  type="text" required
                  value={shippingAddress.firstName}
                  onChange={e => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
              </div>
              <div className="space-y-1">
                <label className="text-brand-steel font-medium">Last Name *</label>
                <input
                  type="text" required
                  value={shippingAddress.lastName}
                  onChange={e => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-brand-steel font-medium">Institution / Company (Optional)</label>
                <input
                  type="text"
                  value={shippingAddress.company}
                  onChange={e => setShippingAddress({ ...shippingAddress, company: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
              </div>
              <div className="space-y-1">
                <label className="text-brand-steel font-medium">Email Address *</label>
                <input
                  type="email" required
                  value={shippingAddress.email}
                  onChange={e => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs font-sans">
              <label className="text-brand-steel font-medium">Street Address *</label>
              <input
                type="text" required
                value={shippingAddress.address}
                onChange={e => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-brand-steel font-medium">City *</label>
                <input
                  type="text" required
                  value={shippingAddress.city}
                  onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
              </div>
              <div className="space-y-1">
                <label className="text-brand-steel font-medium">State / Prov *</label>
                <input
                  type="text" required
                  value={shippingAddress.state}
                  onChange={e => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
              </div>
              <div className="space-y-1">
                <label className="text-brand-steel font-medium">ZIP / Postal *</label>
                <input
                  type="text" required
                  value={shippingAddress.zip}
                  onChange={e => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
              </div>
            </div>

          </div>

          {/* Shipping Method Selector */}
          <div className="storefront-card p-6 sm:p-8 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-brand-ink flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-accent" />
                <span>Shipping Method</span>
              </h3>
              <span className="text-[11px] font-sans font-medium text-brand-mineral">Insulated Packaging</span>
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
                        ? 'bg-brand-canvas border-brand-graphite ring-1 ring-brand-graphite/20'
                        : 'bg-brand-paper border-brand-border hover:border-brand-border-strong'
                    }`}
                  >
                    <div>
                      <div className="font-display text-sm font-bold text-brand-ink">{opt.name}</div>
                      <div className="text-[11px] font-sans text-brand-steel mt-0.5">{opt.description}</div>
                    </div>
                    <div className="font-mono text-sm font-bold text-brand-ink">
                      {costDisplay}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="storefront-card p-6 sm:p-8 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-brand-ink">Payment Method</h3>
              <span className="text-[11px] font-sans text-brand-steel">Select preference</span>
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
                        ? 'bg-brand-canvas border-brand-graphite ring-1 ring-brand-graphite/20'
                        : 'bg-brand-paper border-brand-border hover:border-brand-border-strong'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      active ? 'bg-brand-primary text-brand-paper' : 'bg-brand-canvas text-brand-ink border border-brand-border'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-sm font-bold text-brand-ink flex items-center gap-2">
                        {m.label}
                      </div>
                      <div className="text-[11px] font-sans text-brand-steel">{m.tagline}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] font-sans text-brand-steel">
              Choose your preferred method. After submitting, you&apos;ll receive exact payment details and reference verification. No credit card is charged on this site.
            </p>
          </div>

          {/* RUO Compliance Checkbox */}
          <div className="p-4 rounded-xl bg-brand-paper border border-brand-border space-y-2">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={ruoAgreed}
                onChange={e => setRuoAgreed(e.target.checked)}
                className="mt-1 rounded bg-brand-canvas border-brand-border text-brand-primary focus:ring-0"
              />
              <span className="text-xs font-sans text-brand-ink leading-relaxed">
                I certify that all products in this order will be used exclusively for in vitro laboratory, analytical, or scientific research purposes (RUO). Not for human, clinical, veterinary, or diagnostic use.
              </span>
            </label>
          </div>

        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="storefront-card p-6 sm:p-8 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-4 sticky top-24">
            <h3 className="font-display text-lg font-bold text-brand-ink">Order Summary</h3>

            {/* Itemized List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 border-b border-brand-border/60 pb-4">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between text-xs font-sans">
                  <div>
                    <span className="text-brand-ink font-bold">{product.name}</span>
                    <span className="text-brand-steel block text-[10px] font-mono">Qty: {quantity} | LOT: {product.lotNumber}</span>
                  </div>
                  <span className="text-brand-ink font-mono font-bold">${(product.price * quantity).toFixed(2)}</span>
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
                  className="flex-1 px-3 py-2 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink font-sans text-xs focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
                <button
                  onClick={handleApplyDiscount}
                  type="button"
                  className="px-4 py-2 rounded-xl bg-brand-surface-muted hover:bg-brand-border text-xs font-sans font-bold text-brand-ink border border-brand-border transition-colors"
                >
                  Apply
                </button>
              </div>
              {appliedDiscount && (
                <div className="text-[11px] font-sans text-brand-mineral flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Code {appliedDiscount.code} applied (-${(appliedDiscount.discountCents / 100).toFixed(2)})</span>
                </div>
              )}
              {discountError && (
                <div className="text-[11px] font-sans text-brand-danger">{discountError}</div>
              )}
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-2 text-xs font-sans pt-2">
              <div className="flex justify-between text-brand-steel">
                <span>Subtotal</span>
                <span className="font-bold font-mono text-brand-ink">${subtotal.toFixed(2)}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-brand-mineral font-medium">
                  <span>Discount ({appliedDiscount.code})</span>
                  <span className="font-mono">-${(appliedDiscount.discountCents / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-brand-steel">
                <span>Shipping ({shippingInfo.label || 'Standard Ground'})</span>
                <span className={shippingInfo.amountCents === 0 ? 'text-brand-mineral font-bold font-mono' : 'text-brand-ink font-mono'}>
                  {shippingInfo.displayPrice}
                </span>
              </div>
              <div className="flex justify-between text-brand-ink font-bold text-base pt-3 border-t border-brand-border/60">
                <span>Total Due</span>
                <span className="font-mono text-brand-ink">${grandTotalDollars}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-brand-primary hover:bg-brand-graphite text-brand-paper font-display font-bold text-sm shadow-xs flex items-center justify-center space-x-2 transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting Request...' : 'Submit Order Request'}</span>
            </button>

            <div className="text-center text-[11px] font-sans text-brand-steel flex items-center justify-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
              <span>Direct Laboratory Procurement · Order Confirmation</span>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
}
