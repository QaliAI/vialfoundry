'use client';

import React, { useState } from 'react';
import { CheckCircle2, FileCheck, FlaskConical, Snowflake, BookOpen, Info, FileClock } from 'lucide-react';
import { Product, BatchRecord } from '../types';
import { trackEvent } from '../lib/analytics';

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
    <div className="flex justify-between gap-4 py-2.5 border-b border-brand-border/60 font-sans">
      <span className="text-brand-steel text-xs">{label}</span>
      <span className="text-brand-ink text-xs font-mono font-medium text-right break-all">{value}</span>
    </div>
  );

export const ProductTabs: React.FC<ProductTabsProps> = ({ product, batchRecord, onViewCOA, navigate }) => {
  const [active, setActive] = useState<TabKey>('overview');

  return (
    <div className="border-t border-brand-border pt-10">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-display font-bold transition-all ${
              active === key
                ? 'bg-brand-primary text-brand-paper shadow-2xs'
                : 'bg-brand-paper border border-brand-border text-brand-steel hover:text-brand-ink hover:bg-brand-surface-muted'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="max-w-3xl bg-brand-paper p-6 sm:p-8 rounded-2xl border border-brand-border shadow-2xs">
        {active === 'overview' && (
          <div className="space-y-6">
            <p className="text-sm text-brand-steel font-normal leading-relaxed">{product.description}</p>

            <div className="space-y-3">
              <h4 className="text-xs font-sans font-semibold text-brand-graphite uppercase tracking-wider">
                What ships
              </h4>
              <ul className="space-y-2 text-xs font-sans text-brand-steel">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
                  <span>{product.size}, lot {product.lotNumber}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
                  <span>{product.appearance}</span>
                </li>
                {product.materialNotes.map((note, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-brand-steel font-sans leading-relaxed pt-1">
                Analytical results are not listed here. See the Documentation tab for what we hold
                on this lot.
              </p>
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
                  <SpecRow
                    label="Reported Purity"
                    value={batchRecord.purity !== undefined ? `${batchRecord.purity}%` : undefined}
                  />
                  <SpecRow label="Issued By" value={batchRecord.issuedBy} />
                  <SpecRow label="Method" value={batchRecord.analyticalMethod} />
                  <SpecRow label="Testing Date" value={batchRecord.testingDate} />
                  <SpecRow label="Expiry Date" value={batchRecord.expiryDate} />
                </div>
                {batchRecord.labNotes && (
                  <p className="text-xs text-brand-steel leading-relaxed bg-brand-canvas p-3 rounded-lg border border-brand-border font-sans">
                    {batchRecord.labNotes}
                  </p>
                )}
                {onViewCOA && (
                  <button
                    onClick={onViewCOA}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-graphite text-brand-paper font-display font-semibold text-xs transition-all shadow-xs"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Read the certificate</span>
                  </button>
                )}
                <button
                  onClick={() => navigate('/verify')}
                  className="block text-xs font-sans text-brand-ink hover:text-brand-graphite font-semibold"
                >
                  → Look this lot up in the documentation portal
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-canvas border border-brand-border">
                  <FileClock className="w-5 h-5 text-brand-graphite flex-shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <p className="text-sm font-display font-bold text-brand-ink">
                      Documentation pending for lot {product.lotNumber}
                    </p>
                    <p className="text-xs text-brand-steel font-sans leading-relaxed">
                      We do not hold a certificate of analysis for this lot yet, so there is nothing
                      to show you here. We would rather say that than publish figures we cannot
                      evidence. Ask us before you order and we will tell you exactly what
                      documentation ships with the current lot.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    trackEvent('documentation_requested', {
                      productId: product.id,
                      lot: product.lotNumber,
                    });
                    navigate('/contact');
                  }}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-graphite text-brand-paper font-display font-semibold text-xs transition-all shadow-xs"
                >
                  <span>Ask about this lot&apos;s documentation</span>
                </button>
              </div>
            )}
          </div>
        )}

        {active === 'storage' && (
          <div className="space-y-4 text-sm text-brand-steel font-normal leading-relaxed">
            <div className="p-4 rounded-xl bg-brand-canvas border border-brand-border">
              <span className="text-[11px] font-sans font-semibold text-brand-graphite uppercase block mb-1">Storage Requirements</span>
              <span className="text-brand-ink font-medium text-sm">{product.storageConditions}</span>
            </div>
            <ul className="space-y-2 text-xs font-sans text-brand-steel">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
                <span>Equilibrate sealed vials to room temperature before opening to avoid ambient moisture intake.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
                <span>Reconstitute with sterile bacteriostatic water or qualified analytical buffers per experimental protocol.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
                <span>Aliquot reconstituted solution to minimize unnecessary freeze-thaw cycles.</span>
              </li>
            </ul>
            <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-graphite text-xs leading-relaxed">
              For laboratory research use only. Not for human, veterinary, or clinical administration.
            </div>
          </div>
        )}

        {active === 'references' && (
          <div className="space-y-4 text-sm text-brand-steel font-normal leading-relaxed">
            {batchRecord?.analyticalMethod ? (
              <p>
                Identity and purity for lot {batchRecord.lotNumber} were determined by{' '}
                {batchRecord.analyticalMethod}, as stated on the certificate issued by{' '}
                {batchRecord.issuedBy}.
              </p>
            ) : (
              <p>
                Analytical results for this lot are not published because we do not hold a
                certificate for it. The guides below explain what to look for in a certificate when
                one is supplied.
              </p>
            )}
            <div className="space-y-2">
              <h4 className="text-xs font-sans font-semibold text-brand-graphite uppercase tracking-wider">
                Related Research Guides
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => navigate('/resources')} className="text-brand-ink hover:text-brand-graphite font-medium">
                    → How to read a Certificate of Analysis (COA) and HPLC chromatogram
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/resources')} className="text-brand-ink hover:text-brand-graphite font-medium">
                    → Storage and handling best practices for reference materials
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/quality')} className="text-brand-ink hover:text-brand-graphite font-medium">
                    → The Foundry Standard: quality assurance and documentation protocols
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
