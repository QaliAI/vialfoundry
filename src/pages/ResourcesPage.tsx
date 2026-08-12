import React from 'react';
import { RESEARCH_ARTICLES } from '../data/articles';
import { BookOpen, ChevronRight, FileText } from 'lucide-react';

interface ResourcesPageProps {
  onSelectArticle: (slug: string) => void;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ onSelectArticle }) => {
  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <div className="mono-tag text-xs text-cyan-400 font-semibold uppercase tracking-wider">
          RESEARCH RESOURCES & DOCUMENTATION
        </div>
        <h1 className="font-display text-4xl font-extrabold text-white">
          Analytical Knowledge Hub
        </h1>
        <p className="text-slate-400 text-sm font-light">
          Technical articles focusing on chromatographic integration, mass spectrometry, COA interpretation, and lot traceability standards.
        </p>
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
              <span>Read Full Guide</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
