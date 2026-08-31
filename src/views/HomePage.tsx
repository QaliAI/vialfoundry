import React, { useState } from 'react';
import { Hero } from '../components/Hero';
import { TrustBand } from '../components/TrustBand';
import { ProductCard } from '../components/ProductCard';
import { FoundryStandard } from '../components/FoundryStandard';
import { BatchVerificationEngine } from '../components/BatchVerificationEngine';
import { PRODUCTS } from '../data/products';
import { BATCH_RECORDS } from '../data/batches';
import { Product } from '../types';
import { COAModal } from '../components/COAModal';
import { ArrowRight, ChevronRight, BookOpen, Layers } from 'lucide-react';
import { RESEARCH_ARTICLES } from '../data/articles';

interface HomePageProps {
  navigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
  onSelectArticle: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate, onSelectProduct, onSelectArticle }) => {
  const [activeCOALot, setActiveCOALot] = useState<string | null>(null);

  // Featured 4 Best Sellers / Popular Reference Standards
  const bestSellers = PRODUCTS.slice(0, 4);

  // Product categories for discovery
  const categories = [
    { title: 'Reference Standards', desc: 'Synthesized peptide standards for analytical assay validation and chromatography.', count: '8 Standards', path: '/catalog' },
    { title: 'Analytical Standards', desc: 'High-purity receptor agonists with calibrated retention times and mass verification.', count: '4 Standards', path: '/catalog' },
    { title: 'Single Compounds', desc: 'Characterized individual peptide compounds and metabolic cofactors.', count: '6 Compounds', path: '/catalog' },
    { title: 'Laboratory Supplies', desc: 'USP-grade reconstitution water and chromatography mobile phase solvents.', count: '2 Supplies', path: '/catalog' }
  ];

  return (
    <div className="space-y-0 bg-[#FAFAF9]">
      {/* 1. Hero Section (2-Column Physical Showcase) */}
      <Hero navigate={navigate} />

      {/* 2. Trust Bar (4 Points) */}
      <TrustBand />

      {/* 3. Best Sellers / Featured Products Section */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-mono font-bold text-cyan-800 uppercase tracking-wider">
              CORE CATALOG
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Reference Standards
            </h2>
            <p className="text-slate-600 text-sm">
              Standardized research materials in stock and ready for immediate insulated dispatch.
            </p>
          </div>

          <button
            onClick={() => navigate('/catalog')}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 hover:border-slate-400 transition-all font-display text-xs font-bold shadow-2xs"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4 text-cyan-700" />
          </button>
        </div>

        {/* Product Cards Grid (4 across) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewProduct={onSelectProduct}
              onViewCOA={(lot) => setActiveCOALot(lot)}
            />
          ))}
        </div>
      </section>

      {/* Category Discovery Grid */}
      <section className="py-12 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="text-xs font-mono font-bold text-cyan-800 uppercase tracking-wider">
              CATALOG DIVISIONS
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-900">
              Browse by Research Category
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => navigate(cat.path)}
                className="storefront-card p-6 rounded-2xl border border-slate-200/90 bg-[#FAFAF9] hover:bg-white hover:border-cyan-600/40 hover:shadow-card-hover transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold text-cyan-800">{cat.count}</span>
                    <Layers className="w-4 h-4 text-slate-400 group-hover:text-cyan-700 transition-colors" />
                  </div>
                  <h4 className="font-display text-base font-bold text-slate-900 group-hover:text-cyan-800 transition-colors">
                    {cat.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center text-xs font-display font-semibold text-cyan-800 group-hover:text-cyan-900">
                  <span>Explore category</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Quality / The Foundry Standard Section */}
      <FoundryStandard navigate={navigate} />

      {/* 5. Batch Verification Engine Section */}
      <BatchVerificationEngine />

      {/* 6. Research Resources & Documentation Articles */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-mono font-bold text-cyan-800 uppercase tracking-wider">
              RESEARCH INSIGHTS
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Analytical Documentation & Protocols
            </h2>
            <p className="text-slate-600 text-sm">
              Technical guides on interpreting chromatograms, SPPS synthesis purity, and analytical methods.
            </p>
          </div>

          <button
            onClick={() => navigate('/resources')}
            className="flex items-center space-x-1.5 text-xs font-display font-semibold text-cyan-800 hover:text-cyan-900"
          >
            <span>Explore All Resources</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {RESEARCH_ARTICLES.filter((a) => a.slug !== 'reconstitution-of-lyophilized-peptides').slice(0, 3).map((article) => (
            <div
              key={article.slug}
              onClick={() => onSelectArticle(article.slug)}
              className="storefront-card p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white space-y-4 flex flex-col justify-between cursor-pointer group hover:border-cyan-600/40 hover:shadow-card-hover transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
                  <span className="text-cyan-800 font-semibold">{article.category}</span>
                  <span>{article.readTime}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-cyan-800 transition-colors leading-snug">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-600 font-normal line-clamp-3 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-display font-bold text-cyan-800 group-hover:text-cyan-900">
                <span>Read Technical Guide</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COA Modal if opened */}
      {activeCOALot && BATCH_RECORDS[activeCOALot] && (
        <COAModal
          batch={BATCH_RECORDS[activeCOALot]}
          onClose={() => setActiveCOALot(null)}
        />
      )}
    </div>
  );
};

