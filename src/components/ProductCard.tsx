import React from 'react';
import { ShoppingBag, FileCheck } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { getDocumentationStatus } from '../data/batches';
import { DocumentationStatusBadge } from './DocumentationStatusBadge';
import { trackEvent } from '../lib/analytics';

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
  const docStatus = getDocumentationStatus(product);

  return (
    <div className="storefront-card rounded-2xl overflow-hidden flex flex-col justify-between group bg-brand-paper border border-brand-border hover:border-brand-border-strong hover:shadow-card-hover transition-all duration-200">
      {/* Top Image Container */}
      <div 
        onClick={() => onViewProduct(product)}
        className="relative aspect-square w-full bg-brand-canvas p-6 flex items-center justify-center overflow-hidden cursor-pointer border-b border-brand-border/60"
      >
        {/* Category tag and the lot's actual documentation status */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-start justify-between gap-2">
          <span className="text-[10px] font-sans font-medium text-brand-graphite bg-brand-paper/95 border border-brand-border px-2 py-0.5 rounded shadow-2xs">
            {product.category}
          </span>
          <DocumentationStatusBadge status={docStatus} className="bg-brand-paper/95 shadow-2xs" />
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
      <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between bg-brand-paper">
        <div className="space-y-1.5">
          {/* Size / Presentation */}
          <div className="text-xs font-sans text-brand-steel font-medium">
            {product.size}
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onViewProduct(product)}
            className="font-display text-base font-bold text-brand-ink group-hover:text-brand-graphite transition-colors cursor-pointer line-clamp-1 leading-snug"
          >
            {product.name}
          </h3>

          {/* Brief Factual Subtext */}
          <p className="text-xs text-brand-steel line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & Cart Action Bar */}
        <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between gap-2">
          <div>
            <div className="font-mono text-lg font-bold text-brand-ink">
              ${product.price.toFixed(2)}
            </div>
            {product.inStock ? (
              <div className="text-[11px] text-brand-mineral font-medium flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-mineral" />
                <span>In Stock</span>
              </div>
            ) : (
              <div className="text-[11px] text-brand-metal font-medium">Out of Stock</div>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            {docStatus === 'verified' && onViewCOA && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewCOA(product.lotNumber);
                }}
                className="px-2.5 py-2 rounded-lg bg-brand-surface-muted hover:bg-brand-border text-brand-graphite border border-brand-border text-xs font-sans font-medium transition-colors shadow-2xs"
                title="View Lot Documentation & COA"
                aria-label={`View Certificate of Analysis for ${product.name}`}
              >
                <FileCheck className="w-3.5 h-3.5 text-brand-accent" />
              </button>
            )}

            {product.inStock ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                  trackEvent('add_to_cart', {
                    productId: product.id,
                    price: product.price,
                    source: 'product_card',
                    documentation: docStatus,
                  });
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-brand-primary hover:bg-brand-graphite text-brand-paper font-display font-semibold text-xs shadow-xs transition-all"
                aria-label={`Add ${product.name} to cart`}
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
                className="px-3 py-2 rounded-lg bg-brand-surface-muted text-brand-graphite hover:bg-brand-border text-xs font-medium transition-all"
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
