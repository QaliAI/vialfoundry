'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product, CartItem } from '../types';

export interface LiveStockInfo {
  inStock: boolean;
  stockCount: number;
}

export interface AppliedPromoState {
  code: string;
  name?: string;
  description?: string;
  discountType?: string;
  discountRateBps?: number;
  fixedDiscountCents?: number;
  discountCents: number;
  firstOrderOnly?: boolean;
  isAffiliate?: boolean;
  affiliateCode?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  appliedPromo: AppliedPromoState | null;
  applyPromoCode: (code: string, customerEmail?: string) => Promise<{ success: boolean; error?: string }>;
  removePromoCode: () => void;
  discountAmount: number;
  estimatedTotal: number;
  liveInventory: Record<string, LiveStockInfo>;
  getLiveStock: (item: Product | string) => LiveStockInfo;
  refreshInventory: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start empty so the first client render matches the server's.
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [liveInventory, setLiveInventory] = useState<Record<string, LiveStockInfo>>({});
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromoState | null>(null);

  const refreshInventory = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory/availability');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.inventory) {
          setLiveInventory(data.inventory);
        }
      }
    } catch {
      /* fallback to static inventory silently */
    }
  }, []);

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );

  const subtotalCents = Math.round(subtotal * 100);

  // Recompute discount whenever subtotal changes
  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    let cents = 0;
    if (appliedPromo.discountRateBps && appliedPromo.discountRateBps > 0) {
      cents += Math.round(subtotalCents * (appliedPromo.discountRateBps / 10000));
    }
    if (appliedPromo.fixedDiscountCents && appliedPromo.fixedDiscountCents > 0) {
      cents += appliedPromo.fixedDiscountCents;
    }
    cents = Math.min(subtotalCents, Math.max(0, cents));
    return cents / 100;
  }, [appliedPromo, subtotalCents]);

  const estimatedTotal = useMemo(
    () => Math.max(0, subtotal - discountAmount),
    [subtotal, discountAmount]
  );

  const applyPromoCode = useCallback(
    async (code: string, customerEmail?: string): Promise<{ success: boolean; error?: string }> => {
      const clean = String(code || '').trim().toUpperCase();
      if (!clean) {
        setAppliedPromo(null);
        try { localStorage.removeItem('vf_pending_promo'); } catch {}
        return { success: false, error: 'Please enter a code.' };
      }

      try {
        const res = await fetch('/api/promotions/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: clean,
            subtotalCents,
            customerEmail: customerEmail || undefined,
          }),
        });

        const data = await res.json();
        if (data.success && data.valid && data.code) {
          const promoState: AppliedPromoState = {
            code: data.code,
            name: data.name,
            description: data.description,
            discountType: data.discountType,
            discountRateBps: data.discountRateBps || 0,
            fixedDiscountCents: data.fixedDiscountCents || 0,
            discountCents: data.discountCents || 0,
            firstOrderOnly: data.firstOrderOnly,
            isAffiliate: data.isAffiliate,
            affiliateCode: data.affiliateCode,
          };
          setAppliedPromo(promoState);
          try { localStorage.setItem('vf_pending_promo', data.code); } catch {}
          return { success: true };
        }

        return { success: false, error: data.error || 'Invalid promotion or partner code.' };
      } catch (err: any) {
        return { success: false, error: err.message || 'Error validating code.' };
      }
    },
    [subtotalCents]
  );

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
    try {
      localStorage.removeItem('vf_pending_promo');
    } catch {}
  }, []);

  // Hydrate cart and check pending promo
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('vf_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const pending = localStorage.getItem('vf_pending_promo');
      if (pending) {
        // Silently validate and restore pending promo
        applyPromoCode(pending);
      }
    } catch {
      /* corrupt or unavailable storage */
    }
    setHydrated(true);
    refreshInventory();
  }, [applyPromoCode, refreshInventory]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('vf_cart', JSON.stringify(cart));
    } catch {}
  }, [cart, hydrated]);

  const getLiveStock = useCallback(
    (item: Product | string): LiveStockInfo => {
      const id = typeof item === 'string' ? item : item.id;
      const sku = typeof item === 'string' ? item : item.sku;
      const live = liveInventory[id] || liveInventory[sku];
      if (live) {
        return { inStock: live.inStock, stockCount: live.stockCount };
      }
      if (typeof item !== 'string') {
        return {
          inStock: item.inStock && item.stockCount > 0,
          stockCount: item.stockCount,
        };
      }
      return { inStock: true, stockCount: 999 };
    },
    [liveInventory]
  );

  const addToCart = (product: Product, quantity = 1) => {
    const stock = getLiveStock(product);
    if (!stock.inStock || stock.stockCount <= 0) return;
    const maxStock = stock.stockCount;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(maxStock, existing.quantity + quantity);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      const initialQty = Math.min(maxStock, Math.max(1, quantity));
      return [...prev, { product, quantity: initialQty }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const stock = getLiveStock(item.product);
          const maxStock = stock.stockCount || item.product.stockCount || Infinity;
          return { ...item, quantity: Math.min(maxStock, quantity) };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        totalItems,
        subtotal,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        discountAmount,
        estimatedTotal,
        liveInventory,
        getLiveStock,
        refreshInventory,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
