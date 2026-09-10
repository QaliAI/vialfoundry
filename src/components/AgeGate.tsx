'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BrandLogo } from './BrandLogo';

const ACK_KEY = 'vf_ruo_ack_v2';

type AckId = 'age' | 'ruo' | 'terms';

const ACKNOWLEDGEMENTS: ReadonlyArray<{ id: AckId; label: React.ReactNode }> = [
  {
    id: 'age',
    label: <>I confirm that I am 21 years of age or older.</>,
  },
  {
    id: 'ruo',
    label: (
      <>
        I understand that Vial Foundry products are sold strictly for research use and are not
        intended for human or animal consumption.
      </>
    ),
  },
  {
    id: 'terms',
    label: (
      <>
        I have read and agree to the{' '}
        <a
          href="/legal/ruo-disclaimer"
          className="text-brand-teal underline underline-offset-2 hover:text-white transition-colors"
        >
          Research Use Only Policy
        </a>{' '}
        and{' '}
        <a
          href="/legal/terms"
          className="text-brand-teal underline underline-offset-2 hover:text-white transition-colors"
        >
          Terms
        </a>
        .
      </>
    ),
  },
];

/**
 * Research-Use-Only entry gate.
 *
 * All three acknowledgements must be checked before the site can be entered.
 * Acceptance is persisted per browser under `vf_ruo_ack_v2`.
 *
 * The 21+ requirement is Vial Foundry company policy. It is deliberately not
 * described as a federal or legal age requirement, because it is not one.
 */
export const AgeGate: React.FC = () => {
  const [acknowledged, setAcknowledged] = useState(true);
  const [checked, setChecked] = useState<Record<AckId, boolean>>({
    age: false,
    ruo: false,
    terms: false,
  });

  useEffect(() => {
    try {
      setAcknowledged(localStorage.getItem(ACK_KEY) === 'true');
    } catch {
      // Private mode or storage disabled: fail open rather than trapping the user.
      setAcknowledged(true);
    }
  }, []);

  const allChecked = useMemo(
    () => ACKNOWLEDGEMENTS.every((a) => checked[a.id]),
    [checked],
  );

  const accept = () => {
    if (!allChecked) return;
    try {
      localStorage.setItem(ACK_KEY, 'true');
    } catch {
      /* ignore private-mode storage errors */
    }
    setAcknowledged(true);
  };

  const decline = () => {
    window.location.href = 'https://www.google.com';
  };

  if (acknowledged) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-brand-midnight-deep/80 backdrop-blur-sm px-4 py-8 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vf-ruo-title"
    >
      <div className="w-full max-w-xl rounded-2xl bg-brand-midnight text-white shadow-2xl overflow-hidden ring-1 ring-white/10">
        <div className="px-8 pt-9 pb-7 text-center border-b border-white/10">
          <BrandLogo variant="stacked" height={104} tone="white" className="mx-auto" />
          <p
            id="vf-ruo-title"
            className="mt-6 font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-teal"
          >
            Research Use Only
          </p>
        </div>

        <div className="px-8 py-7 space-y-5">
          <p className="text-sm leading-relaxed text-slate-300">
            Vial Foundry supplies materials for qualified laboratory and analytical research.
            Please confirm the following before entering.
          </p>

          <div className="space-y-3">
            {ACKNOWLEDGEMENTS.map(({ id, label }) => (
              <label
                key={id}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-brand-teal/50 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked[id]}
                  onChange={(e) =>
                    setChecked((prev) => ({ ...prev, [id]: e.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-transparent text-brand-teal accent-[#2F9E9A] focus:ring-2 focus:ring-brand-teal focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-[13px] leading-relaxed text-slate-200">{label}</span>
              </label>
            ))}
          </div>

          <p className="text-[11px] leading-relaxed text-slate-400">
            The 21+ requirement is Vial Foundry company policy for access to this catalogue.
          </p>
        </div>

        <div className="px-8 pb-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={accept}
            disabled={!allChecked}
            aria-disabled={!allChecked}
            className="flex-1 px-6 py-3.5 rounded-xl font-display font-semibold text-sm transition-all bg-white text-brand-midnight hover:bg-brand-mist disabled:bg-white/10 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            Enter Site
          </button>
          <button
            onClick={decline}
            className="flex-1 sm:flex-none sm:px-8 px-6 py-3.5 rounded-xl border border-white/20 text-slate-300 font-display font-medium text-sm hover:bg-white/5 hover:text-white transition-all"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};
