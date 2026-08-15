import React, { useState } from 'react';
import { Product } from '../types';
import { BATCH_RECORDS } from '../data/batches';
import { COAModal } from '../components/COAModal';
import { useCart } from '../context/CartContext';
import { ShieldCheck, FileCheck, ShoppingBag, ArrowLeft, CheckCircle2, Copy, Download, Sun, Moon } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { ProductTabs } from '../components/ProductTabs';
import { RestockNotify } from '../components/RestockNotify';

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
  const [lightingMode, setLightingMode] = useState<'dark' | 'light'>('dark');
  const [showCOAModal, setShowCOAModal] = useState(false);
  const [copiedSeq, setCopiedSeq] = useState(false);

  const batchRecord = BATCH_RECORDS[product.lotNumber];

  const handleCopySeq = () => {
    if (product.sequence) {
      navigator.clipboard.writeText(product.sequence);
      setCopiedSeq(true);
      setTimeout(() => setCopiedSeq(false), 2000);
    }
  };

  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3);

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/catalog')}
        className="inline-flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </button>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Studio Product Photography Viewer */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-8 border border-white/10 relative overflow-hidden flex items-center justify-center min-h-[420px]">
          
          {/* Lighting Mode Selector */}
          <div className="absolute top-4 right-4 z-10 flex items-center space-x-1 p-1 rounded-full bg-slate-950 border border-white/10">
            <button
              onClick={() => setLightingMode('dark')}
              className={`p-1.5 rounded-full ${lightingMode === 'dark' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'}`}
              title="Dark Studio Lighting"
            >
              <Moon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLightingMode('light')}
              className={`p-1.5 rounded-full ${lightingMode === 'light' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-500'}`}
              title="Light Studio Lighting"
            >
              <Sun className="w-4 h-4" />
            </button>
          </div>

          {/* Purity & Lot Badges */}
          <div className="absolute top-4 left-4 z-10 space-y-2">
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold block">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{product.purityPercentage}% RP-HPLC</span>
            </span>
            <span className="mono-tag text-[10px] text-slate-400 bg-slate-950 border border-white/10 px-2.5 py-1 rounded block">
              LOT: {product.lotNumber}
            </span>
          </div>

          {/* Vial Image */}
          <img
            src={
              lightingMode === 'dark'
                ? product.image
                : '/assets/vials/single-vial-light.webp'
            }
            alt={product.name}
            className="max-h-80 object-contain filter drop-shadow-2xl transition-all duration-500"
          />
        </div>

        {/* Right Column: Specifications & Purchasing Panel */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="mono-tag text-xs text-cyan-400 uppercase tracking-widest">{product.category}</span>
              <span className="text-xs font-mono text-slate-400">SKU: {product.sku}</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-white">{product.name}</h1>
            <p className="text-xs font-mono text-slate-400">
              CAS: {product.casNumber} | MW: {product.molecularWeight} | Size: {product.size}
            </p>
          </div>

          <p className="text-xs text-slate-300 font-light leading-relaxed">
            {product.description}
          </p>

          {/* Sequence Box if applicable */}
          {product.sequence && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="mono-tag text-[10px] text-cyan-400 uppercase">Amino Acid Sequence</span>
                <button
                  onClick={handleCopySeq}
                  className="flex items-center space-x-1 text-[10px] font-mono text-slate-400 hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedSeq ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="font-mono text-xs text-slate-200 break-all bg-slate-950 p-2 rounded border border-white/5">
                {product.sequence}
              </p>
            </div>
          )}

          {/* Pricing & Add to Cart (or Restock when out of stock) */}
          {product.inStock ? (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-3xl font-bold text-white">${product.price.toFixed(2)}</div>
                  <div className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>In Stock — Dispatched within 24 Hours</span>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center space-x-2 bg-slate-950 border border-white/10 rounded-xl p-1 font-mono text-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 flex items-center justify-center text-slate-300 hover:bg-slate-800 rounded"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-slate-300 hover:bg-slate-800 rounded"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => addToCart(product, quantity)}
                  className="py-3.5 rounded-xl bg-cyan-500 text-slate-950 font-display font-bold text-xs hover:bg-cyan-400 transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                {batchRecord && (
                  <button
                    onClick={() => setShowCOAModal(true)}
                    className="py-3.5 rounded-xl bg-slate-800 border border-white/15 text-white font-display font-bold text-xs hover:bg-slate-700 hover:border-cyan-500/40 transition-all flex items-center justify-center space-x-2"
                  >
                    <FileCheck className="w-4 h-4 text-cyan-400" />
                    <span>View Lot COA Report</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <RestockNotify product={product} />
          )}

          {/* Technical Specs Checklist */}
          <div className="space-y-2 border-t border-white/10 pt-4">
            <h4 className="mono-tag text-xs font-semibold text-slate-300 uppercase">Technical Specifications</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                <span className="text-slate-400 block text-[10px]">APPEARANCE</span>
                <span className="text-white">{product.appearance}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                <span className="text-slate-400 block text-[10px]">SOLUBILITY</span>
                <span className="text-white">{product.solubility}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 sm:col-span-2">
                <span className="text-slate-400 block text-[10px]">STORAGE CONDITIONS</span>
                <span className="text-white">{product.storageConditions}</span>
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

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 border-t border-white/10 pt-12">
          <h3 className="font-display text-2xl font-bold text-white">Related Reference Materials</h3>
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
