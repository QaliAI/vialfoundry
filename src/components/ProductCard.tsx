import React from 'react';
import { ShoppingBag, FileCheck, Check } from 'lucide-react';
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
    <div className="storefront-card rounded-2xl overflow-hidden flex flex-col justify-between group bg-white border border-slate-200/90 hover:border-cyan-600/40 hover:shadow-card-hover transition-all duration-200">
      {/* Top Image Container */}
      <div 
        onClick={() => onViewProduct(product)}
        className="relative aspect-square w-full bg-[#F8FAFC] p-6 flex items-center justify-center overflow-hidden cursor-pointer border-b border-slate-100"
      >
        {/* Subtle Category Pill Top Left */}
        <div className="absolute top-3 left-3 z-10">
          <span className="text-[10px] font-mono font-medium text-slate-600 bg-white/90 border border-slate-200/80 px-2 py-0.5 rounded shadow-2xs">
            {product.category}
          </span>
        </div>

        {/* Product Vial Image */}
        <img
          src={product.image}
          alt={product.name}
          className="relative z-10 max-h-56 w-full object-contain filter drop-shadow-sm group-hover:scale-[1.03] transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Product Details Section */}
      <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between bg-white">
        <div className="space-y-1.5">
          {/* Size / Presentation */}
          <div className="text-xs font-mono text-cyan-800 font-medium">
            {product.size}
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onViewProduct(product)}
            className="font-display text-base font-bold text-slate-900 hover:text-cyan-700 transition-colors cursor-pointer line-clamp-1 leading-snug"
          >
            {product.name}
          </h3>

          {/* Brief Factual Subtext */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & Cart Action Bar */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="font-mono text-lg font-bold text-slate-900">
              ${product.price.toFixed(2)}
            </div>
            {product.inStock ? (
              <div className="text-[11px] text-emerald-700 font-medium flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>In Stock</span>
              </div>
            ) : (
              <div className="text-[11px] text-amber-600 font-medium">Out of Stock</div>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            {product.coaAvailable && onViewCOA && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewCOA(product.lotNumber);
                }}
                className="px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-mono font-medium transition-colors"
                title="View HPLC Lab Results"
              >
                <FileCheck className="w-3.5 h-3.5" />
              </button>
            )}

            {product.inStock ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-medium text-xs shadow-sm transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProduct(product);
                }}
                className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-medium transition-all"
              >
                <span>Notify</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

