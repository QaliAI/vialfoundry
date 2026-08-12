import React from 'react';
import { ShieldCheck, FileCheck, ShoppingBag, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onViewProduct: (product: Product) => void;
  onViewCOA?: (lotNumber: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewProduct,
  onViewCOA
}) => {
  const { addToCart } = useCart();

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group relative">
      {/* Top Image Container */}
      <div className="relative aspect-square w-full bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 flex items-center justify-center overflow-hidden">
        {/* Background Radial Glow */}
        <div className="absolute inset-0 bg-radial-gradient opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Purity Badge Top Left */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold backdrop-blur-md">
            <ShieldCheck className="w-3 h-3" />
            <span>{product.purityPercentage}% HPLC</span>
          </span>
        </div>

        {/* Lot Number Tag Top Right */}
        <div className="absolute top-3 right-3 z-10">
          <span className="mono-tag text-[9px] text-slate-400 bg-slate-900/80 border border-white/10 px-2 py-0.5 rounded backdrop-blur-md">
            {product.lotNumber}
          </span>
        </div>

        {/* Vial Product Image */}
        <img
          src={product.transparentImage || product.image}
          alt={product.name}
          className="relative z-10 max-h-44 object-contain filter drop-shadow-xl transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Quick View Button */}
        <button
          onClick={() => onViewProduct(product)}
          className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/60 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-opacity duration-300"
        >
          <span className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-display text-xs font-bold shadow-lg flex items-center space-x-1">
            <span>Inspect Technical Specs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </button>
      </div>

      {/* Product Details Section */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Category */}
          <div className="flex items-center justify-between">
            <span className="mono-tag text-[9px] text-cyan-400 uppercase tracking-widest">
              {product.category}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{product.size}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onViewProduct(product)}
            className="font-display text-base font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          {/* Chemical Formula / CAS */}
          <div className="mono-tag text-[10px] text-slate-400 space-x-2">
            <span>CAS: {product.casNumber}</span>
            <span>•</span>
            <span>MW: {product.molecularWeight}</span>
          </div>
        </div>

        {/* Pricing & Cart Action Bar */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <div>
            <div className="font-mono text-lg font-bold text-white">
              ${product.price.toFixed(2)}
            </div>
            <div className="text-[9px] text-slate-400 font-mono flex items-center space-x-1">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
              <span>In Stock ({product.stockCount} Vials)</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {product.coaAvailable && onViewCOA && (
              <button
                onClick={() => onViewCOA(product.lotNumber)}
                className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
                title="View HPLC Certificate of Analysis"
              >
                <FileCheck className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => addToCart(product)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 border border-white/15 text-slate-100 hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-400 transition-all font-medium text-xs shadow-md"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
