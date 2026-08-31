import React from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { PaymentMethod } from '../data/payment';

interface Props {
  method: PaymentMethod;
  total: number;
  orderRef: string;
  /** When true, renders a copy button for the handle (client contexts only). */
  onCopyHandle?: () => void;
  copied?: boolean;
}

export const PaymentInstructions: React.FC<Props> = ({ method, total, orderRef, onCopyHandle, copied }) => {
  const Icon = method.icon;
  return (
    <div className="p-6 rounded-2xl bg-brand-paper border border-brand-border shadow-sm space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-brand-canvas border border-brand-border flex items-center justify-center text-brand-ink">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display text-base font-bold text-brand-ink">Payment via {method.label}</div>
            <div className="text-[11px] font-sans text-brand-steel">{method.tagline}</div>
          </div>
        </div>
        {method.discountRate > 0 && (
          <span className="px-2.5 py-1 rounded-md bg-brand-canvas border border-brand-border text-brand-mineral font-sans text-[11px] font-bold">
            {Math.round(method.discountRate * 100)}% DISCOUNT APPLIED
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs font-sans">
        <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-border">
          <span className="text-brand-steel block text-[10px] uppercase font-medium">Amount Due</span>
          <span className="text-brand-ink font-mono text-lg font-bold"></span>
        </div>
        <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-border">
          <span className="text-brand-steel block text-[10px] uppercase font-medium">Order Reference</span>
          <span className="text-brand-graphite font-mono font-bold text-sm">{orderRef}</span>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-border flex items-center justify-between text-xs font-sans">
        <div>
          <span className="text-brand-steel block text-[10px] uppercase font-medium">Send Payment To</span>
          <span className="text-brand-ink font-mono font-bold break-all">{method.handle}</span>
        </div>
        {onCopyHandle && !method.link && (
          <button onClick={onCopyHandle} className="flex items-center space-x-1 text-brand-steel hover:text-brand-ink font-medium px-2.5 py-1 rounded bg-brand-paper border border-brand-border shadow-2xs">
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
      </div>

      {method.link && (
        <a
          href={method.link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-graphite text-brand-paper font-display font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-xs"
        >
          <span>Open Secure {method.label} Link</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}

      <ol className="space-y-1.5 text-xs text-brand-steel font-normal list-decimal list-inside bg-brand-canvas/70 p-3.5 rounded-xl border border-brand-border/60">
        {method.steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  );
};
