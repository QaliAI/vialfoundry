import React from 'react';
import { ArrowRight, FileCheck, ShieldCheck } from 'lucide-react';

interface HeroProps {
  navigate: (path: string) => void;
  onQuickVerify?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ navigate }) => {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-brand-canvas border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Credibility Eyebrow */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-paper border border-brand-border text-brand-ink text-xs font-sans font-medium shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-brand-accent" />
              <span className="tracking-wider uppercase text-[11px] text-brand-graphite font-semibold">
                For Research Use Only
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[52px] font-bold text-brand-ink tracking-tight leading-[1.1]">
              Research fuels <span className="text-brand-graphite">what&rsquo;s next.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-brand-steel max-w-xl font-normal leading-relaxed">
              Premium research peptides built around quality, traceability and transparent documentation.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <button
                onClick={() => navigate('/catalog')}
                className="flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-display font-semibold text-sm shadow-xs transition-all"
              >
                <span>Shop Research Peptides</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/quality')}
                className="flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-brand-paper border border-brand-border text-brand-ink font-display font-semibold text-sm hover:bg-brand-surface-muted hover:border-brand-border-strong transition-all shadow-2xs"
              >
                <FileCheck className="w-4 h-4 text-brand-accent" />
                <span>Quality &amp; Standards</span>
              </button>
            </div>

            {/* Factual micro-points. Each one is verifiable from the site itself. */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-brand-border/80 max-w-lg">
              <div>
                <div className="text-[11px] font-sans font-medium text-brand-steel uppercase tracking-wider">Traceability</div>
                <div className="font-sans text-sm font-semibold text-brand-ink mt-0.5">Lot-numbered vials</div>
              </div>
              <div>
                <div className="text-[11px] font-sans font-medium text-brand-steel uppercase tracking-wider">Documentation</div>
                <div className="font-sans text-sm font-semibold text-brand-ink mt-0.5">Status shown per lot</div>
              </div>
              <div>
                <div className="text-[11px] font-sans font-medium text-brand-steel uppercase tracking-wider">Dispatch</div>
                <div className="font-sans text-sm font-semibold text-brand-ink mt-0.5">Insulated cold packing</div>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Physical Product Showcase */}
          {/* The physical product is the visual interest here - no UI decoration. */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <img
              src="/assets/vials/hero-composition.webp"
              alt="Vial Foundry research peptide vials: BPC-157, Tirzepatide and Semaglutide"
              className="w-full max-w-xl h-auto object-contain"
              width={1600}
              height={980}
              loading="eager"
            />
          </div>

        </div>
      </div>
    </section>
  );
};
