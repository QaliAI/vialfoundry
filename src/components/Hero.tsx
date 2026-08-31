import React from 'react';
import { ArrowRight, ShieldCheck, FileCheck } from 'lucide-react';

interface HeroProps {
  navigate: (path: string) => void;
  onQuickVerify?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ navigate }) => {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-[#FAFAF9] via-white to-[#F8FAFC] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Credibility Eyebrow */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-600" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-700">FOR RESEARCH USE ONLY · LABORATORY GRADE</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Precision reference materials. <span className="text-cyan-700">Verified by independent analysis.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
              Carefully synthesized peptide standards and biochemical compounds supported by lot-specific HPLC chromatograms, mass spectrometry reports, and full batch traceability.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <button
                onClick={() => navigate('/catalog')}
                className="flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-medium text-sm shadow-sm transition-all font-display"
              >
                <span>Shop Research Materials</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/verify')}
                className="flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-medium text-sm hover:bg-slate-50 hover:border-slate-400 transition-all shadow-2xs font-display"
              >
                <FileCheck className="w-4 h-4 text-cyan-700" />
                <span>View Lab Results & COAs</span>
              </button>
            </div>

            {/* Trust Micro-Points */}
            <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-200 max-w-lg">
              <div>
                <div className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider">HPLC PURITY</div>
                <div className="font-mono text-lg font-bold text-slate-900 mt-0.5">≥ 99.0%</div>
              </div>
              <div>
                <div className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider">MASS CONFIRMATION</div>
                <div className="font-mono text-lg font-bold text-cyan-800 mt-0.5">ESI-MS</div>
              </div>
              <div>
                <div className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider">BATCH ARCHIVES</div>
                <div className="font-mono text-lg font-bold text-emerald-700 mt-0.5">100% PUBLIC</div>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Physical Product Showcase */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="relative w-full max-w-lg rounded-2xl overflow-hidden bg-white border border-slate-200/90 shadow-card p-4">
              <img
                src="/assets/vials/products/hero-product-composition.svg"
                alt="Vial Foundry Research Reference Materials"
                className="w-full h-auto object-contain rounded-xl"
                loading="eager"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

