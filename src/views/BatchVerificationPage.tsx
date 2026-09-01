import React from 'react';
import { BatchVerificationEngine } from '../components/BatchVerificationEngine';
import { ShieldCheck } from 'lucide-react';

interface BatchVerificationPageProps {
  navigate?: (path: string) => void;
}

export const BatchVerificationPage: React.FC<BatchVerificationPageProps> = ({ navigate }) => {
  return (
    <div className="pt-28 pb-20 space-y-12 bg-brand-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-brand-paper border border-brand-border text-brand-ink text-xs font-sans font-medium shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-brand-accent" />
          <span className="tracking-wider uppercase text-[11px] text-brand-graphite font-semibold">
            Lot Documentation Portal
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink tracking-tight">
          Lot documentation lookup
        </h1>
        <p className="text-brand-steel text-sm sm:text-base font-normal max-w-2xl mx-auto leading-relaxed">
          Enter a lot number to see exactly what documentation we hold for it. You will get one of
          three answers, and one of them is that we do not have a certificate yet.
        </p>
      </div>

      <BatchVerificationEngine navigate={navigate} showHeader={false} />
    </div>
  );
};
