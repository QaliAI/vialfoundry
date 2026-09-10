import React from 'react';

export const AboutPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 bg-brand-canvas">
      
      <div className="space-y-4 text-center">
        <div className="text-xs font-sans font-semibold text-brand-steel uppercase tracking-wider">
          About Vial Foundry
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink tracking-tight">
          Research peptides, clearly labelled.
        </h1>
        <p className="text-brand-steel text-sm sm:text-base font-normal max-w-2xl mx-auto leading-relaxed">
          We supply research peptides with clear product details, batch numbers and documents when we have them.
        </p>
      </div>

      <div className="storefront-card p-8 sm:p-12 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-6 text-sm text-brand-steel font-normal leading-relaxed">
        <h3 className="font-display text-xl font-bold text-brand-ink">Our Focus</h3>
        <p>
          Research peptides are only as useful as the information behind them. Every vial carries a
          batch number, and the site tells you which documents we hold for it. When we have a
          document, we publish the issuing lab&rsquo;s own file. When we don&rsquo;t, we say so rather than
          filling the gap.
        </p>

        <h3 className="font-display text-xl font-bold text-brand-ink pt-4">How We Ship</h3>
        <p>
          Products are supplied in sealed, stoppered glass vials and packed protectively for transit.
          Every order is tied to the batch numbers that shipped with it.
        </p>
      </div>

    </div>
  );
};
