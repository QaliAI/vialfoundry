import React from 'react';
import { RESEARCH_ARTICLES } from '../data/articles';
import { ChevronRight } from 'lucide-react';

interface ResourcesPageProps {
  onSelectArticle: (slug: string) => void;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ onSelectArticle }) => {
  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 bg-[#FAFAF9]">
      
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <div className="text-xs font-mono font-bold text-cyan-800 uppercase tracking-wider">
          RESEARCH RESOURCES & DOCUMENTATION
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Analytical Knowledge Hub
        </h1>
        <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed">
          Technical articles focusing on chromatographic integration, mass spectrometry, COA interpretation, and lot traceability standards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {RESEARCH_ARTICLES.map((article) => (
          <div
            key={article.slug}
            onClick={() => onSelectArticle(article.slug)}
            className="storefront-card p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between cursor-pointer group hover:border-cyan-600/60 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
                <span className="text-cyan-800 font-bold uppercase">{article.category}</span>
                <span>{article.readTime}</span>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-cyan-800 transition-colors">
                {article.title}
              </h3>
              <p className="text-xs text-slate-600 font-normal line-clamp-3 leading-relaxed">
                {article.excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-cyan-800 font-bold group-hover:text-cyan-900">
              <span>Read Full Guide</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

