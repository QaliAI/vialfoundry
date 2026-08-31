import React from 'react';

export const AboutPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 bg-[#FAFAF9]">
      
      <div className="space-y-4 text-center">
        <div className="text-xs font-mono font-bold text-cyan-800 uppercase tracking-wider">
          ABOUT VIAL FOUNDRY
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Precision built around analytical verification.
        </h1>
        <p className="text-slate-600 text-sm sm:text-base font-normal max-w-2xl mx-auto leading-relaxed">
          Vial Foundry was established to solve a fundamental challenge in laboratory peptide sourcing: bridging the gap between physical material and verifiable analytical documentation.
        </p>
      </div>

      <div className="storefront-card p-8 sm:p-12 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-6 text-sm text-slate-700 font-normal leading-relaxed">
        <h3 className="font-display text-xl font-bold text-slate-900">Our Mission</h3>
        <p>
          Research materials must be presented with the same precision and rigor required in the laboratory. We reject ambiguous marketing claims, generic COA templates, and unverified batch declarations. Every vial distributed by Vial Foundry is tied directly to physical analytical records drawn from that specific production lot.
        </p>

        <h3 className="font-display text-xl font-bold text-slate-900 pt-4">Operational Discipline</h3>
        <p>
          We treat chemical supply as an engineering discipline. From solid-phase synthesis validation to cold-chain nitrogen-flushed packaging, our operations prioritize stability, batch homogeneity, and permanent open documentation access for qualified researchers.
        </p>
      </div>

    </div>
  );
};

