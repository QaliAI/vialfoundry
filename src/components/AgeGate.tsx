'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, FlaskConical, AlertTriangle } from 'lucide-react';

const ACK_KEY = 'vf_ruo_ack';

/**
 * Research-Use-Only acknowledgment gate.
 * Shown once per browser; acceptance persisted in localStorage.
 * Confirms user is 18+ and understands RUO policies.
 */
export const AgeGate: React.FC = () => {
  const [acknowledged, setAcknowledged] = useState(true);

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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden text-slate-900">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-800">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display text-lg font-bold text-slate-900 tracking-tight">
              VIAL <span className="text-cyan-700 font-semibold">FOUNDRY</span>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Research Use Only — Access Confirmation
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 text-sm text-slate-600">
          <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-900 text-xs leading-relaxed">
              All products are sold strictly as <strong>research materials</strong>. They are
              <strong> not for human or animal consumption</strong>, medical, clinical, veterinary,
              diagnostic, or therapeutic use of any kind.
            </p>
          </div>

          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">By entering this site, you confirm that:</p>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>You are at least <strong className="text-slate-900">18 years of age</strong>.</span>
            </li>
            <li className="flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>You are a <strong className="text-slate-900">qualified researcher or institution</strong> purchasing for laboratory research only.</span>
            </li>
            <li className="flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>You have read and accept the <strong className="text-slate-900">RUO Disclaimer, Terms of Service, and Privacy Policy</strong>.</span>
            </li>
          </ul>
        </div>

        <div className="p-6 pt-2 flex flex-col sm:flex-row gap-3 border-t border-slate-100">
          <button
            onClick={accept}
            className="flex-1 px-5 py-3 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-display font-bold text-sm shadow-sm transition-all"
          >
            I Confirm — Enter Site
          </button>
          <button
            onClick={decline}
            className="flex-1 px-5 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-display font-medium text-sm hover:bg-slate-200 transition-all"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};

