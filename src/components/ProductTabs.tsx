'use client';

import React, { useState } from 'react';
import { CheckCircle2, FileCheck, FlaskConical, Snowflake, BookOpen, Info } from 'lucide-react';
import { Product, BatchRecord } from '../types';

interface ProductTabsProps {
  product: Product;
  batchRecord?: BatchRecord;
  onViewCOA?: () => void;
  navigate: (path: string) => void;
}

type TabKey = 'overview' | 'specifications' | 'documentation' | 'storage' | 'references';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Overview', icon: Info },
  { key: 'specifications', label: 'Specifications', icon: FlaskConical },
  { key: 'documentation', label: 'Documentation', icon: FileCheck },
  { key: 'storage', label: 'Storage & Handling', icon: Snowflake },
  { key: 'references', label: 'References', icon: BookOpen },
];

const SpecRow: React.FC<{ label: string; value?: string | number }> = ({ label, value }) =>
  value === undefined || value === '' ? null : (
    <div className="flex justify-between gap-4 py-2.5 border-b border-white/5">
      <span className="text-slate-400 text-[11px] uppercase tracking-wide font-mono">{label}</span>
      <span className="text-slate-100 text-xs font-mono text-right break-all">{value}</span>
    </div>
  );

export const ProductTabs: React.FC<ProductTabsProps> = ({ product, batchRecord, onViewCOA, navigate }) => {
  const [active, setActive] = useState<TabKey>('overview');

  return (
    <div className="border-t border-white/10 pt-10">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-display font-bold transition-all ${
              active === key
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:border-cyan-500/40'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="max-w-3xl">
        {active === 'overview' && (
          <div className="space-y-6">
            <p className="text-sm text-slate-300 font-light leading-relaxed">{product.description}</p>
            <div className="space-y-2">
              <h4 className="mono-tag text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Quality Assurance &amp; Technical Notes
              </h4>
              <ul className="space-y-2 text-xs font-mono text-slate-300">
                {product.technicalNotes.map((note, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {active === 'specifications' && (
          <div className="space-y-1">
            <SpecRow label="Product Name" value={product.name} />
            <SpecRow label="SKU" value={product.sku} />
            <SpecRow label="CAS Number" value={product.casNumber} />
            <SpecRow label="Molecular Formula" value={product.chemicalFormula} />
            <SpecRow label="Molecular Weight" value={product.molecularWeight} />
            <SpecRow label="Sequence" value={product.sequence} />
            <SpecRow label="Purity (RP-HPLC)" value={`${product.purityPercentage}%`} />
            <SpecRow label="Presentation" value={product.size} />
            <SpecRow label="Appearance" value={product.appearance} />
            <SpecRow label="Solubility" value={product.solubility} />
            <SpecRow label="Category" value={product.category} />
          </div>
        )}

        {active === 'documentation' && (
          <div className="space-y-4">
            {batchRecord ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <SpecRow label="Lot Number" value={batchRecord.lotNumber} />
                  <SpecRow label="Reported Purity" value={`${batchRecord.purity}%`} />
                  <SpecRow label="Testing Laboratory" value={batchRecord.testingLab} />
                  <SpecRow label="Analytical Method" value={batchRecord.analyticalMethod} />
                  <SpecRow label="Testing Date" value={batchRecord.testingDate} />
                  <SpecRow label="Expiry Date" value={batchRecord.expiryDate} />
                </div>
                <p className="text-xs text-slate-400 font-light leading-relaxed">{batchRecord.labNotes}</p>
                {onViewCOA && (
                  <button
                    onClick={onViewCOA}
                    className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-800 border border-white/15 text-white font-display font-bold text-xs hover:border-cyan-500/40 transition-all"
                  >
                    <FileCheck className="w-4 h-4 text-cyan-400" />
                    <span>View Full HPLC Certificate of Analysis</span>
                  </button>
                )}
                <button
                  onClick={() => navigate('/verify')}
                  className="block text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
                >
                  → Independently verify this lot in the Batch Verification portal
                </button>
              </>
            ) : (
              <p className="text-xs text-slate-400 font-mono">
                Documentation for this lot is being finalized. Contact support for the current COA.
              </p>
            )}
          </div>
        )}

        {active === 'storage' && (
          <div className="space-y-4 text-sm text-slate-300 font-light leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10">
              <span className="mono-tag text-[10px] text-cyan-400 uppercase block mb-1">Storage Conditions</span>
              <span className="text-slate-100 text-sm">{product.storageConditions}</span>
            </div>
            <ul className="space-y-2 text-xs font-mono text-slate-300">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Allow sealed vials to reach room temperature before opening to avoid condensation.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Reconstitute with an appropriate sterile solvent per your protocol; avoid vigorous agitation.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Aliquot reconstituted material to minimize freeze-thaw cycles.</span>
              </li>
            </ul>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200/90 text-xs leading-relaxed">
              For research use only. Not for human or veterinary use. Handle in a controlled laboratory
              environment following your institution&apos;s safety procedures.
            </div>
          </div>
        )}

        {active === 'references' && (
          <div className="space-y-4 text-sm text-slate-300 font-light leading-relaxed">
            <p>
              Analytical identity and purity were established using industry-standard chromatographic and
              mass-spectrometric methods{batchRecord ? ` (${batchRecord.analyticalMethod})` : ''}.
            </p>
            <div className="space-y-2">
              <h4 className="mono-tag text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Related Reading
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => navigate('/resources')} className="text-cyan-400 hover:text-cyan-300">
                    → How to read a Certificate of Analysis (COA) and HPLC chromatogram
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/resources')} className="text-cyan-400 hover:text-cyan-300">
                    → Reconstitution and storage best practices for lyophilized peptides
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/quality')} className="text-cyan-400 hover:text-cyan-300">
                    → The Foundry Standard: our analytical testing protocol
                  </button>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
