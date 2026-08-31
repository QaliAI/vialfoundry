import React from 'react';
import { LegalDoc } from '../data/legal';

export const LegalDocument: React.FC<{ doc: LegalDoc }> = ({ doc }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-brand-canvas">
      <div className="text-xs font-sans font-semibold uppercase tracking-widest text-brand-steel mb-3">
        Policies &amp; Legal
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-extrabold text-brand-ink tracking-tight">
        {doc.title}
      </h1>
      <p className="mt-3 text-xs font-sans text-brand-steel">Last updated: {doc.updated}</p>

      <p className="mt-8 text-brand-steel font-normal leading-relaxed text-base">{doc.intro}</p>

      <div className="mt-10 space-y-10">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-lg font-bold text-brand-ink">{section.heading}</h2>
            <div className="mt-3 space-y-3">
              {section.body.map((para, i) => (
                <p key={i} className="text-sm text-brand-steel font-normal leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {doc.slug === 'refunds' && (
        <div className="mt-12 p-6 rounded-2xl bg-brand-paper border border-brand-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-bold text-brand-ink">Refer researchers, earn commission</h3>
            <p className="text-xs text-brand-steel mt-1">
              Qualified research educators and community operators can join the Vial Foundry Affiliate Program.
            </p>
          </div>
          <a
            href="/affiliates"
            className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-graphite text-brand-paper font-display font-bold text-xs shadow-xs transition-all"
          >
            Join Affiliate Program
          </a>
        </div>
      )}

      <div className="mt-16 p-4 rounded-xl bg-brand-paper border border-brand-border text-xs text-brand-steel font-sans leading-relaxed">
        This document is provided for general informational purposes and does not constitute
        formal legal counsel. Vial Foundry operates under strict laboratory Research Use Only (RUO) supply terms.
      </div>
    </div>
  );
};
