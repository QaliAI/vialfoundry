import React, { useState } from 'react';
import { Target, Search, FileCheck, Truck, ShieldCheck, CheckCircle2, ChevronRight, ArrowRight } from 'lucide-react';

interface FoundryStandardProps {
  navigate?: (path: string) => void;
}

export const FoundryStandard: React.FC<FoundryStandardProps> = ({ navigate }) => {
  const [activeStep, setActiveStep] = useState(0);

  const pillars = [
    {
      id: 'source',
      step: '01',
      title: 'Synthesis & Precursors',
      subtitle: 'Material Qualification',
      icon: Target,
      desc: 'Compounds begin with documented solid-phase synthesis or peptide crystallization. Raw precursors undergo qualification testing prior to final production.',
      metrics: ['Material Sourcing Records', 'Precursor Purity Review', 'Sequence Verification']
    },
    {
      id: 'verify',
      step: '02',
      title: 'Analytical Testing',
      subtitle: 'HPLC & Mass Spectrometry',
      icon: Search,
      desc: 'Production lots are evaluated using reverse-phase liquid chromatography (RP-HPLC) for chromatographic homogeneity and mass spectrometry for molecular mass confirmation.',
      metrics: ['Chromatographic Profiling', 'Electrospray Mass Match', 'Analytical Data Archival']
    },
    {
      id: 'document',
      step: '03',
      title: 'Lot Documentation',
      subtitle: 'Searchable Batch Records',
      icon: FileCheck,
      desc: 'Lot-specific documentation is archived in our verification portal. Researchers can look up lot numbers to review chromatograms, integration tables, and certificate records.',
      metrics: ['Batch Search Portal', 'Digital COA Access', 'Archival Data Logs']
    },
    {
      id: 'deliver',
      step: '04',
      title: 'Packaging & Storage',
      subtitle: 'Cold-Chain Handling',
      icon: Truck,
      desc: 'Reference materials are stored under desiccated conditions, sealed against atmospheric moisture, and packaged with thermal protection for transit.',
      metrics: ['Desiccated Storage', 'Insulated Dispatch', 'Batch-Coded Vials']
    }
  ];

  return (
    <section className="py-20 sm:py-24 bg-brand-canvas border-t border-brand-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 mb-14">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-paper border border-brand-border text-brand-ink text-xs font-sans font-medium shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
            <span className="tracking-wider uppercase text-[11px] text-brand-graphite font-semibold">
              Quality & Documentation
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink tracking-tight">
            Analytical standards and batch discipline.
          </h2>
          <p className="text-brand-steel text-base font-normal leading-relaxed">
            Our operational framework combines standardized synthesis protocols with independent analytical testing and public lot documentation.
          </p>
        </div>

        {/* Pillars Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Interactive Step Selector */}
          <div className="lg:col-span-5 space-y-3">
            {pillars.map((pillar, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-brand-paper border-brand-graphite shadow-card ring-1 ring-brand-graphite/10'
                      : 'bg-brand-paper/60 border-brand-border hover:bg-brand-paper hover:border-brand-border-strong'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className={`font-mono text-sm font-bold ${isActive ? 'text-brand-accent' : 'text-brand-steel'}`}>
                      {pillar.step}
                    </span>
                    <div>
                      <h3 className={`font-display text-base font-bold ${isActive ? 'text-brand-ink' : 'text-brand-graphite'}`}>
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-brand-steel font-sans">{pillar.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-brand-ink translate-x-1' : 'text-brand-steel'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Pillar Detail Card */}
          <div className="lg:col-span-7">
            <div className="storefront-card h-full rounded-2xl p-8 sm:p-10 border border-brand-border bg-brand-paper flex flex-col justify-between space-y-8 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans font-semibold text-brand-steel tracking-wider uppercase">
                    STAGE {pillars[activeStep].step} — {pillars[activeStep].title.toUpperCase()}
                  </span>
                  <div className="p-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink">
                    {React.createElement(pillars[activeStep].icon, { className: 'w-5 h-5 text-brand-accent' })}
                  </div>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-bold text-brand-ink">
                  {pillars[activeStep].subtitle}
                </h3>

                <p className="text-sm sm:text-base text-brand-steel font-normal leading-relaxed">
                  {pillars[activeStep].desc}
                </p>
              </div>

              {/* Standards Checklist */}
              <div className="pt-6 border-t border-brand-border/60 space-y-3">
                <div className="text-[11px] font-sans font-semibold text-brand-steel uppercase tracking-wider">Verification Framework</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {pillars[activeStep].metrics.map((metric, i) => (
                    <div key={i} className="p-3 rounded-xl bg-brand-canvas border border-brand-border/80 flex items-center space-x-2 text-xs font-sans text-brand-ink">
                      <CheckCircle2 className="w-4 h-4 text-brand-accent flex-shrink-0" />
                      <span className="leading-snug">{metric}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              {navigate && (
                <div className="pt-2 flex items-center space-x-4">
                  <button
                    onClick={() => navigate('/verify')}
                    className="inline-flex items-center space-x-2 text-xs font-bold text-brand-ink hover:text-brand-graphite font-display"
                  >
                    <span>Inspect Lot Database</span>
                    <ArrowRight className="w-4 h-4 text-brand-accent" />
                  </button>
                  <span className="text-brand-border-strong">·</span>
                  <button
                    onClick={() => navigate('/quality')}
                    className="inline-flex items-center space-x-2 text-xs font-medium text-brand-steel hover:text-brand-ink"
                  >
                    <span>Read Quality Documentation</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
