'use client';

import React, { useEffect, useState } from 'react';
import { Star, BadgeCheck } from 'lucide-react';
import { Review } from '../data/reviews';
import { fetchReviews } from '../lib/reviews';

const Stars: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center space-x-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`w-3.5 h-3.5 ${n <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`}
      />
    ))}
  </div>
);

export const ReviewList: React.FC<{ productSlug: string }> = ({ productSlug }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetchReviews(productSlug).then((r) => {
      if (active) {
        setReviews(r);
        setLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, [productSlug]);

  if (loaded && reviews.length === 0) return null;

  const avg =
    reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';

  return (
    <div className="border-t border-slate-200 pt-10 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl font-bold text-slate-900">Verified Researcher Reviews</h3>
        {reviews.length > 0 && (
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-600">
            <Stars rating={Math.round(Number(avg))} />
            <span className="text-slate-900 font-bold">{avg}</span>
            <span>({reviews.length} reviews)</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((r, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <Stars rating={r.rating} />
              {r.verified && (
                <span className="inline-flex items-center space-x-1 text-[11px] font-mono font-medium text-emerald-700">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>Verified Purchase</span>
                </span>
              )}
            </div>
            {r.title && <h4 className="font-display text-sm font-bold text-slate-900">{r.title}</h4>}
            <p className="text-xs text-slate-600 leading-relaxed">{r.body}</p>
            <div className="text-[11px] font-mono text-slate-500">
              {r.reviewerName}
              {r.reviewerOrg ? ` · ${r.reviewerOrg}` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

