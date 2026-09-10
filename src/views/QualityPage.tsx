import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { FoundryStandard } from '../components/FoundryStandard';

export const QualityPage: React.FC = () => {
  // Only what we can actually show. The previous list described upstream
  // manufacturing controls (precursor qualification, racemisation checks,
  // synthesis runs, climate-controlled vaults, retain archives) that we do not
  // perform and cannot evidence. Those are removed rather than reworded.
  const qualityPillars = [
    {
      title: 'Batch numbers',
      desc: 'Every vial carries a batch number, printed on the label and recorded against your order.',
    },
    {
      title: 'Documents when we have them',
      desc: 'If we hold a document for a batch, you can read it exactly as the issuing lab wrote it — method, date and results included.',
    },
    {
      title: 'We say when we don’t',
      desc: 'If we have no document for a batch, the site says so plainly. We never describe testing that has not been done.',
    },
    {
      title: 'Sealed vials',
      desc: 'Products are supplied in sealed, stoppered glass vials.',
    },
    {
      title: 'Careful packing',
      desc: 'Orders are packed protectively for transit.',
    },
    {
      title: 'Ask us anything',
      desc: 'Not sure what comes with a batch? Contact us before you order and we will tell you.',
    },
  ];


  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 bg-brand-canvas">
      
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-brand-paper border border-brand-border text-brand-ink text-xs font-sans font-medium shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-brand-accent" />
          <span className="tracking-wider uppercase text-[11px] text-brand-graphite font-semibold">
            How We Handle Quality
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink tracking-tight">
          Know what you&rsquo;re ordering
        </h1>
        <p className="text-brand-steel text-sm sm:text-base font-normal leading-relaxed">
          We keep this simple and checkable: every batch has a number, and the site tells you
          which documents we hold for it &mdash; including when the answer is none yet.
        </p>
      </div>

      {/* Grid of Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {qualityPillars.map((p, i) => (
          <div key={i} className="storefront-card p-6 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-3">
            <h3 className="font-display text-base font-bold text-brand-ink">{p.title}</h3>
            <p className="text-xs text-brand-steel font-normal leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>

      <FoundryStandard />

    </div>
  );
};
