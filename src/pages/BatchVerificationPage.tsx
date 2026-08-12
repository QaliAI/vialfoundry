import React from 'react';
import { BatchVerificationEngine } from '../components/BatchVerificationEngine';
import { ShieldCheck, FileCheck, Search, Database } from 'lucide-react';

export const BatchVerificationPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 space-y-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>LOT VERIFICATION PORTAL</span>
        </div>
        <h1 className="font-display text-4xl font-extrabold text-white">
          Batch Traceability & Analytical Records
        </h1>
        <p className="text-slate-400 text-sm font-light max-w-2xl mx-auto">
          Access independent liquid chromatography (HPLC) peak integration data, electrospray mass spectrometry reports, and downloadable PDF certificates for any Vial Foundry lot.
        </p>
      </div>

      <BatchVerificationEngine />
    </div>
  );
};
