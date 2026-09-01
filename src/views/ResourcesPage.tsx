import React from 'react';
import { RESEARCH_ARTICLES } from '../data/articles';
import { ChevronRight } from 'lucide-react';

interface ResourcesPageProps {
  onSelectArticle: (slug: string) => void;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ onSelectArticle }) => {
  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 bg-brand-canvas">
      
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <div className="text-xs font-sans font-semibold text-brand-steel uppercase tracking-wider">
          Resources & Documentation
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink tracking-tight">
          Analytical Knowledge Hub
        </h1>
        <p className="text-brand-steel text-sm sm:text-base font-normal leading-relaxed">
          Technical guides focusing on chromatographic integration, mass spectrometry, COA interpretation, and lot traceability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {RESEARCH_ARTICLES.map((article) => (
          <div
            key={article.slug}
            onClick={() => onSelectArticle(article.slug)}
            className="storefront-card p-6 sm:p-8 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-4 flex flex-col justify-between cursor-pointer group hover:border-brand-border-strong hover:shadow-card-hover transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between font-sans text-[11px] text-brand-steel">
                <span className="text-brand-graphite font-semibold uppercase">{article.category}</span>
                <span>{article.readTime}</span>
              </div>
              <h3 className="font-display text-lg font-bold text-brand-ink group-hover:text-brand-graphite transition-colors">
                {article.title}
              </h3>
              <p className="text-xs text-brand-steel font-normal line-clamp-3 leading-relaxed">
                {article.excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between text-xs font-display text-brand-ink font-bold group-hover:text-brand-graphite">
              <span>Read Full Guide</span>
              <ChevronRight className="w-4 h-4 text-brand-accent group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
