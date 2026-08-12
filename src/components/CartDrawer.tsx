import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  navigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ navigate }) => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-950 border-l border-white/15 shadow-2xl p-6 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <h2 className="font-display text-lg font-bold text-white">
                Research Cart ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto py-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-slate-400 text-sm">Your research cart is empty.</p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/catalog');
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between space-x-4"
                >
                  <img
                    src={product.transparentImage || product.image}
                    alt={product.name}
                    className="w-12 h-12 object-contain bg-slate-950 rounded-lg p-1"
                  />

                  <div className="flex-1 space-y-1">
                    <h4 className="text-xs font-bold text-white font-display line-clamp-1">
                      {product.name}
                    </h4>
                    <div className="mono-tag text-[10px] text-slate-400">
                      LOT: {product.lotNumber} | ${product.price.toFixed(2)}
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-xs font-bold text-white w-6 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <div className="font-mono text-sm font-bold text-cyan-300">
                      ${(product.price * quantity).toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="border-t border-white/10 pt-4 space-y-4">
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Insulated Cold Packaging</span>
                  <span className="text-emerald-400 font-bold">INCLUDED</span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-cyan-400">${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  alert('Checkout initiated. Thank you for placing your research material order with Vial Foundry.');
                }}
                className="w-full py-3.5 rounded-xl bg-cyan-500 text-slate-950 font-display font-bold text-sm hover:bg-cyan-400 transition-all shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[10px] font-mono text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>FOR LABORATORY & RESEARCH USE ONLY</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
