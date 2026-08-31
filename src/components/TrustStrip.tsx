import React from 'react';
import { Star, Quote } from 'lucide-react';
import { STATIC_REVIEWS } from '../data/reviews';

/** Homepage social-proof strip. Uses the curated static reviews for fast, SSR-friendly render. */
export const TrustStrip: React.FC = () => {
  const featured = STATIC_REVIEWS.filter((r) => r.rating === 5).slice(0, 3);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-brand-canvas">
      <div className="text-center space-y-2 mb-10">
        <div className="text-xs font-sans font-semibold uppercase tracking-widest text-brand-steel">Verified Reviews</div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-ink">
          Feedback on our batch documentation and handling
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featured.map((r, i) => (
          <div
            key={i}
            className="relative p-6 rounded-2xl bg-brand-paper border border-brand-border space-y-4 shadow-2xs"
          >
            <Quote className="w-6 h-6 text-brand-accent/40" />
            <div className="flex items-center space-x-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={n <= r.rating ? 'w-3.5 h-3.5 text-brand-metal fill-brand-metal' : 'w-3.5 h-3.5 text-brand-border-strong'}
                />
              ))}
            </div>
            <p className="text-sm text-brand-steel font-normal leading-relaxed">&ldquo;{r.body}&rdquo;</p>
            <div className="text-[11px] font-sans text-brand-steel">
              {r.reviewerName}
              {r.reviewerOrg ? ` · ${r.reviewerOrg}` : ''}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
