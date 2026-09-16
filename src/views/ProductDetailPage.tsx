import React, { useEffect, useState, useRef } from 'react';
import { Product } from '../types';
import { getBatchRecord, getDocumentationStatus } from '../data/batches';
import { COAModal } from '../components/COAModal';
import { useCart } from '../context/CartContext';
import { FileCheck, FileClock, ShoppingBag, ArrowLeft, CheckCircle2, Copy } from 'lucide-react';
import { PUBLIC_PRODUCTS } from '../data/products';
import { categoryLabel, productTitle, productSize } from '../lib/catalog-display';
import { ProductCard } from '../components/ProductCard';
import { ProductTabs } from '../components/ProductTabs';
import { RestockNotify } from '../components/RestockNotify';
import { ReviewList } from '../components/ReviewList';
import { productSlug } from '../lib/slug';
import { DocumentationStatusBadge } from '../components/DocumentationStatusBadge';
import { trackEvent } from '../lib/analytics';

interface ProductDetailPageProps {
  product: Product;
  navigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  navigate,
  onSelectProduct
}) => {
  const { addToCart, getLiveStock } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showCOAModal, setShowCOAModal] = useState(false);
  const [copiedSeq, setCopiedSeq] = useState(false);
  const [showMobileStickyBar, setShowMobileStickyBar] = useState(false);
  const buyPanelRef = useRef<HTMLDivElement>(null);
  const liveStock = getLiveStock ? getLiveStock(product) : { inStock: product.inStock, stockCount: product.stockCount };
  const isAvailable = liveStock.inStock && liveStock.stockCount > 0;
  const maxQuantity = isAvailable ? liveStock.stockCount : 0;

  const batchRecord = getBatchRecord(product.lotNumber) ?? undefined;
  const docStatus = getDocumentationStatus(product);

  useEffect(() => {
    trackEvent('product_viewed', {
      productId: product.id,
      category: product.category,
      price: product.price,
      documentation: docStatus,
      inStock: isAvailable,
    });
  }, [product.id, product.category, product.price, isAvailable, docStatus]);

  useEffect(() => {
    const el = buyPanelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show the mobile sticky bar only once the primary buy panel scrolls above viewport
        const rect = entry.boundingClientRect;
        setShowMobileStickyBar(!entry.isIntersecting && rect.top < 0);
      },
      { threshold: 0 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [product.id]);

  const handleCopySeq = () => {
    if (product.sequence) {
      navigator.clipboard.writeText(product.sequence);
      setCopiedSeq(true);
      setTimeout(() => setCopiedSeq(false), 2000);
    }
  };

  // Regression safety: only public catalog products may appear as recommendations
  const relatedProducts = PUBLIC_PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3);

  const canonicalUrl = `https://www.vialfoundry.com/product/${product.id}`;
  const absoluteImageUrl = `https://www.vialfoundry.com${product.image}`;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productTitle(product),
    sku: product.sku,
    description: product.description,
    category: categoryLabel(product.category),
    image: absoluteImageUrl,
    url: canonicalUrl,
    offers: {
      '@type': 'Offer',
      price: product.price.toFixed(2),
      priceCurrency: 'USD',
      availability: liveStock.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: canonicalUrl,
      seller: {
        '@type': 'Organization',
        name: 'Vial Foundry',
        url: 'https://www.vialfoundry.com',
      },
    },
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 bg-brand-canvas">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/catalog')}
        className="inline-flex items-center space-x-2 text-xs font-sans font-medium text-brand-steel hover:text-brand-ink transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </button>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Studio Product Photography Viewer */}
        <div className="lg:col-span-6 storefront-card rounded-2xl p-8 sm:p-12 bg-brand-paper border border-brand-border relative overflow-hidden flex items-center justify-center min-h-[460px] shadow-sm">
          
          {/* Category & Lot Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-md bg-brand-canvas border border-brand-border text-brand-graphite font-sans text-xs font-medium">
              <span>{categoryLabel(product.category)}</span>
            </span>
            {batchRecord && (
              <span className="text-[11px] font-mono text-brand-steel bg-brand-paper border border-brand-border px-2.5 py-1 rounded">
                LOT: {batchRecord.lotNumber}
              </span>
            )}
            <DocumentationStatusBadge status={docStatus} size="md" className="bg-brand-paper" />
          </div>

          {/* Vial Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={productTitle(product)}
            width={384}
            height={384}
            className="max-h-96 w-full object-contain filter drop-shadow-sm transition-all duration-300"
          />
        </div>

        {/* Right Column: Specifications & Purchasing Panel */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans font-semibold text-brand-steel uppercase tracking-widest">{categoryLabel(product.category)}</span>
              <span className="text-xs font-mono text-brand-steel">SKU: {product.sku}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink tracking-tight">{productTitle(product)}</h1>
            <p className="text-xs font-mono text-brand-steel">
              {productSize(product)} &nbsp;·&nbsp; CAS {product.casNumber} &nbsp;·&nbsp; MW {product.molecularWeight}
            </p>
          </div>

          <p className="text-sm text-brand-steel font-normal leading-relaxed">
            {product.description}
          </p>

          {/* Sequence Box if applicable */}
          {product.sequence && (
            <div className="p-4 rounded-xl bg-brand-paper border border-brand-border space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans font-semibold text-brand-graphite uppercase tracking-wider">Primary Amino Acid Sequence</span>
                <button
                  onClick={handleCopySeq}
                  className="flex items-center space-x-1 text-[11px] font-sans text-brand-steel hover:text-brand-ink"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSeq ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="font-mono text-xs text-brand-ink break-all bg-brand-canvas p-2.5 rounded border border-brand-border">
                {product.sequence}
              </p>
            </div>
          )}

          {/* Pricing & Add to Cart (or Restock when out of stock) */}
          {isAvailable ? (
            <div ref={buyPanelRef} className="p-6 rounded-2xl bg-brand-paper border border-brand-border shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-3xl font-bold text-brand-ink tracking-tight">${product.price.toFixed(2)}</div>
                  <div className="text-[11px] font-medium text-brand-mineral flex items-center space-x-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent" />
                    <span>In stock &mdash; packed carefully for shipping</span>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center space-x-2 bg-brand-canvas border border-brand-border rounded-xl p-1 font-mono text-xs shadow-2xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-brand-graphite hover:bg-brand-paper rounded font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-brand-ink">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center text-brand-graphite hover:bg-brand-paper rounded font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    addToCart(product, quantity);
                    trackEvent('add_to_cart', {
                      productId: product.id,
                      price: product.price,
                      quantity,
                      source: 'product_detail',
                      documentation: docStatus,
                    });
                  }}
                  className="py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-display font-bold text-xs shadow-xs flex items-center justify-center space-x-2 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                {batchRecord ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCOAModal(true);
                      trackEvent('documentation_viewed', {
                        productId: product.id,
                        source: 'product_detail',
                      });
                    }}
                    className="py-3.5 rounded-xl bg-brand-canvas hover:bg-brand-surface-muted border border-brand-border text-brand-ink font-display font-bold text-xs transition-all flex items-center justify-center space-x-2"
                  >
                    <FileCheck className="w-4 h-4 text-brand-accent" />
                    <span>Read the certificate</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      trackEvent('documentation_requested', {
                        productId: product.id,
                        lot: product.lotNumber,
                        source: 'product_detail',
                      });
                      navigate('/contact');
                    }}
                    className="py-3.5 rounded-xl bg-brand-canvas hover:bg-brand-surface-muted border border-brand-border text-brand-graphite font-display font-bold text-xs transition-all flex items-center justify-center space-x-2"
                  >
                    <FileClock className="w-4 h-4" />
                    <span>Ask About Documents</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div ref={buyPanelRef}>
              <RestockNotify product={product} />
            </div>
          )}

          {/* Technical Specs Checklist */}
          <div className="space-y-2 border-t border-brand-border pt-5">
            <h4 className="text-xs font-sans font-semibold text-brand-graphite uppercase tracking-wider">Product Specifications</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px] leading-relaxed">
              <div className="p-3 rounded-lg bg-brand-paper border border-brand-border">
                <span className="text-brand-steel block text-[10px] uppercase font-sans font-medium">PRESENTATION</span>
                <span className="text-brand-ink font-medium">{product.size}</span>
              </div>
              <div className="p-3 rounded-lg bg-brand-paper border border-brand-border">
                <span className="text-brand-steel block text-[10px] uppercase font-sans font-medium">CAS REGISTRY</span>
                <span className="text-brand-ink font-medium">{product.casNumber}</span>
              </div>
              <div className="p-3 rounded-lg bg-brand-paper border border-brand-border sm:col-span-2">
                <span className="text-brand-steel block text-[10px] uppercase font-sans font-medium">STORAGE GUIDELINE</span>
                <span className="text-brand-ink font-medium">Store sealed in original container at -20°C in a dry environment. Protect from light. RUO only.</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Rich tabbed product detail */}
      <ProductTabs
        product={product}
        batchRecord={batchRecord}
        onViewCOA={batchRecord ? () => setShowCOAModal(true) : undefined}
        navigate={navigate}
      />

      {/* Verified Reviews */}
      <ReviewList productSlug={productSlug(product.name)} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 border-t border-brand-border pt-12">
          <h3 className="font-display text-2xl font-bold text-brand-ink">More Research Peptides</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onViewProduct={onSelectProduct} />
            ))}
          </div>
        </div>
      )}

      {/* COA Modal */}
      {showCOAModal && batchRecord && (
        <COAModal batch={batchRecord} onClose={() => setShowCOAModal(false)} />
      )}

      {/* Mobile Sticky Purchase Bar (shows only when primary buy panel scrolls away) */}
      {showMobileStickyBar && (
        <div
          role="region"
          aria-label="Quick mobile purchase"
          className="fixed bottom-0 left-0 right-0 z-30 bg-brand-paper/95 backdrop-blur-md border-t border-brand-border p-3 shadow-lg md:hidden animate-in slide-in-from-bottom duration-200"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="font-display font-bold text-xs sm:text-sm text-brand-ink truncate">
                {productTitle(product)}
              </div>
              <div className="font-mono text-xs text-brand-steel font-semibold">
                ${product.price.toFixed(2)}
                {isAvailable && quantity > 1 && (
                  <span className="font-sans text-[10px] text-brand-steel/80 ml-1.5">
                    (Qty: {quantity} &middot; ${(product.price * quantity).toFixed(2)})
                  </span>
                )}
              </div>
            </div>

            {isAvailable ? (
              <button
                type="button"
                onClick={() => {
                  addToCart(product, quantity);
                  trackEvent('add_to_cart', {
                    productId: product.id,
                    price: product.price,
                    quantity,
                    source: 'mobile_sticky_bar',
                    documentation: docStatus,
                  });
                }}
                className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-display font-bold text-xs shadow-xs flex items-center space-x-1.5 transition-all flex-shrink-0"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="px-3.5 py-2.5 rounded-xl bg-brand-surface-muted text-brand-steel font-display font-medium text-xs border border-brand-border flex-shrink-0"
              >
                Notify
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
