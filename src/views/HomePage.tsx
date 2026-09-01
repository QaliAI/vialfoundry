import React, { useMemo, useState } from 'react';
import { Hero } from '../components/Hero';
import { TrustBand } from '../components/TrustBand';
import { ProductCard } from '../components/ProductCard';
import { FoundryStandard } from '../components/FoundryStandard';
import { BatchVerificationEngine } from '../components/BatchVerificationEngine';
import { PRODUCTS } from '../data/products';
import { getBatchRecord } from '../data/batches';
import { Product, ProductCategory } from '../types';
import { COAModal } from '../components/COAModal';
import { ArrowRight, ChevronRight, Layers } from 'lucide-react';
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

  // Category tiles. Counts are derived from the catalog so they cannot drift, and
  // each tile carries its category through to the catalog's own filter.
  const CATEGORY_BLURBS: Record<ProductCategory, string> = {
    'Reference Materials': 'Synthesized peptide standards for assay validation.',
    'Analytical Standards': 'Acylated peptide reference materials.',
    'Single Compounds': 'Individual peptides and metabolic standards.',
    'Specialty Materials': 'Less commonly stocked research compounds.',
    'Lab Supplies': 'Diluents and chromatography solvents.',
  };

  const categories = useMemo(
    () =>
      (Object.keys(CATEGORY_BLURBS) as ProductCategory[])
        .map((title) => {
          const count = PRODUCTS.filter((p) => p.category === title).length;
          return {
            title,
            desc: CATEGORY_BLURBS[title],
            count: `${count} ${count === 1 ? 'item' : 'items'}`,
            path: `/catalog?category=${encodeURIComponent(title)}`,
          };
        })
        .filter((c) => !c.count.startsWith('0 ')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="space-y-0 bg-brand-canvas">
      {/* 1. Hero Section (2-Column Physical Showcase) */}
      <Hero navigate={navigate} />

      {/* 2. Trust Bar (4 Points) */}
      <TrustBand />

      {/* 3. Best Sellers / Featured Products Section */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-sans font-semibold text-brand-steel uppercase tracking-wider">
              Catalog Highlights
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-ink tracking-tight">
              Featured Reference Standards
            </h2>
            <p className="text-brand-steel text-sm">
              Standardized research materials available for institutional procurement.
            </p>
          </div>

          <button
            onClick={() => navigate('/catalog')}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-paper border border-brand-border text-brand-ink hover:bg-brand-surface-muted hover:border-brand-border-strong transition-all font-display text-xs font-semibold shadow-2xs"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4 text-brand-accent" />
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
      <section className="py-12 bg-brand-paper border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="text-xs font-sans font-semibold text-brand-steel uppercase tracking-wider">
              Product Divisions
            </div>
            <h3 className="font-display text-2xl font-bold text-brand-ink">
              Browse by Material Category
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => navigate(cat.path)}
                className="storefront-card p-6 rounded-2xl border border-brand-border bg-brand-paper hover:bg-brand-surface-muted/50 hover:border-brand-border-strong hover:shadow-card-hover transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-sans font-semibold text-brand-graphite">{cat.count}</span>
                    <Layers className="w-4 h-4 text-brand-steel group-hover:text-brand-ink transition-colors" />
                  </div>
                  <h4 className="font-display text-base font-bold text-brand-ink group-hover:text-brand-graphite transition-colors">
                    {cat.title}
                  </h4>
                  <p className="text-xs text-brand-steel leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-brand-border/60 flex items-center text-xs font-display font-semibold text-brand-ink group-hover:text-brand-graphite">
                  <span>Explore category</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform text-brand-accent" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Quality / The Foundry Standard Section */}
      <FoundryStandard navigate={navigate} />

      {/* 5. Lot documentation lookup */}
      <BatchVerificationEngine navigate={navigate} />

      {/* 6. Research Resources & Documentation Articles */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-brand-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-sans font-semibold text-brand-steel uppercase tracking-wider">
              Technical Resources
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-ink tracking-tight">
              Analytical Documentation & Protocols
            </h2>
            <p className="text-brand-steel text-sm">
              Guides on interpreting chromatograms, mass spectrometry data, and reference standard handling.
            </p>
          </div>

          <button
            onClick={() => navigate('/resources')}
            className="flex items-center space-x-1.5 text-xs font-display font-semibold text-brand-ink hover:text-brand-graphite"
          >
            <span>Explore All Resources</span>
            <ChevronRight className="w-4 h-4 text-brand-accent" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {RESEARCH_ARTICLES.filter((a) => a.slug !== 'reconstitution-of-lyophilized-peptides').slice(0, 3).map((article) => (
            <div
              key={article.slug}
              onClick={() => onSelectArticle(article.slug)}
              className="storefront-card p-6 sm:p-7 rounded-2xl border border-brand-border bg-brand-paper space-y-4 flex flex-col justify-between cursor-pointer group hover:border-brand-border-strong hover:shadow-card-hover transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between font-sans text-[11px] text-brand-steel">
                  <span className="text-brand-graphite font-semibold">{article.category}</span>
                  <span>{article.readTime}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-brand-ink group-hover:text-brand-graphite transition-colors leading-snug">
                  {article.title}
                </h3>
                <p className="text-xs text-brand-steel font-normal line-clamp-3 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between text-xs font-display font-bold text-brand-ink group-hover:text-brand-graphite">
                <span>Read Technical Guide</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-brand-accent" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COA Modal if opened */}
      {activeCOALot && getBatchRecord(activeCOALot) && (
        <COAModal
          batch={getBatchRecord(activeCOALot)}
          onClose={() => setActiveCOALot(null)}
        />
      )}
    </div>
  );
};
