import React from 'react';
import { ShoppingBag, FileCheck, SlidersHorizontal } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { getDocumentationStatus } from '../data/batches';
import { productTitle, productSize } from '../lib/catalog-display';
import { trackEvent } from '../lib/analytics';

interface ProductCardProps {
  product: Product;
  variants?: Product[];
  onViewProduct: (product: Product) => void;
  onViewCOA?: (lotNumber: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variants = [product],
  onViewProduct,
  onViewCOA
}) => {
  const { addToCart, getLiveStock } = useCart();
  const variantAvailability = variants.map((variant) =>
    getLiveStock ? getLiveStock(variant) : { inStock: variant.inStock, stockCount: variant.stockCount }
  );
  const isAvailable = variantAvailability.some((stock) => stock.inStock && stock.stockCount > 0);
  const hasOptions = variants.length > 1;
  const price = Math.min(...variants.map((variant) => variant.price));
  const docStatus = getDocumentationStatus(product);

  return (
    <div className="storefront-card rounded-2xl overflow-hidden flex flex-col justify-between group bg-brand-paper border border-brand-border hover:border-brand-border-strong hover:shadow-card-hover transition-all duration-200">
      {/* Top Image Container */}
      <div 
        onClick={() => onViewProduct(product)}
        className="relative aspect-square w-full bg-brand-canvas p-6 flex items-center justify-center overflow-hidden cursor-pointer border-b border-brand-border/60"
      >
        {/* Product Vial Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={productTitle(product)}
          width={224}
          height={224}
          className="relative z-10 max-h-56 w-full object-contain filter drop-shadow-sm group-hover:scale-[1.03] transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Product Details Section */}
      <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between bg-brand-paper">
        <div className="space-y-1.5">
          {/* Size / Presentation */}
          <div className="text-xs font-sans text-brand-steel font-medium">
            {variants.map(productSize).join(' | ')}
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onViewProduct(product)}
            className="font-display text-[15px] font-semibold text-brand-ink group-hover:text-brand-accent transition-colors cursor-pointer line-clamp-2 leading-snug"
          >
            {productTitle(product)}
          </h3>
        </div>

        {/* Pricing & Cart Action Bar */}
        <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between gap-2">
          <div>
            <div className="font-display text-lg font-bold text-brand-ink tracking-tight">
              {hasOptions ? 'From ' : ''}${price.toFixed(2)}
            </div>
            {isAvailable ? (
              <div className="text-[11px] text-brand-mineral font-medium flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-mineral" />
                <span>In Stock</span>
              </div>
            ) : (
              <div className="text-[11px] text-brand-steel font-medium mt-0.5">Out of stock</div>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            {docStatus === 'verified' && onViewCOA && product.lotNumber && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewCOA(product.lotNumber!);
                }}
                className="px-2.5 py-2 rounded-lg bg-brand-surface-muted hover:bg-brand-border text-brand-graphite border border-brand-border text-xs font-sans font-medium transition-colors shadow-2xs"
                title="View batch documents"
                aria-label={`View batch documents for ${productTitle(product)}`}
              >
                <FileCheck className="w-3.5 h-3.5 text-brand-accent" />
              </button>
            )}

            {isAvailable && !hasOptions ? (
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
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white font-display font-semibold text-xs shadow-xs transition-all"
                aria-label={`Add ${productTitle(product)} to cart`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </button>
            ) : hasOptions ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProduct(product);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white font-display font-semibold text-xs shadow-xs transition-all"
                aria-label={`View size options for ${productTitle(product)}`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>View Options</span>
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
