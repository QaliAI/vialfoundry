'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-brand-ink/60 backdrop-blur-xs px-4">
      <div className="w-full max-w-lg rounded-2xl border border-brand-border bg-brand-paper shadow-2xl overflow-hidden text-brand-ink">
        <div className="p-6 border-b border-brand-border/60 flex items-center justify-between">
          <BrandLogo variant="horizontal" size="md" />
          <span className="text-[10px] font-sans uppercase tracking-widest text-brand-steel font-medium">
            RUO Confirmation
          </span>
        </div>

        <div className="p-6 space-y-4 text-sm text-brand-steel">
          <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-brand-canvas border border-brand-border">
            <AlertTriangle className="w-5 h-5 text-brand-metal flex-shrink-0 mt-0.5" />
            <p className="text-brand-ink text-xs leading-relaxed">
              All products are sold strictly as <strong>research materials</strong>. They are
              <strong> not for human or animal consumption</strong>, medical, clinical, veterinary,
              diagnostic, or therapeutic use of any kind.
            </p>
          </div>

          <p className="text-xs font-semibold text-brand-graphite uppercase tracking-wider">By entering this site, you confirm that:</p>
          <ul className="space-y-2 text-xs text-brand-steel">
            <li className="flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
              <span>You are at least <strong className="text-brand-ink">18 years of age</strong>.</span>
            </li>
            <li className="flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
              <span>You are a <strong className="text-brand-ink">qualified researcher or institution</strong> purchasing for laboratory research only.</span>
            </li>
            <li className="flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
              <span>You have read and accept the <strong className="text-brand-ink">RUO Disclaimer, Terms of Service, and Privacy Policy</strong>.</span>
            </li>
          </ul>
        </div>

        <div className="p-6 pt-2 flex flex-col sm:flex-row gap-3 border-t border-brand-border/60">
          <button
            onClick={accept}
            className="flex-1 px-5 py-3 rounded-xl bg-brand-primary hover:bg-brand-graphite text-brand-paper font-display font-bold text-sm shadow-xs transition-all"
          >
            I Confirm — Enter Site
          </button>
          <button
            onClick={decline}
            className="flex-1 px-5 py-3 rounded-xl bg-brand-canvas border border-brand-border text-brand-graphite font-display font-medium text-sm hover:bg-brand-surface-muted transition-all"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};
