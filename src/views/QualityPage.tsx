import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { FoundryStandard } from '../components/FoundryStandard';

export const QualityPage: React.FC = () => {
  const qualityPillars = [
    { title: '1. Sourcing & Qualification', desc: 'Precursor materials and reagents undergo chromatographic qualification prior to peptide assembly.' },
    { title: '2. Precursor Evaluation', desc: 'Protected amino acids are verified for optical rotation, identity, and absence of racemized impurities.' },
    { title: '3. Batch-Specific Records', desc: 'Every synthesis run receives a unique lot number tied to physical chromatographic records.' },
    { title: '4. Analytical Testing', desc: 'Finished lots undergo RP-HPLC purity integration and ESI-MS mass confirmation at independent testing labs.' },
    { title: '5. Lot Documentation Index', desc: 'Certificates of analysis are indexed and stored permanently in our public lot search portal.' },
    { title: '6. Sealed Packaging', desc: 'Vials are stoppered with inert fluoropolymer septa to minimize atmospheric and moisture interaction.' },
    { title: '7. Desiccated Cold Storage', desc: 'Inventory is maintained in climate-controlled storage vaults prior to insulated dispatch.' },
    { title: '8. Batch Retain Archives', desc: 'Retain samples from production lots are archived to support lot traceability and reference checks.' },
  ];

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 bg-brand-canvas">
      
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-brand-paper border border-brand-border text-brand-ink text-xs font-sans font-medium shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-brand-accent" />
          <span className="tracking-wider uppercase text-[11px] text-brand-graphite font-semibold">
            Quality & Testing Protocol
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink tracking-tight">
          The 8 Pillars of Material Integrity
        </h1>
        <p className="text-brand-steel text-sm sm:text-base font-normal leading-relaxed">
          Our quality framework emphasizes analytical rigor, lot traceability, and transparent documentation for research applications.
        </p>
      </div>

      {/* Grid of Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
