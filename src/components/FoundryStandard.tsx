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
      title: 'Synthesis & Raw Materials',
      subtitle: 'Qualified Precursor Verification',
      icon: Target,
      desc: 'Every compound begins with qualified solid-phase peptide synthesis (SPPS) or enzymatic crystallization. We enforce strict precursor optical purity checks before manufacturing begins.',
      metrics: ['Vendor Audit Standardized', 'Precursor HPLC Inspection', 'Raw Ingredient Purity > 99%']
    },
    {
      id: 'verify',
      step: '02',
      title: 'Dual Analytical Testing',
      subtitle: 'RP-HPLC & Mass Spectrometry',
      icon: Search,
      desc: 'Finished lots undergo independent reverse-phase liquid chromatography (RP-HPLC) for chromatographic purity and electrospray ionization mass spectrometry (ESI-MS) for exact mass confirmation.',
      metrics: ['214nm Peak Integration', 'ESI-MS Molecular Mass Match', 'Endotoxin & Solvent Screening']
    },
    {
      id: 'document',
      step: '03',
      title: 'Lot Documentation',
      subtitle: 'Public Certificates of Analysis',
      icon: FileCheck,
      desc: 'Batch records are published directly to our open lot search portal. Researchers can search any lot code to inspect chromatograms, peak integration tables, and download official PDF records.',
      metrics: ['Public Lot Search Portal', 'Digital PDF COA Export', 'Archival Chromatogram Logs']
    },
    {
      id: 'deliver',
      step: '04',
      title: 'Cold Storage & Logistics',
      subtitle: 'Desiccated -20°C Vault Storage',
      icon: Truck,
      desc: 'Materials are sealed with fluoropolymer septa under nitrogen flush, stored at -20°C in climate-controlled vaults, and dispatched in insulated packaging for thermal stability.',
      metrics: ['-20°C Nitrogen Storage', 'Insulated Express Fulfillment', 'Real-Time Inventory Levels']
    }
  ];

  return (
    <section className="py-20 sm:py-24 bg-[#FAFAF9] border-t border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 mb-14">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-700" />
            <span>THE FOUNDRY STANDARD</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Quality assurance and testing discipline.
          </h2>
          <p className="text-slate-600 text-base font-normal leading-relaxed">
            Our operational framework bridges chemical manufacturing standards with independent analytical testing and public lot documentation.
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
                      ? 'bg-white border-cyan-600/60 shadow-card ring-1 ring-cyan-600/20'
                      : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className={`font-mono text-sm font-bold ${isActive ? 'text-cyan-700' : 'text-slate-400'}`}>
                      {pillar.step}
                    </span>
                    <div>
                      <h3 className={`font-display text-base font-bold ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-slate-500">{pillar.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-cyan-700 translate-x-1' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Pillar Detail Card */}
          <div className="lg:col-span-7">
            <div className="storefront-card h-full rounded-2xl p-8 sm:p-10 border border-slate-200/90 bg-white flex flex-col justify-between space-y-8 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-800 tracking-wider uppercase">
                    STAGE {pillars[activeStep].step} — {pillars[activeStep].title.toUpperCase()}
                  </span>
                  <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700">
                    {React.createElement(pillars[activeStep].icon, { className: 'w-5 h-5' })}
                  </div>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  {pillars[activeStep].subtitle}
                </h3>

                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                  {pillars[activeStep].desc}
                </p>
              </div>

              {/* Guarantees Checklist */}
              <div className="pt-6 border-t border-slate-100 space-y-3">
                <div className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">Verification Standards</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {pillars[activeStep].metrics.map((metric, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center space-x-2 text-xs font-mono text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
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
                    className="inline-flex items-center space-x-2 text-xs font-bold text-cyan-800 hover:text-cyan-900 font-display"
                  >
                    <span>Inspect Lot Database</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    onClick={() => navigate('/quality')}
                    className="inline-flex items-center space-x-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    <span>Read Full Quality Protocol</span>
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

