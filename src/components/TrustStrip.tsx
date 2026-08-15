import React from 'react';
import { Star, Quote } from 'lucide-react';
import { STATIC_REVIEWS } from '../data/reviews';

/** Homepage social-proof strip. Uses the curated static reviews for fast, SSR-friendly render. */
export const TrustStrip: React.FC = () => {
  const featured = STATIC_REVIEWS.filter((r) => r.rating === 5).slice(0, 3);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center space-y-2 mb-10">
        <div className="mono-tag text-xs uppercase tracking-widest text-cyan-400">Trusted by researchers</div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
          What analytical labs say about our documentation
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featured.map((r, i) => (
          <div
            key={i}
            className="relative p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-4"
          >
            <Quote className="w-6 h-6 text-cyan-500/40" />
            <div className="flex items-center space-x-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`w-3.5 h-3.5 ${n <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                />
              ))}
            </div>
            <p className="text-sm text-slate-300 font-light leading-relaxed">&ldquo;{r.body}&rdquo;</p>
            <div className="text-[11px] font-mono text-slate-500">
              {r.reviewerName}
              {r.reviewerOrg ? ` · ${r.reviewerOrg}` : ''}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
