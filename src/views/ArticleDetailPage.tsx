import React from 'react';
import { RESEARCH_ARTICLES } from '../data/articles';
import { ArrowLeft, Clock, User, Tag, ShieldCheck } from 'lucide-react';

interface ArticleDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({ slug, navigate }) => {
  const article = RESEARCH_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="pt-32 text-center text-slate-400 font-mono">
        Article not found.{' '}
        <button onClick={() => navigate('/resources')} className="text-cyan-400 underline">
          Return to Resources
        </button>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      <button
        onClick={() => navigate('/resources')}
        className="inline-flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Resources</span>
      </button>

      <div className="space-y-4 border-b border-white/10 pb-6">
        <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
          <span className="text-cyan-400 font-bold">{article.category}</span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{article.readTime}</span>
          </span>
          <span>•</span>
          <span>{article.date}</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight">
          {article.title}
        </h1>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <User className="w-3.5 h-3.5" />
          <span>Written by {article.author}</span>
        </div>
      </div>

      <div className="glass-panel p-8 sm:p-10 rounded-2xl border border-white/10 space-y-6 text-sm text-slate-300 font-light leading-relaxed">
        {article.content.map((paragraph, i) => {
          if (paragraph.startsWith('### ')) {
            return (
              <h3 key={i} className="font-display text-xl font-bold text-white pt-4">
                {paragraph.replace('### ', '')}
              </h3>
            );
          }
          return <p key={i}>{paragraph}</p>;
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-4">
        <Tag className="w-4 h-4 text-slate-500" />
        {article.tags.map((t) => (
          <span key={t} className="px-2.5 py-1 rounded bg-slate-900 border border-white/10 text-xs font-mono text-slate-400">
            {t}
          </span>
        ))}
      </div>

    </div>
  );
};
