'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem } from '../types';

export interface LiveStockInfo {
  inStock: boolean;
  stockCount: number;
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
  liveInventory: Record<string, LiveStockInfo>;
  getLiveStock: (item: Product | string) => LiveStockInfo;
  refreshInventory: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start empty so the first client render matches the server's. Reading
  // localStorage during render instead produced a hydration mismatch that threw on
  // every page with the cart badge, including checkout.
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [liveInventory, setLiveInventory] = useState<Record<string, LiveStockInfo>>({});

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

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vf_cart');
      if (saved) setCart(JSON.parse(saved));
    } catch {
      /* corrupt or unavailable storage: start with an empty cart */
    }
    setHydrated(true);
    refreshInventory();
  }, [refreshInventory]);

  useEffect(() => {
    // Don't persist the pre-hydration empty cart over a saved one.
    if (!hydrated) return;
    try {
      localStorage.setItem('vf_cart', JSON.stringify(cart));
    } catch {
      /* storage full or blocked: the cart still works for this session */
    }
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
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(maxStock, existing.quantity + quantity);
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQty }
            : item
        );
      }
      const initialQty = Math.min(maxStock, Math.max(1, quantity));
      return [...prev, { product, quantity: initialQty }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
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

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

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
