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
    <div className="flex justify-between gap-4 py-2.5 border-b border-slate-100">
      <span className="text-slate-500 text-xs font-mono">{label}</span>
      <span className="text-slate-900 text-xs font-mono font-medium text-right break-all">{value}</span>
    </div>
  );

export const ProductTabs: React.FC<ProductTabsProps> = ({ product, batchRecord, onViewCOA, navigate }) => {
  const [active, setActive] = useState<TabKey>('overview');

  return (
    <div className="border-t border-slate-200 pt-10">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-display font-bold transition-all ${
              active === key
                ? 'bg-cyan-700 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="max-w-3xl bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
        {active === 'overview' && (
          <div className="space-y-6">
            <p className="text-sm text-slate-600 font-normal leading-relaxed">{product.description}</p>
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-cyan-800 uppercase tracking-wider">
                Quality Assurance & Technical Notes
              </h4>
              <ul className="space-y-2 text-xs font-mono text-slate-700">
                {product.technicalNotes.map((note, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {active === 'specifications' && (
          <div className="space-y-0.5">
            <SpecRow label="Product Name" value={product.name} />
            <SpecRow label="SKU" value={product.sku} />
            <SpecRow label="CAS Registry" value={product.casNumber} />
            <SpecRow label="Molecular Formula" value={product.chemicalFormula} />
            <SpecRow label="Molecular Weight" value={product.molecularWeight} />
            <SpecRow label="Amino Acid Sequence" value={product.sequence} />
            <SpecRow label="Purity (RP-HPLC)" value={`${product.purityPercentage}%`} />
            <SpecRow label="Presentation" value={product.size} />
            <SpecRow label="Physical Appearance" value={product.appearance} />
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
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {batchRecord.labNotes}
                </p>
                {onViewCOA && (
                  <button
                    onClick={onViewCOA}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-display font-bold text-xs transition-all shadow-sm"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>View Full Interactive COA</span>
                  </button>
                )}
                <button
                  onClick={() => navigate('/verify')}
                  className="block text-xs font-mono text-cyan-800 hover:text-cyan-900 font-semibold"
                >
                  → Verify this lot in the public Batch Verification portal
                </button>
              </>
            ) : (
              <p className="text-xs text-slate-500 font-mono">
                Documentation for this lot is being finalized. Contact support for the current COA.
              </p>
            )}
          </div>
        )}

        {active === 'storage' && (
          <div className="space-y-4 text-sm text-slate-600 font-normal leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-mono font-bold text-cyan-800 uppercase block mb-1">Storage Conditions</span>
              <span className="text-slate-900 font-medium text-sm">{product.storageConditions}</span>
            </div>
            <ul className="space-y-2 text-xs font-mono text-slate-700">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Allow sealed vials to reach room temperature before opening to prevent moisture condensation.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Reconstitute with sterile bacteriostatic water or qualified buffers per analytical protocol.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Aliquot reconstituted solution to minimize unnecessary freeze-thaw cycles.</span>
              </li>
            </ul>
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
              For laboratory research use only. Not for human, veterinary, or clinical use.
            </div>
          </div>
        )}

        {active === 'references' && (
          <div className="space-y-4 text-sm text-slate-600 font-normal leading-relaxed">
            <p>
              Analytical identity and purity were established using validated reverse-phase liquid chromatography (RP-HPLC) and electrospray ionization mass spectrometry (ESI-MS){batchRecord ? ` (${batchRecord.analyticalMethod})` : ''}.
            </p>
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-cyan-800 uppercase tracking-wider">
                Related Research Guides
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => navigate('/resources')} className="text-cyan-800 hover:text-cyan-900 font-medium">
                    → How to read a Certificate of Analysis (COA) and HPLC chromatogram
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/resources')} className="text-cyan-800 hover:text-cyan-900 font-medium">
                    → Reconstitution and storage best practices for lyophilized peptides
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/quality')} className="text-cyan-800 hover:text-cyan-900 font-medium">
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

