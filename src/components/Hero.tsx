import React from 'react';
import { ArrowRight, ShieldCheck, FileText, Search, Activity, Sparkles } from 'lucide-react';
import { VialStudioViewer } from './VialStudioViewer';

interface HeroProps {
  navigate: (path: string) => void;
  onQuickVerify?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ navigate, onQuickVerify }) => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-grid-pattern">
      {/* Ambient Background Video Loop */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster="/assets/videos/hero-bg-poster.jpg"
          className="w-full h-full object-cover"
        >
          <source src="/assets/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#08090B] via-[#08090B]/80 to-[#08090B]" />
      </div>

      {/* Hero Content Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Top Brand Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="mono-tag text-[11px] font-medium tracking-wider">VIALFOUNDRY.COM — RUO COMPLIANT</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Precision, forged for <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-slate-200">research.</span>
            </h1>

            {/* Subhead */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-light leading-relaxed">
              Carefully manufactured research materials supported by batch documentation, HPLC identity verification, and independent analytical testing.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <button
                onClick={() => navigate('/catalog')}
                className="flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-medium text-sm hover:from-cyan-400 hover:to-teal-400 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 font-display"
              >
                <span>Explore the Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/verify')}
                className="flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-slate-900/80 border border-white/15 text-slate-200 font-medium text-sm hover:bg-slate-800 hover:border-cyan-500/40 hover:text-cyan-300 transition-all backdrop-blur-md"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verify a Batch</span>
              </button>
            </div>

            {/* Micro Metrics Strip */}
            <div className="pt-8 grid grid-cols-3 gap-4 border-t border-white/10 max-w-lg">
              <div>
                <div className="mono-tag text-xs text-slate-400 uppercase">RP-HPLC PURITY</div>
                <div className="font-mono text-xl font-bold text-white mt-0.5">≥ 99.4%</div>
              </div>
              <div>
                <div className="mono-tag text-xs text-slate-400 uppercase">ANALYTICAL LAB</div>
                <div className="font-mono text-xl font-bold text-cyan-400 mt-0.5">ESI-MS</div>
              </div>
              <div>
                <div className="mono-tag text-xs text-slate-400 uppercase">LOT TRACEABILITY</div>
                <div className="font-mono text-xl font-bold text-emerald-400 mt-0.5">100%</div>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Interactive Studio Vial Viewer */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <VialStudioViewer onVerifyClick={() => navigate('/verify')} />
          </div>

        </div>
      </div>
    </section>
  );
};
