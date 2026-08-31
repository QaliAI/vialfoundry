import React, { useState } from 'react';
import { Product } from '../types';
import { BATCH_RECORDS } from '../data/batches';
import { COAModal } from '../components/COAModal';
import { useCart } from '../context/CartContext';
import { ShieldCheck, FileCheck, ShoppingBag, ArrowLeft, CheckCircle2, Copy } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { ProductTabs } from '../components/ProductTabs';
import { RestockNotify } from '../components/RestockNotify';
import { ReviewList } from '../components/ReviewList';
import { productSlug } from '../lib/slug';

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
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showCOAModal, setShowCOAModal] = useState(false);
  const [copiedSeq, setCopiedSeq] = useState(false);
  const maxQuantity = product.inStock ? product.stockCount : Infinity;

  const batchRecord = BATCH_RECORDS[product.lotNumber];

  const handleCopySeq = () => {
    if (product.sequence) {
      navigator.clipboard.writeText(product.sequence);
      setCopiedSeq(true);
      setTimeout(() => setCopiedSeq(false), 2000);
    }
  };

  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku,
    description: product.description,
    category: product.category,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price.toFixed(2),
      priceCurrency: 'USD',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 bg-[#FAFAF9]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/catalog')}
        className="inline-flex items-center space-x-2 text-xs font-mono font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </button>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Studio Product Photography Viewer */}
        <div className="lg:col-span-6 storefront-card rounded-2xl p-8 sm:p-12 bg-white border border-slate-200/90 relative overflow-hidden flex items-center justify-center min-h-[460px] shadow-sm">
          
          {/* Category & Lot Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{product.purityPercentage}% RP-HPLC</span>
            </span>
            <span className="text-[11px] font-mono text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
              LOT: {product.lotNumber}
            </span>
          </div>

          {/* Vial Image */}
          <img
            src={product.image}
            alt={product.name}
            className="max-h-96 w-full object-contain filter drop-shadow-sm transition-all duration-300"
          />
        </div>

        {/* Right Column: Specifications & Purchasing Panel */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-800 uppercase tracking-widest">{product.category}</span>
              <span className="text-xs font-mono text-slate-500">SKU: {product.sku}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{product.name}</h1>
            <p className="text-xs font-mono text-slate-500">
              CAS: {product.casNumber} | MW: {product.molecularWeight} | Presentation: {product.size}
            </p>
          </div>

          <p className="text-sm text-slate-600 font-normal leading-relaxed">
            {product.description}
          </p>

          {/* Sequence Box if applicable */}
          {product.sequence && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold text-cyan-800 uppercase">Primary Amino Acid Sequence</span>
                <button
                  onClick={handleCopySeq}
                  className="flex items-center space-x-1 text-[11px] font-mono text-slate-500 hover:text-slate-900"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSeq ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="font-mono text-xs text-slate-800 break-all bg-slate-50 p-2.5 rounded border border-slate-200">
                {product.sequence}
              </p>
            </div>
          )}

          {/* Pricing & Add to Cart (or Restock when out of stock) */}
          {product.inStock ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-3xl font-bold text-slate-900">${product.price.toFixed(2)}</div>
                  <div className="text-[11px] font-medium text-emerald-700 flex items-center space-x-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>In Stock — Dispatched in Insulated Cold Packaging</span>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-300 rounded-xl p-1 font-mono text-xs shadow-2xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-white rounded font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-white rounded font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => addToCart(product, quantity)}
                  className="py-3.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-display font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                {batchRecord && (
                  <button
                    onClick={() => setShowCOAModal(true)}
                    className="py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-display font-bold text-xs transition-all flex items-center justify-center space-x-2"
                  >
                    <FileCheck className="w-4 h-4 text-cyan-800" />
                    <span>Inspect Lot COA</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <RestockNotify product={product} />
          )}

          {/* Technical Specs Checklist */}
          <div className="space-y-2 border-t border-slate-200 pt-5">
            <h4 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">Physical Characteristics</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase">APPEARANCE</span>
                <span className="text-slate-900 font-medium">{product.appearance}</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase">SOLUBILITY</span>
                <span className="text-slate-900 font-medium">{product.solubility}</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-200 sm:col-span-2">
                <span className="text-slate-500 block text-[10px] uppercase">STORAGE CONDITIONS</span>
                <span className="text-slate-900 font-medium">{product.storageConditions}</span>
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
        <div className="space-y-6 border-t border-slate-200 pt-12">
          <h3 className="font-display text-2xl font-bold text-slate-900">Related Reference Materials</h3>
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

    </div>
  );
};

