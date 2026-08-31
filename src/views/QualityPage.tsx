import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { FoundryStandard } from '../components/FoundryStandard';

export const QualityPage: React.FC = () => {
  const qualityPillars = [
    { title: '1. Sourcing & Qualification', desc: 'Raw peptide precursor materials and reagents undergo strict chromatographic qualification prior to solid-phase assembly.' },
    { title: '2. Precursor Inspection', desc: 'Protected amino acids are verified for optical rotation, identity, and absence of racemized impurities.' },
    { title: '3. Batch-Specific Records', desc: 'Every synthesis run receives a unique lot number tied to physical chromatographic records.' },
    { title: '4. Dual Analytical Testing', desc: 'Finished lots undergo RP-HPLC purity integration and ESI-MS mass confirmation at accredited testing labs.' },
    { title: '5. Lot Traceability Index', desc: 'All certificates of analysis are indexed and stored permanently in our open public lot search portal.' },
    { title: '6. Nitrogen Flush Packaging', desc: 'Vials are stoppered with inert fluoropolymer septa under nitrogen flush to prevent oxidative degradation.' },
    { title: '7. Desiccated Cold Storage', desc: 'Inventory is maintained at -20°C in climate-controlled storage vaults prior to insulated dispatch.' },
    { title: '8. Continuous Retain Audit', desc: 'Retain samples from every lot are archived for 24 months to support continuous stability verification.' },
  ];

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 bg-[#FAFAF9]">
      
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-mono font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>QUALITY ASSURANCE FRAMEWORK</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          The 8 Pillars of Material Integrity
        </h1>
        <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed">
          Our quality assurance framework establishes complete analytical transparency at every phase of production and dispatch.
        </p>
      </div>

      {/* Grid of Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {qualityPillars.map((p, i) => (
          <div key={i} className="storefront-card p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-display text-base font-bold text-slate-900">{p.title}</h3>
            <p className="text-xs text-slate-600 font-normal leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>

      <FoundryStandard />

    </div>
  );
};

