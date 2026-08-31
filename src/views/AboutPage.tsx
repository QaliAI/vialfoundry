import React from 'react';

export const AboutPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 bg-brand-canvas">
      
      <div className="space-y-4 text-center">
        <div className="text-xs font-sans font-semibold text-brand-steel uppercase tracking-wider">
          About Vial Foundry
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink tracking-tight">
          Precision built around analytical verification.
        </h1>
        <p className="text-brand-steel text-sm sm:text-base font-normal max-w-2xl mx-auto leading-relaxed">
          Vial Foundry was established to provide reliable, lot-documented reference materials and standards for institutional and laboratory research.
        </p>
      </div>

      <div className="storefront-card p-8 sm:p-12 rounded-2xl bg-brand-paper border border-brand-border shadow-2xs space-y-6 text-sm text-brand-steel font-normal leading-relaxed">
        <h3 className="font-display text-xl font-bold text-brand-ink">Our Focus</h3>
        <p>
          Research materials require clear, dependable analytical documentation. We focus on batch-specific traceability, providing access to HPLC profiles and mass spectrometry reports for each production lot.
        </p>

        <h3 className="font-display text-xl font-bold text-brand-ink pt-4">Operational Framework</h3>
        <p>
          We operate with disciplined handling and packaging standards. From synthesis precursor qualification to desiccated storage and insulated dispatch, materials are managed to protect structural integrity throughout the supply chain.
        </p>
      </div>

    </div>
  );
};
