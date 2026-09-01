'use client';

import React, { useState } from 'react';
import { Search, FileCheck, FileClock, ArrowRight, HelpCircle } from 'lucide-react';
import {
  getBatchRecord,
  getProductForLot,
  normalizeLot,
  VERIFIED_LOT_COUNT,
} from '../data/batches';
import { BatchRecord, Product } from '../types';
import { COAModal } from './COAModal';
import { trackEvent } from '../lib/analytics';

type LookupResult =
  | { kind: 'verified'; batch: BatchRecord; product: Product | null }
  | { kind: 'pending'; product: Product; lot: string }
  | { kind: 'unknown'; lot: string };

interface Props {
  navigate?: (path: string) => void;
  /** Set false when the host page already carries the heading, to avoid repeating it. */
  showHeader?: boolean;
}

export const BatchVerificationEngine: React.FC<Props> = ({ navigate, showHeader = true }) => {
  const [searchLot, setSearchLot] = useState('');
  const [result, setResult] = useState<LookupResult | null>(null);
  const [activeCOABatch, setActiveCOABatch] = useState<BatchRecord | null>(null);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const lot = normalizeLot(searchLot);
    if (!lot) return;

    const batch = getBatchRecord(lot);
    const product = getProductForLot(lot);

    if (batch) {
      setResult({ kind: 'verified', batch, product });
    } else if (product) {
      setResult({ kind: 'pending', product, lot });
    } else {
      setResult({ kind: 'unknown', lot });
    }

    trackEvent('lot_searched', {
      outcome: batch ? 'verified' : product ? 'pending' : 'unknown',
    });
  };

  return (
    <section
      id="verify-section"
      className={`bg-brand-paper border-t border-brand-border relative ${
        showHeader ? 'py-16 sm:py-20' : 'pt-10 pb-16 sm:pb-20'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {showHeader ? (
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-canvas border border-brand-border text-brand-ink text-xs font-sans font-medium shadow-2xs">
              <FileCheck className="w-4 h-4 text-brand-accent" />
              <span className="tracking-wider uppercase text-[11px] text-brand-graphite font-semibold">
                Lot Documentation Lookup
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink tracking-tight">
              Check what documentation exists for a lot.
            </h2>
            <p className="text-brand-steel text-sm font-normal leading-relaxed">
              Enter the lot number printed on your vial. If we hold a certificate of analysis for
              that lot, you can read it here. If we do not, this will say so.
            </p>
            <p className="text-xs font-mono text-brand-steel">
              {VERIFIED_LOT_COUNT === 0
                ? 'Certificates on file: none yet'
                : `Certificates on file: ${VERIFIED_LOT_COUNT}`}
            </p>
          </div>
        ) : (
          <p className="text-center text-xs font-mono text-brand-steel mb-6">
            {VERIFIED_LOT_COUNT === 0
              ? 'Certificates on file: none yet'
              : `Certificates on file: ${VERIFIED_LOT_COUNT}`}
          </p>
        )}

        <div className="max-w-xl mx-auto mb-10">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-steel" />
              <label htmlFor="lot-lookup" className="sr-only">
                Lot number
              </label>
              <input
                id="lot-lookup"
                type="text"
                value={searchLot}
                onChange={(e) => setSearchLot(e.target.value)}
                placeholder="Enter lot code from your vial label"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink placeholder-brand-steel font-mono text-sm focus:outline-none focus:bg-brand-paper focus:border-brand-graphite transition-colors shadow-2xs"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-graphite text-brand-paper font-display font-semibold text-sm shadow-xs transition-all flex items-center justify-center space-x-2"
            >
              <span>Look up lot</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {result && (
          <div className="max-w-3xl mx-auto animate-in fade-in duration-200">
            {result.kind === 'verified' && (
              <div className="storefront-card p-6 sm:p-8 rounded-2xl border border-brand-border-strong bg-brand-paper space-y-6 shadow-card">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-brand-border/60 pb-5 gap-4">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded bg-brand-canvas text-brand-mineral font-mono text-xs font-bold border border-brand-border">
                      CERTIFICATE ON FILE
                    </span>
                    <h3 className="font-display text-2xl font-bold text-brand-ink pt-1">
                      {result.batch.productName}
                    </h3>
                    <p className="text-xs font-mono text-brand-steel">
                      Lot {result.batch.lotNumber} · Issued by {result.batch.issuedBy}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveCOABatch(result.batch);
                      trackEvent('documentation_viewed', { source: 'lot_lookup' });
                    }}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-graphite text-brand-paper font-display font-semibold text-xs shadow-xs transition-all"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Read the certificate</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {result.batch.purity !== undefined && (
                    <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-border">
                      <div className="text-[10px] font-sans text-brand-steel uppercase font-medium">
                        Reported purity
                      </div>
                      <div className="font-mono text-xl font-bold text-brand-mineral mt-0.5">
                        {result.batch.purity.toFixed(2)}%
                      </div>
                    </div>
                  )}
                  {result.batch.analyticalMethod && (
                    <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-border">
                      <div className="text-[10px] font-sans text-brand-steel uppercase font-medium">Method</div>
                      <div className="font-mono text-xs font-bold text-brand-ink mt-1.5">
                        {result.batch.analyticalMethod}
                      </div>
                    </div>
                  )}
                  {result.batch.testingDate && (
                    <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-border">
                      <div className="text-[10px] font-sans text-brand-steel uppercase font-medium">Test date</div>
                      <div className="font-mono text-xs font-bold text-brand-ink mt-1.5">
                        {result.batch.testingDate}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {result.kind === 'pending' && (
              <div className="storefront-card p-6 sm:p-8 rounded-2xl border border-brand-border bg-brand-paper space-y-5">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-brand-canvas text-brand-graphite font-mono text-xs font-bold border border-brand-border">
                    <FileClock className="w-3.5 h-3.5" />
                    DOCUMENTATION PENDING
                  </span>
                  <h3 className="font-display text-2xl font-bold text-brand-ink">
                    {result.product.name}
                  </h3>
                  <p className="text-sm text-brand-steel leading-relaxed">
                    Lot <span className="font-mono text-brand-ink">{result.lot}</span> is a lot we
                    ship, but we do not yet hold a certificate of analysis on file for it. We will
                    not show you analytical results we cannot evidence.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      trackEvent('documentation_requested', { lot: result.lot });
                      navigate?.('/contact');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-graphite text-brand-paper font-display font-semibold text-xs shadow-xs transition-all"
                  >
                    Request documentation for this lot
                  </button>
                  <button
                    onClick={() => navigate?.(`/product/${result.product.id}`)}
                    className="px-5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-ink font-display font-semibold text-xs hover:bg-brand-surface-muted transition-all"
                  >
                    View product
                  </button>
                </div>
              </div>
            )}

            {result.kind === 'unknown' && (
              <div className="p-6 rounded-2xl bg-brand-canvas border border-brand-border text-center space-y-2">
                <HelpCircle className="w-5 h-5 text-brand-steel mx-auto" />
                <p className="font-sans text-sm font-semibold text-brand-ink">
                  No lot matching &ldquo;{result.lot}&rdquo; in our catalog.
                </p>
                <p className="text-xs text-brand-steel">
                  Check the code printed on your vial label, or contact us and we will trace it.
                </p>
                <button
                  onClick={() => navigate?.('/contact')}
                  className="text-xs font-display font-bold text-brand-ink hover:text-brand-graphite underline underline-offset-4"
                >
                  Contact support
                </button>
              </div>
            )}
          </div>
        )}

        {activeCOABatch && (
          <COAModal batch={activeCOABatch} onClose={() => setActiveCOABatch(null)} />
        )}
      </div>
    </section>
  );
};
