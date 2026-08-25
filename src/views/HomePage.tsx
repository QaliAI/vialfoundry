import React, { useState } from 'react';
import { Hero } from '../components/Hero';
import { TrustBand } from '../components/TrustBand';
import { ProductCard } from '../components/ProductCard';
import { FoundryStandard } from '../components/FoundryStandard';
import { BatchVerificationEngine } from '../components/BatchVerificationEngine';
import { ToolsHub } from '../components/ToolsHub';
import { TrustStrip } from '../components/TrustStrip';
import { PRODUCTS } from '../data/products';
import { BATCH_RECORDS } from '../data/batches';
import { Product } from '../types';
import { COAModal } from '../components/COAModal';
import { ArrowRight, Sparkles, FileText, ChevronRight } from 'lucide-react';
import { RESEARCH_ARTICLES } from '../data/articles';

interface HomePageProps {
  navigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
  onSelectArticle: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate, onSelectProduct, onSelectArticle }) => {
  const [activeCOALot, setActiveCOALot] = useState<string | null>(null);

  const featuredProducts = PRODUCTS.slice(0, 4);

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <Hero navigate={navigate} />

      {/* Trust Band */}
      <TrustBand />

      {/* Featured Catalog Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div className="space-y-2">
            <div className="mono-tag text-xs text-cyan-400 font-semibold uppercase tracking-wider">
              FEATURED CATALOG
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
              Precision reference materials.
            </h2>
          </div>

          <button
            onClick={() => navigate('/catalog')}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white hover:border-cyan-500/40 hover:text-cyan-300 transition-all font-display text-xs font-bold"
          >
            <span>View All Materials</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewProduct={onSelectProduct}
              onViewCOA={(lot) => setActiveCOALot(lot)}
            />
          ))}
        </div>
      </section>

      {/* The Foundry Standard Section */}
      <FoundryStandard />

      {/* Signature Feature: Batch Verification Engine */}
      <BatchVerificationEngine />

      {/* Visual Brand Story Section */}
      <section className="relative py-32 overflow-hidden bg-slate-950 border-t border-white/10">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/assets/videos/story-bg-poster.jpg"
            className="w-full h-full object-cover"
          >
            <source src="/assets/videos/story-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="mono-tag text-xs text-cyan-400 font-semibold uppercase tracking-widest">
            THE VIAL FOUNDRY CONCEPT
          </span>
          <blockquote className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-snug">
            &ldquo;Vial Foundry was built around a simple idea: research materials should be presented with the same precision used to evaluate them.&rdquo;
          </blockquote>
          <p className="text-slate-400 text-sm font-light max-w-2xl mx-auto">
            From HPLC peak area integration to temperature-controlled cold storage, we build standards for researchers who demand complete transparency.
          </p>
        </div>
      </section>

      {/* Analytical Tools Hub */}
      <ToolsHub />

      {/* Social proof */}
      <div className="border-t border-white/10">
        <TrustStrip />
      </div>

      {/* Research Resources Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div className="space-y-2">
            <div className="mono-tag text-xs text-cyan-400 font-semibold uppercase tracking-wider">
              RESEARCH RESOURCES
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
              Documentation & quality insights.
            </h2>
          </div>

          <button
            onClick={() => navigate('/resources')}
            className="flex items-center space-x-2 text-xs font-mono text-cyan-400 hover:text-cyan-300"
          >
            <span>Explore All Articles</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {RESEARCH_ARTICLES.map((article) => (
            <div
              key={article.slug}
              onClick={() => onSelectArticle(article.slug)}
              className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                  <span className="text-cyan-400">{article.category}</span>
                  <span>{article.readTime}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-400 font-light line-clamp-3 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-cyan-400 font-semibold group-hover:text-cyan-300">
                <span>Read Article</span>
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
