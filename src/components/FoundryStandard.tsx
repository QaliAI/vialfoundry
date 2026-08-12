import React, { useState } from 'react';
import { Target, Search, FileCheck, Truck, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';

export const FoundryStandard: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const pillars = [
    {
      id: 'source',
      step: '01',
      title: 'Source',
      subtitle: 'Qualified Chemical Synthesis',
      icon: Target,
      desc: 'Every compound begins with qualified solid-phase synthesis (SPPS) or enzymatic crystallization. We enforce strict raw material precursor purity standards before manufacturing begins.',
      metrics: ['Vendor Audit Standardized', 'Precursor HPLC Inspection', 'Raw Ingredient Purity > 99%']
    },
    {
      id: 'verify',
      step: '02',
      title: 'Verify',
      subtitle: 'Independent HPLC & LC-MS Testing',
      icon: Search,
      desc: 'Finished lots undergo independent reverse-phase liquid chromatography and mass spectrometry. We verify both total peak area purity and exact molecular mass.',
      metrics: ['214nm Peak Integration', 'ESI-MS Mass Confirmation', 'Heavy Metals & Endotoxin Test']
    },
    {
      id: 'document',
      step: '03',
      title: 'Document',
      subtitle: 'Open Lot Traceability Records',
      icon: FileCheck,
      desc: 'Batch records are published to our open lot search index. Researchers can look up any lot number to view or download full PDF certificates of analysis.',
      metrics: ['Public Lot Database', 'Digital PDF Export', 'Archival Chromatogram Logs']
    },
    {
      id: 'deliver',
      step: '04',
      title: 'Deliver',
      subtitle: 'Desiccated Cold Chain Fulfillment',
      icon: Truck,
      desc: 'Materials are stored in desiccated vacuum environments at -20°C and dispatched in temperature-stable insulated packaging for maximum stability.',
      metrics: ['-20°C Nitrogen Storage', 'Insulated Express Shipping', 'Real-Time Inventory Status']
    }
  ];

  return (
    <section className="py-24 bg-slate-950/80 border-t border-white/10 relative overflow-hidden">
      {/* Background Micro Video Loop */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/assets/videos/macro-glass-poster.jpg"
          className="w-full h-full object-cover filter grayscale"
        >
          <source src="/assets/videos/macro-glass.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-300 text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="mono-tag text-[11px] uppercase tracking-wider">THE FOUNDRY STANDARD</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
            Precision engineering at every stage.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base font-light">
            Our operational framework bridges chemical manufacturing discipline with transparent analytical verification.
          </p>
        </div>

        {/* Pillars Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Interactive Step Selector */}
          <div className="lg:col-span-5 space-y-3">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              const isActive = activeStep === idx;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-slate-900 border-cyan-500/50 shadow-xl shadow-cyan-500/10'
                      : 'bg-slate-900/40 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className={`font-mono text-sm font-bold ${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                      {pillar.step}
                    </span>
                    <div>
                      <h3 className={`font-display text-base font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-light">{pillar.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-cyan-400 translate-x-1' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Pillar Card Display */}
          <div className="lg:col-span-7">
            <div className="glass-panel h-full rounded-2xl p-8 border border-white/10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="mono-tag text-xs text-cyan-400 font-semibold tracking-wider">
                    PILLAR {pillars[activeStep].step} — {pillars[activeStep].title.toUpperCase()}
                  </span>
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    {React.createElement(pillars[activeStep].icon, { className: 'w-6 h-6' })}
                  </div>
                </div>

                <h3 className="font-display text-2xl font-bold text-white">
                  {pillars[activeStep].subtitle}
                </h3>

                <p className="text-sm text-slate-300 font-light leading-relaxed">
                  {pillars[activeStep].desc}
                </p>
              </div>

              {/* Metrics Checklist */}
              <div className="pt-6 border-t border-white/10 space-y-2">
                <div className="mono-tag text-[10px] text-slate-400 uppercase">VERIFICATION GUARANTEES</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {pillars[activeStep].metrics.map((metric, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-white/10 flex items-center space-x-2 text-xs font-mono text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="line-clamp-2">{metric}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
