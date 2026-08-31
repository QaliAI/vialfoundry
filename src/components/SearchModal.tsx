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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-brand-ink/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-brand-paper border border-brand-border rounded-2xl shadow-2xl overflow-hidden space-y-4 p-5 text-brand-ink">
        
        {/* Search Input Bar */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-5 h-5 text-brand-steel" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, CAS registry, lot numbers..."
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink placeholder-brand-steel font-sans text-sm focus:outline-none focus:bg-brand-paper focus:border-brand-graphite shadow-2xs"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="absolute right-3 p-1 rounded-lg text-brand-steel hover:text-brand-ink hover:bg-brand-surface-muted"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-10 text-brand-steel font-sans text-xs">
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
                className="p-3.5 rounded-xl bg-brand-canvas border border-brand-border/80 hover:border-brand-border-strong hover:bg-brand-surface-muted/50 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-brand-paper border border-brand-border text-brand-ink">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-brand-ink group-hover:text-brand-graphite transition-colors">
                      {product.name}
                    </h4>
                    <div className="text-[11px] font-sans text-brand-steel space-x-2">
                      <span>{product.size}</span>
                      <span>•</span>
                      <span className="font-mono">CAS: {product.casNumber}</span>
                      <span>•</span>
                      <span>{product.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-bold text-brand-ink"></span>
                  <ArrowRight className="w-4 h-4 text-brand-steel group-hover:text-brand-ink group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Footer Shortcut Hint */}
        <div className="pt-2 flex items-center justify-between border-t border-brand-border/60 text-[11px] font-sans text-brand-steel">
          <span>Search by compound name, SKU, or CAS</span>
          <div className="flex items-center space-x-1 font-mono">
            <kbd className="px-1.5 py-0.5 rounded bg-brand-canvas border border-brand-border text-brand-graphite text-[10px]">ESC</kbd>
            <span>to close</span>
          </div>
        </div>

      </div>
    </div>
  );
};
