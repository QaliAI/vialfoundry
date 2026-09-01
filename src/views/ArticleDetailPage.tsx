import React from 'react';
import { RESEARCH_ARTICLES } from '../data/articles';
import { ArrowLeft, Clock, User, Tag } from 'lucide-react';

interface ArticleDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({ slug, navigate }) => {
  const article = RESEARCH_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="pt-32 text-center text-brand-steel font-sans">
        Article not found.{' '}
        <button onClick={() => navigate('/resources')} className="text-brand-ink underline">
          Return to Resources
        </button>
      </div>
    );
  }

  const renderInline = (text: string) =>
    text.split(/(\*\*[^*]+\*\*)/g).map((chunk, idx) =>
      chunk.startsWith('**') && chunk.endsWith('**') ? (
        <strong key={idx} className="text-brand-ink font-bold">
          {chunk.slice(2, -2)}
        </strong>
      ) : (
        <React.Fragment key={idx}>{chunk}</React.Fragment>
      )
    );

  return (
    <div className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-brand-canvas">
      
      <button
        onClick={() => navigate('/resources')}
        className="inline-flex items-center space-x-2 text-xs font-sans font-medium text-brand-steel hover:text-brand-ink transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Resources</span>
      </button>

      <div className="space-y-4 border-b border-brand-border pb-6">
        <div className="flex items-center space-x-3 text-xs font-sans text-brand-steel">
          <span className="text-brand-graphite font-semibold uppercase">{article.category}</span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{article.readTime}</span>
          </span>
          <span>•</span>
          <span>{article.date}</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink leading-tight tracking-tight">
          {article.title}
        </h1>

        <div className="flex items-center space-x-2 text-xs font-sans text-brand-steel">
          <User className="w-3.5 h-3.5" />
          <span>Written by {article.author}</span>
        </div>
      </div>

      <div className="storefront-card p-8 sm:p-12 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-6 text-sm sm:text-base text-brand-steel font-normal leading-relaxed">
        {article.content.map((paragraph, i) => {
          if (paragraph.startsWith('### ')) {
            return (
              <h3 key={i} className="font-display text-xl font-bold text-brand-ink pt-4">
                {paragraph.replace('### ', '')}
              </h3>
            );
          }
          return <p key={i}>{renderInline(paragraph)}</p>;
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-4">
        <Tag className="w-4 h-4 text-brand-steel" />
        {article.tags.map((t) => (
          <span key={t} className="px-2.5 py-1 rounded-md bg-brand-paper border border-brand-border text-xs font-sans text-brand-graphite shadow-2xs">
            {t}
          </span>
        ))}
      </div>

    </div>
  );
};
