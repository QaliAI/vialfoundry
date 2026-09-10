import React from 'react';
import { Tag, FileText, Package, Info, ArrowRight } from 'lucide-react';

interface FoundryStandardProps {
  navigate?: (path: string) => void;
}

/**
 * "How we handle quality" — deliberately short and literal.
 *
 * This replaced an interactive multi-stage panel that described upstream
 * manufacturing controls (solid-phase synthesis, precursor qualification,
 * sequence verification, cold-chain handling). None of those processes are
 * ones we perform or can evidence, so they are gone rather than reworded.
 * Everything below is something a customer can verify on the site itself.
 */
export const FoundryStandard: React.FC<FoundryStandardProps> = ({ navigate }) => {
  const points = [
    {
      icon: Info,
      title: 'Clear product information',
      desc: 'Name, amount, price and stock on every listing.',
    },
    {
      icon: Tag,
      title: 'Lot tracking',
      desc: 'Every vial carries a batch number.',
    },
    {
      icon: FileText,
      title: 'Documents when available',
      desc: 'If we hold a certificate for a batch, you can read it. If we do not, we say so.',
    },
    {
      icon: Package,
      title: 'Careful storage and shipping',
      desc: 'Products are kept sealed and packed protectively for transit.',
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-brand-canvas border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* Real product photography — not a simulated lab interface. */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden bg-brand-paper border border-brand-border">
              <img
                src="/assets/vials/products/bpc-157.webp"
                alt="A Vial Foundry research peptide vial, showing the batch label"
                className="w-full h-auto object-contain"
                width={1000}
                height={1000}
                loading="lazy"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-7">
            <div className="space-y-3">
              <div className="text-xs font-sans font-semibold text-brand-steel uppercase tracking-wider">
                How We Handle Quality
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-ink tracking-tight">
                Know what you&rsquo;re ordering.
              </h2>
              <p className="text-brand-steel text-base leading-relaxed max-w-xl">
                We keep product and batch information organised so you can see what is
                available before you order.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {points.map((point) => {
                const Icon = point.icon;
                return (
                  <div key={point.title} className="flex items-start space-x-3.5">
                    <div className="p-2 rounded-lg bg-brand-paper border border-brand-border flex-shrink-0">
                      <Icon className="w-4 h-4 text-brand-accent" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-display font-semibold text-brand-ink leading-snug">
                        {point.title}
                      </h3>
                      <p className="text-[13px] text-brand-steel leading-relaxed">
                        {point.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {navigate && (
              <button
                onClick={() => navigate('/quality')}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-display font-semibold text-sm shadow-xs transition-all"
              >
                <span>Learn About Quality</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
