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
    <section id="verify-section" className="py-16 sm:py-20 bg-brand-paper border-t border-brand-border relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans font-medium shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-brand-accent" />
            <span className="tracking-wider uppercase text-[11px] text-brand-graphite font-semibold">
              Lot Documentation Portal
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink tracking-tight">
            Verify lot documentation.
          </h2>
          <p className="text-brand-steel text-sm font-normal leading-relaxed">
            Enter the lot number printed on your vial to retrieve analytical HPLC chromatograms, mass spectrometry reports, and batch certificates.
          </p>
        </div>

        {/* Lot Search Form */}
        <div className="max-w-xl mx-auto space-y-3 mb-10">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-steel" />
              <input
                type="text"
                value={searchLot}
                onChange={(e) => setSearchLot(e.target.value)}
                placeholder="Enter Lot Code (e.g. LOT-VF-8842)..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink placeholder-brand-steel font-mono text-sm focus:outline-none focus:bg-brand-paper focus:border-brand-graphite transition-colors shadow-2xs"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-graphite text-brand-paper font-display font-semibold text-sm shadow-xs transition-all flex items-center justify-center space-x-2"
            >
              <span>Verify Lot</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Lot Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <span className="text-[11px] font-sans font-medium text-brand-steel">SAMPLE LOTS:</span>
            {sampleLots.map((lot) => (
              <button
                key={lot}
                type="button"
                onClick={() => {
                  setSearchLot(lot);
                  handleSearch(undefined, lot);
                }}
                className="px-2 py-0.5 rounded bg-brand-canvas border border-brand-border hover:bg-brand-surface-muted hover:border-brand-border-strong text-brand-graphite font-mono text-xs transition-colors"
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
              <div className="p-6 rounded-2xl bg-brand-canvas border border-brand-border text-brand-ink text-center space-y-1">
                <p className="font-sans text-sm font-semibold text-brand-danger">{errorMsg}</p>
                <p className="text-xs text-brand-steel">
                  Example lot codes for review include <span className="font-mono text-brand-ink font-bold">LOT-VF-8842</span>, <span className="font-mono text-brand-ink font-bold">LOT-VF-9921</span>, <span className="font-mono text-brand-ink font-bold">LOT-VF-7734</span>.
                </p>
              </div>
            ) : selectedBatch ? (
              <div className="storefront-card p-6 sm:p-8 rounded-2xl border border-brand-border-strong bg-brand-paper space-y-6 shadow-card">
                
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-brand-border/60 pb-5 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded bg-brand-canvas text-brand-mineral font-mono text-xs font-bold border border-brand-border">
                        LOT RECORD ARCHIVED
                      </span>
                      <span className="font-mono text-xs text-brand-steel">
                        Testing Date: {selectedBatch.testingDate}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-brand-ink">
                      {selectedBatch.productName}
                    </h3>
                    <p className="text-xs font-mono text-brand-steel">
                      CAS: {selectedBatch.casNumber} | Analytical Reference: {selectedBatch.testingLab}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveCOABatch(selectedBatch)}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-graphite text-brand-paper font-display font-semibold text-xs shadow-xs transition-all"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>View Analytical COA</span>
                  </button>
                </div>

                {/* Audit Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-border">
                    <div className="text-[10px] font-sans text-brand-steel uppercase font-medium">RP-HPLC PURITY</div>
                    <div className="font-mono text-xl font-bold text-brand-mineral mt-0.5">
                      {selectedBatch.purity.toFixed(2)}%
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-border">
                    <div className="text-[10px] font-sans text-brand-steel uppercase font-medium">MASS IDENTITY</div>
                    <div className="font-mono text-sm font-bold text-brand-ink mt-1 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent" />
                      <span>ESI-MS MATCH</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-border">
                    <div className="text-[10px] font-sans text-brand-steel uppercase font-medium">ENDOTOXIN</div>
                    <div className="font-mono text-sm font-bold text-brand-ink mt-1">
                      &lt; 0.005 EU/mg
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-border">
                    <div className="text-[10px] font-sans text-brand-steel uppercase font-medium">LOT NUMBER</div>
                    <div className="font-mono text-xs font-bold text-brand-graphite mt-1">
                      {selectedBatch.lotNumber}
                    </div>
                  </div>
                </div>

                {/* Analyst Notes Preview */}
                <div className="p-4 rounded-xl bg-brand-canvas border border-brand-border space-y-1">
                  <div className="text-[10px] font-sans font-semibold text-brand-graphite uppercase tracking-wider">Analytical Notes</div>
                  <p className="text-xs text-brand-steel leading-relaxed">
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
