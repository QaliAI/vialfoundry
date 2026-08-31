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
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl p-6 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-cyan-50 text-cyan-800">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Your Order ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto py-5 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <p className="text-slate-600 text-sm font-medium">Your research cart is empty.</p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/catalog');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-medium text-xs font-display shadow-sm"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between space-x-3.5"
                >
                  <img
                    src={product.transparentImage || product.image}
                    alt={product.name}
                    className="w-14 h-14 object-contain bg-white rounded-lg p-1 border border-slate-200/60"
                  />

                  <div className="flex-1 space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 font-display line-clamp-1">
                      {product.name}
                    </h4>
                    <div className="text-[11px] font-mono text-slate-500">
                      {product.size} · ${product.price.toFixed(2)}
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1 text-slate-600 hover:bg-slate-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs font-bold text-slate-900 px-2.5">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-1 text-slate-600 hover:bg-slate-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <div className="font-mono text-sm font-bold text-slate-900">
                      ${(product.price * quantity).toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Remove item"
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
            <div className="border-t border-slate-200 pt-4 space-y-4">
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Insulated Cold Packaging</span>
                  <span className="text-emerald-700 font-bold">INCLUDED</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-100">
                  <span>Estimated Total</span>
                  <span className="text-cyan-800">${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
                className="w-full py-3.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-medium text-sm shadow-sm flex items-center justify-center space-x-2 font-display transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[11px] font-mono text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>FOR RESEARCH USE ONLY · NOT FOR HUMAN USE</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

