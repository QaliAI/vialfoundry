import React, { useState } from 'react';
import { Search, ShieldCheck, FileCheck, CheckCircle2, ArrowRight } from 'lucide-react';
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
      setErrorMsg(`No active batch record found for lot "${query}". Please check the lot code printed on your physical vial label.`);
    }
  };

  return (
    <section id="verify-section" className="py-16 sm:py-20 bg-white border-t border-slate-200/80 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>BATCH VERIFICATION PORTAL</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Verify lot documentation.
          </h2>
          <p className="text-slate-600 text-sm font-normal leading-relaxed">
            Enter the lot number printed on your vial to retrieve independent HPLC chromatograms, mass spectrometry data, and official certificates of analysis.
          </p>
        </div>

        {/* Lot Search Form */}
        <div className="max-w-xl mx-auto space-y-3 mb-10">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchLot}
                onChange={(e) => setSearchLot(e.target.value)}
                placeholder="Enter Lot Code (e.g. LOT-VF-8842)..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 font-mono text-sm focus:outline-none focus:bg-white focus:border-cyan-600 transition-colors shadow-2xs"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-medium text-sm shadow-sm transition-all flex items-center justify-center space-x-2 font-display"
            >
              <span>Verify Lot</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Lot Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <span className="text-[11px] font-mono text-slate-500">SAMPLE LOTS:</span>
            {sampleLots.map((lot) => (
              <button
                key={lot}
                type="button"
                onClick={() => {
                  setSearchLot(lot);
                  handleSearch(undefined, lot);
                }}
                className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/80 hover:bg-cyan-50 hover:border-cyan-300 text-slate-700 hover:text-cyan-800 font-mono text-xs transition-colors"
              >
                {lot}
              </button>
            ))}
          </div>
        </div>

        {/* Results Box */}
        {hasSearched && (
          <div className="max-w-3xl mx-auto animate-in fade-in duration-200">
            {errorMsg ? (
              <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-center space-y-1">
                <p className="font-mono text-sm font-semibold">{errorMsg}</p>
                <p className="text-xs text-slate-500">
                  Tip: Active demo lots include <span className="font-mono text-slate-800 font-bold">LOT-VF-8842</span>, <span className="font-mono text-slate-800 font-bold">LOT-VF-9921</span>, <span className="font-mono text-slate-800 font-bold">LOT-VF-7734</span>.
                </p>
              </div>
            ) : selectedBatch ? (
              <div className="storefront-card p-6 sm:p-8 rounded-2xl border border-emerald-300/80 bg-white space-y-6 shadow-card">
                
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-xs font-bold border border-emerald-200">
                        LOT VERIFIED
                      </span>
                      <span className="font-mono text-xs text-slate-500">
                        Tested: {selectedBatch.testingDate}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-slate-900">
                      {selectedBatch.productName}
                    </h3>
                    <p className="text-xs font-mono text-slate-500">
                      CAS: {selectedBatch.casNumber} | Lab: {selectedBatch.testingLab}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveCOABatch(selectedBatch)}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-medium text-xs shadow-sm transition-all font-display"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>View Interactive COA</span>
                  </button>
                </div>

                {/* Audit Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">RP-HPLC PURITY</div>
                    <div className="font-mono text-xl font-bold text-emerald-700 mt-0.5">
                      {selectedBatch.purity.toFixed(2)}%
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">MASS IDENTITY</div>
                    <div className="font-mono text-sm font-bold text-slate-900 mt-1 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ESI-MS MATCH</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">ENDOTOXIN</div>
                    <div className="font-mono text-sm font-bold text-slate-800 mt-1">
                      &lt; 0.005 EU/mg
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">LOT NUMBER</div>
                    <div className="font-mono text-xs font-bold text-cyan-800 mt-1">
                      {selectedBatch.lotNumber}
                    </div>
                  </div>
                </div>

                {/* Analyst Notes Preview */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] font-mono font-semibold text-cyan-800 uppercase">Laboratory Notes</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
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

