import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

export const ToolsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mw' | 'coa' | 'procurement'>('mw');

  // Molecular Weight Calculator state
  const [sequence, setSequence] = useState('Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val');

  // COA Peak Area Calculator state
  const [mainArea, setMainArea] = useState('114290');
  const [totalArea, setTotalArea] = useState('114700');

  // Procurement Estimator state
  const [vialCount, setVialCount] = useState(25);
  const [unitPrice, setUnitPrice] = useState(64);

  // MW calculation map
  const aaMW: Record<string, number> = {
    Gly: 57.05, Ala: 71.08, Val: 99.13, Leu: 113.16, Ile: 113.16,
    Pro: 97.12, Phe: 147.18, Trp: 186.21, Met: 131.19, Ser: 87.08,
    Thr: 101.11, Cys: 103.14, Tyr: 163.18, Asn: 114.10, Gln: 128.13,
    Asp: 115.09, Glu: 129.12, Lys: 128.17, Arg: 156.19, His: 137.14
  };

  const calculateMW = (seqStr: string) => {
    const codes = seqStr.split('-').map(s => s.trim());
    let total = 18.015; // Water addition
    let count = 0;
    for (const code of codes) {
      if (aaMW[code]) {
        total += aaMW[code];
        count++;
      }
    }
    return { mw: total.toFixed(2), count };
  };

  const calculatedPurity = () => {
    const m = parseFloat(mainArea) || 0;
    const t = parseFloat(totalArea) || 1;
    return ((m / t) * 100).toFixed(2);
  };

  const calcMW = calculateMW(sequence);
  const calculatedTotal = (vialCount * unitPrice * (vialCount >= 50 ? 0.85 : vialCount >= 20 ? 0.90 : 1.0)).toFixed(2);

  return (
    <section className="py-20 bg-brand-canvas border-t border-brand-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-brand-paper border border-brand-border text-brand-ink text-xs font-sans font-medium shadow-2xs">
            <Calculator className="w-4 h-4 text-brand-accent" />
            <span className="tracking-wider uppercase text-[11px] text-brand-graphite font-semibold">
              Analytical Tools
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink tracking-tight">
            Analytical tools & research calculators.
          </h2>
          <p className="text-brand-steel text-sm sm:text-base font-normal max-w-2xl mx-auto leading-relaxed">
            Calculators for peptide molecular weight estimation, chromatographic peak integration, and volume planning.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center justify-center space-x-2 max-w-xl mx-auto mb-10 p-1.5 rounded-xl bg-brand-paper border border-brand-border shadow-2xs">
          <button
            onClick={() => setActiveTab('mw')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium font-display transition-all ${
              activeTab === 'mw'
                ? 'bg-brand-primary text-brand-paper shadow-2xs font-bold'
                : 'text-brand-steel hover:text-brand-ink'
            }`}
          >
            Sequence Mass
          </button>
          <button
            onClick={() => setActiveTab('coa')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium font-display transition-all ${
              activeTab === 'coa'
                ? 'bg-brand-primary text-brand-paper shadow-2xs font-bold'
                : 'text-brand-steel hover:text-brand-ink'
            }`}
          >
            HPLC Purity Area
          </button>
          <button
            onClick={() => setActiveTab('procurement')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium font-display transition-all ${
              activeTab === 'procurement'
                ? 'bg-brand-primary text-brand-paper shadow-2xs font-bold'
                : 'text-brand-steel hover:text-brand-ink'
            }`}
          >
            Volume Estimator
          </button>
        </div>

        {/* Tab Panels */}
        <div className="max-w-3xl mx-auto bg-brand-paper p-6 sm:p-8 rounded-2xl border border-brand-border shadow-card">
          
          {activeTab === 'mw' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-sans font-semibold text-brand-graphite uppercase tracking-wider block">Enter Amino Acid Sequence (3-Letter Code Hyphenated):</label>
                <input
                  type="text"
                  value={sequence}
                  onChange={(e) => setSequence(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink font-mono text-sm focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                />
                <p className="text-[11px] text-brand-steel font-sans">Example: Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val</p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-brand-canvas border border-brand-border font-sans">
                <div>
                  <div className="text-[10px] text-brand-steel uppercase font-medium">ESTIMATED MOLECULAR MASS</div>
                  <div className="text-2xl font-bold font-mono text-brand-mineral mt-1">{calcMW.mw} g/mol</div>
                </div>
                <div>
                  <div className="text-[10px] text-brand-steel uppercase font-medium">RESIDUE COUNT</div>
                  <div className="text-2xl font-bold font-mono text-brand-ink mt-1">{calcMW.count} Residues</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'coa' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-sans font-semibold text-brand-graphite uppercase tracking-wider block">Main Peak Area (uV*sec):</label>
                  <input
                    type="number"
                    value={mainArea}
                    onChange={(e) => setMainArea(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink font-mono text-sm focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-sans font-semibold text-brand-graphite uppercase tracking-wider block">Total Chromatogram Area (uV*sec):</label>
                  <input
                    type="number"
                    value={totalArea}
                    onChange={(e) => setTotalArea(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink font-mono text-sm focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-brand-canvas border border-brand-border flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-brand-steel uppercase font-medium font-sans">CALCULATED HPLC PURITY %</div>
                  <div className="text-3xl font-bold font-mono text-brand-mineral mt-1">{calculatedPurity()}%</div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded bg-brand-paper text-brand-mineral text-xs font-bold border border-brand-border font-sans">
                    Peak Ratio Integration
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'procurement' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-sans font-semibold text-brand-graphite uppercase tracking-wider block">Vial Quantity Required:</label>
                  <input
                    type="number"
                    value={vialCount}
                    onChange={(e) => setVialCount(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink font-mono text-sm focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-sans font-semibold text-brand-graphite uppercase tracking-wider block">Unit Price ($):</label>
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 1)}
                    className="w-full px-4 py-3 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink font-mono text-sm focus:outline-none focus:bg-brand-paper focus:border-brand-graphite"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-brand-canvas border border-brand-border flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-brand-steel uppercase font-medium font-sans">ESTIMATED TOTAL</div>
                  <div className="text-3xl font-bold font-mono text-brand-ink mt-1"></div>
                </div>
                <div className="text-right text-xs text-brand-steel space-y-1 font-sans">
                  <div>Volume Tier: {vialCount >= 50 ? '15%' : vialCount >= 20 ? '10%' : 'Standard'}</div>
                  <div className="text-brand-mineral font-semibold">Lot COA Documentation Included</div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
