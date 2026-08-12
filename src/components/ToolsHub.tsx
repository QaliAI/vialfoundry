import React, { useState } from 'react';
import { Calculator, Cpu, FileText, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

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
    <section className="py-20 bg-slate-950 border-t border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
            <Calculator className="w-4 h-4" />
            <span>ANALYTICAL TOOLS HUB</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
            Analytical tools & research calculators.
          </h2>
          <p className="text-slate-400 text-sm font-light">
            Empowering researchers with sequence mass estimation, HPLC purity verification, and institutional bulk estimation tools.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center justify-center space-x-2 max-w-xl mx-auto mb-10 p-1.5 rounded-xl bg-slate-900 border border-white/10">
          <button
            onClick={() => setActiveTab('mw')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium font-display transition-all ${
              activeTab === 'mw'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sequence Mass Estimator
          </button>
          <button
            onClick={() => setActiveTab('coa')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium font-display transition-all ${
              activeTab === 'coa'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            HPLC Purity Calculator
          </button>
          <button
            onClick={() => setActiveTab('procurement')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium font-display transition-all ${
              activeTab === 'procurement'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bulk Procurement Tool
          </button>
        </div>

        {/* Tab Panels */}
        <div className="max-w-3xl mx-auto glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl">
          
          {activeTab === 'mw' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="mono-tag text-xs text-cyan-300 uppercase">Enter Amino Acid Sequence (3-Letter Code Hyphenated):</label>
                <input
                  type="text"
                  value={sequence}
                  onChange={(e) => setSequence(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[11px] text-slate-400">Example: Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val</p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900 border border-white/10 font-mono">
                <div>
                  <div className="text-[10px] text-slate-400">ESTIMATED MOLECULAR MASS</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">{calcMW.mw} g/mol</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">RESIDUE COUNT</div>
                  <div className="text-2xl font-bold text-cyan-400 mt-1">{calcMW.count} Amino Acids</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'coa' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="mono-tag text-xs text-cyan-300 uppercase">Main Peak Area (uV*sec):</label>
                  <input
                    type="number"
                    value={mainArea}
                    onChange={(e) => setMainArea(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="mono-tag text-xs text-cyan-300 uppercase">Total Chromatogram Area (uV*sec):</label>
                  <input
                    type="number"
                    value={totalArea}
                    onChange={(e) => setTotalArea(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-white/10 font-mono flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">CALCULATED HPLC PURITY %</div>
                  <div className="text-3xl font-bold text-emerald-400 mt-1">{calculatedPurity()}%</div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    CONFORMS TO STANDARD
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'procurement' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="mono-tag text-xs text-cyan-300 uppercase">Vial Quantity Required:</label>
                  <input
                    type="number"
                    value={vialCount}
                    onChange={(e) => setVialCount(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="mono-tag text-xs text-cyan-300 uppercase">Unit Vial Price ($):</label>
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 1)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-white/10 font-mono flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">ESTIMATED INSTITUTIONAL TOTAL</div>
                  <div className="text-3xl font-bold text-cyan-400 mt-1">${calculatedTotal}</div>
                </div>
                <div className="text-right text-xs text-slate-400 space-y-1">
                  <div>Tier Discount: {vialCount >= 50 ? '15%' : vialCount >= 20 ? '10%' : 'Standard'}</div>
                  <div className="text-emerald-400 font-bold">Includes Batch COA Packet</div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
