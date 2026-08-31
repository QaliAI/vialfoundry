import React from 'react';
import { LegalDoc } from '../data/legal';

export const LegalDocument: React.FC<{ doc: LegalDoc }> = ({ doc }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-[#FAFAF9]">
      <div className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-800 mb-3">
        Policies &amp; Legal
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
        {doc.title}
      </h1>
      <p className="mt-3 text-xs font-mono text-slate-500">Last updated: {doc.updated}</p>

      <p className="mt-8 text-slate-700 font-normal leading-relaxed text-base">{doc.intro}</p>

      <div className="mt-10 space-y-10">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-lg font-bold text-slate-900">{section.heading}</h2>
            <div className="mt-3 space-y-3">
              {section.body.map((para, i) => (
                <p key={i} className="text-sm text-slate-600 font-normal leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {doc.slug === 'refunds' && (
        <div className="mt-12 p-6 rounded-2xl bg-cyan-50 border border-cyan-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Refer researchers, earn commission</h3>
            <p className="text-xs text-slate-600 mt-1">
              Qualified research creators and community operators can join the Vial Foundry Affiliate Program.
            </p>
          </div>
          <a
            href="/affiliates"
            className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-display font-bold text-xs shadow-sm transition-all"
          >
            Join Affiliate Program
          </a>
        </div>
      )}

      <div className="mt-16 p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 font-mono leading-relaxed">
        This document is provided for general informational purposes and does not constitute
        formal legal counsel. Vial Foundry operates under strict laboratory Research Use Only (RUO) supply terms.
      </div>
    </div>
  );
};

