import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Package } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface SearchModalProps {
  navigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onSelectProduct }) => {
  const { isSearchOpen, setIsSearchOpen } = useCart();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredProducts = PRODUCTS.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.casNumber.toLowerCase().includes(q) ||
      p.lotNumber.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.sequence && p.sequence.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden space-y-4 p-5 text-slate-900">
        
        {/* Search Input Bar */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, CAS registry, lot numbers..."
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 font-mono text-sm focus:outline-none focus:bg-white focus:border-cyan-600 shadow-2xs"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-mono text-xs">
              No matching compounds or lot records found for &quot;{query}&quot;.
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  setIsSearchOpen(false);
                  onSelectProduct(product);
                }}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-cyan-600/40 hover:bg-cyan-50/30 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-cyan-800">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-slate-900 group-hover:text-cyan-800 transition-colors">
                      {product.name}
                    </h4>
                    <div className="text-[11px] font-mono text-slate-500 space-x-2">
                      <span>{product.size}</span>
                      <span>•</span>
                      <span>CAS: {product.casNumber}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">{product.purityPercentage}% HPLC</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-bold text-slate-900">${product.price.toFixed(2)}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-800 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Footer Shortcut Hint */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-[11px] font-mono text-slate-500">
          <span>Search by compound name, SKU, or CAS</span>
          <div className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-600 text-[10px]">ESC</kbd>
            <span>to close</span>
          </div>
        </div>

      </div>
    </div>
  );
};

