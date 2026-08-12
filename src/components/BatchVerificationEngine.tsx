import React, { useState } from 'react';
import { Search, ShieldCheck, FileCheck, Award, Download, CheckCircle2, ArrowRight } from 'lucide-react';
import { BATCH_RECORDS } from '../data/batches';
import { BatchRecord } from '../types';
import { COAModal } from './COAModal';

export const BatchVerificationEngine: React.FC = () => {
  const [searchLot, setSearchLot] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<BatchRecord | null>(null);
  const [activeCOABatch, setActiveCOABatch] = useState<BatchRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const sampleLots = ['LOT-VF-8842', 'LOT-VF-9921', 'LOT-VF-7734', 'LOT-VF-8819'];

  const handleSearch = (e?: React.FormEvent, lotQuery?: string) => {
    if (e) e.preventDefault();
    const query = (lotQuery || searchLot).trim().toUpperCase();
    if (!query) return;

    setHasSearched(true);
    const found = BATCH_RECORDS[query];
    if (found) {
      setSelectedBatch(found);
      setErrorMsg('');
    } else {
      setSelectedBatch(null);
      setErrorMsg(`No active batch record found for lot "${query}". Please check the lot code printed on your vial label.`);
    }
  };

  return (
    <section id="verify-section" className="py-20 bg-slate-900/60 border-t border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>BATCH VERIFICATION ENGINE</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
            Verify your batch documentation.
          </h2>
          <p className="text-slate-400 text-sm font-light">
            Enter the physical lot number printed on your vial label to retrieve HPLC chromatograms, mass spectrometry reports, and independent analytical certificates.
          </p>
        </div>

        {/* Lot Search Form */}
        <div className="max-w-2xl mx-auto space-y-4 mb-12">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchLot}
                onChange={(e) => setSearchLot(e.target.value)}
                placeholder="Enter Lot Code (e.g. LOT-VF-8842)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-cyan-500 text-slate-950 font-display font-bold text-sm hover:bg-cyan-400 transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Search Lot</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Lot Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="mono-tag text-[10px] text-slate-400">DEMO ACTIVE LOTS:</span>
            {sampleLots.map((lot) => (
              <button
                key={lot}
                onClick={() => {
                  setSearchLot(lot);
                  handleSearch(undefined, lot);
                }}
                className="px-2.5 py-1 rounded bg-slate-950 border border-white/10 hover:border-cyan-500/40 text-cyan-300 font-mono text-xs transition-colors"
              >
                {lot}
              </button>
            ))}
          </div>
        </div>

        {/* Results Box */}
        {hasSearched && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
            {errorMsg ? (
              <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-center space-y-2">
                <p className="font-mono text-sm">{errorMsg}</p>
                <p className="text-xs text-slate-400">
                  Tip: Active demo lots include <span className="font-mono text-white">LOT-VF-8842</span>, <span className="font-mono text-white">LOT-VF-9921</span>, <span className="font-mono text-white">LOT-VF-7734</span>.
                </p>
              </div>
            ) : selectedBatch ? (
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-emerald-500/30 space-y-6 shadow-2xl">
                
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-6 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
                        LOT VERIFIED
                      </span>
                      <span className="font-mono text-xs text-slate-400">
                        Tested: {selectedBatch.testingDate}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white">
                      {selectedBatch.productName}
                    </h3>
                    <p className="text-xs font-mono text-slate-400">
                      CAS: {selectedBatch.casNumber} | Lab: {selectedBatch.testingLab}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveCOABatch(selectedBatch)}
                    className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-cyan-500 text-slate-950 font-display font-bold text-xs hover:bg-cyan-400 transition-all shadow-lg"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>View Full Interactive COA</span>
                  </button>
                </div>

                {/* Audit Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-white/10">
                    <div className="mono-tag text-[10px] text-slate-400">RP-HPLC PURITY</div>
                    <div className="font-mono text-2xl font-bold text-emerald-400 mt-1">
                      {selectedBatch.purity.toFixed(2)}%
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-white/10">
                    <div className="mono-tag text-[10px] text-slate-400">MASS VERIFICATION</div>
                    <div className="font-mono text-base font-bold text-cyan-400 mt-1 flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>ESI-MS MATCH</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-white/10">
                    <div className="mono-tag text-[10px] text-slate-400">ENDOTOXIN TEST</div>
                    <div className="font-mono text-base font-bold text-slate-200 mt-1">
                      &lt; 0.005 EU/mg
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-white/10">
                    <div className="mono-tag text-[10px] text-slate-400">LOT CODE</div>
                    <div className="font-mono text-sm font-bold text-cyan-300 mt-1">
                      {selectedBatch.lotNumber}
                    </div>
                  </div>
                </div>

                {/* Analyst Notes Preview */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-1">
                  <div className="mono-tag text-[10px] text-cyan-400 uppercase">Independent Analyst Remarks</div>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">
                    {selectedBatch.labNotes}
                  </p>
                </div>

              </div>
            ) : null}
          </div>
        )}

        {/* Modal COA overlay */}
        {activeCOABatch && (
          <COAModal batch={activeCOABatch} onClose={() => setActiveCOABatch(null)} />
        )}

      </div>
    </section>
  );
};
