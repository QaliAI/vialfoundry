import React from 'react';
import { Target, ShieldCheck, FileCheck, Layers } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      <div className="space-y-4 text-center">
        <div className="mono-tag text-xs text-cyan-400 font-semibold uppercase tracking-wider">
          ABOUT VIAL FOUNDRY
        </div>
        <h1 className="font-display text-4xl font-extrabold text-white">
          Precision-built around verification.
        </h1>
        <p className="text-slate-400 text-sm font-light max-w-2xl mx-auto">
          Vial Foundry was established to solve a fundamental problem in chemical research: the gap between manufactured material and verifiable documentation.
        </p>
      </div>

      <div className="glass-panel p-8 sm:p-10 rounded-2xl border border-white/10 space-y-6 text-sm text-slate-300 font-light leading-relaxed">
        <h3 className="font-display text-xl font-bold text-white">Our Philosophy</h3>
        <p>
          Research materials should be presented with the same precision used to evaluate them. We reject ambiguous purity claims, generic COA templates, and unverified batch claims. Every vial distributed by Vial Foundry is tied to physical analytical records drawn from that specific production lot.
        </p>

        <h3 className="font-display text-xl font-bold text-white pt-4">Operational Discipline</h3>
        <p>
          We treat chemical sourcing as an engineering discipline. From solid-phase synthesis validation to cold-chain nitrogen packaging, our operations prioritize stability, batch homogeneity, and open documentation access.
        </p>
      </div>

    </div>
  );
};
