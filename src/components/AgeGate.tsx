'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, FlaskConical, AlertTriangle } from 'lucide-react';

const ACK_KEY = 'vf_ruo_ack';

/**
 * Research-Use-Only acknowledgment gate.
 * Shown once per browser; the acceptance is persisted in localStorage.
 * Blocks interaction with the site until the visitor confirms they are a
 * qualified researcher (18+) and understands the RUO terms.
 */
export const AgeGate: React.FC = () => {
  const [acknowledged, setAcknowledged] = useState(true); // assume true to avoid flash before hydration

  useEffect(() => {
    try {
      setAcknowledged(localStorage.getItem(ACK_KEY) === 'true');
    } catch {
      setAcknowledged(true);
    }
  }, []);

  const accept = () => {
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#050608]/95 backdrop-blur-md px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-white/15 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="font-display text-lg font-bold text-white tracking-tight">
              VIAL <span className="text-cyan-400 font-light">FOUNDRY</span>
            </div>
            <div className="mono-tag text-[10px] uppercase tracking-widest text-slate-500">
              Research Use Only — Access Confirmation
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 text-sm text-slate-300 font-light">
          <div className="flex items-start space-x-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-amber-200/90 text-xs leading-relaxed">
              All products are sold strictly as <strong>research materials</strong>. They are
              <strong> not for human or animal consumption</strong>, medical, clinical, veterinary,
              diagnostic, or therapeutic use of any kind.
            </p>
          </div>

          <p className="leading-relaxed">By entering this site, you confirm that:</p>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>You are at least <strong className="text-slate-200">18 years of age</strong>.</span>
            </li>
            <li className="flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>You are a <strong className="text-slate-200">qualified researcher or institution</strong> purchasing for laboratory research only.</span>
            </li>
            <li className="flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>You have read and accept the <strong className="text-slate-200">RUO Disclaimer, Terms of Service, and Privacy Policy</strong>.</span>
            </li>
          </ul>
        </div>

        <div className="p-6 pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={accept}
            className="flex-1 px-5 py-3 rounded-xl bg-cyan-500 text-slate-950 font-display font-bold text-sm hover:bg-cyan-400 transition-all"
          >
            I Confirm — Enter Site
          </button>
          <button
            onClick={decline}
            className="flex-1 px-5 py-3 rounded-xl bg-slate-900 border border-white/15 text-slate-300 font-display font-medium text-sm hover:bg-slate-800 transition-all"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};
