import React from 'react';
import { LegalDoc } from '../data/legal';

export const LegalDocument: React.FC<{ doc: LegalDoc }> = ({ doc }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="mono-tag text-xs uppercase tracking-widest text-cyan-400 mb-3">
        Policies &amp; Legal
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">
        {doc.title}
      </h1>
      <p className="mt-3 text-xs font-mono text-slate-500">Last updated: {doc.updated}</p>

      <p className="mt-8 text-slate-300 font-light leading-relaxed">{doc.intro}</p>

      <div className="mt-10 space-y-10">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-lg font-bold text-white">{section.heading}</h2>
            <div className="mt-3 space-y-3">
              {section.body.map((para, i) => (
                <p key={i} className="text-sm text-slate-400 font-light leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 p-4 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-500 font-mono leading-relaxed">
        This document is provided for general informational purposes and does not constitute
        legal advice. Vial Foundry recommends reviewing all policies with qualified counsel for
        your jurisdiction.
      </div>
    </div>
  );
};
