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
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-slate-950 border border-white/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="font-display text-sm font-bold text-white">Pay with {method.label}</div>
            <div className="mono-tag text-[10px] uppercase tracking-widest text-slate-500">{method.tagline}</div>
          </div>
        </div>
        {method.discountRate > 0 && (
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
            {Math.round(method.discountRate * 100)}% OFF APPLIED
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div className="p-3 rounded-lg bg-slate-950 border border-white/5">
          <span className="text-slate-500 block text-[10px] uppercase">Amount to send</span>
          <span className="text-white text-base font-bold">${total.toFixed(2)}</span>
        </div>
        <div className="p-3 rounded-lg bg-slate-950 border border-white/5">
          <span className="text-slate-500 block text-[10px] uppercase">Order reference</span>
          <span className="text-cyan-400 font-bold">{orderRef}</span>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-between text-xs font-mono">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Send to</span>
          <span className="text-white break-all">{method.handle}</span>
        </div>
        {onCopyHandle && !method.link && (
          <button onClick={onCopyHandle} className="flex items-center space-x-1 text-slate-400 hover:text-white flex-shrink-0 ml-3">
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        )}
      </div>

      {method.link && (
        <a
          href={method.link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-display font-bold text-xs hover:bg-cyan-400 transition-all flex items-center justify-center space-x-2"
        >
          <span>Open secure {method.label} payment</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}

      <ol className="space-y-1.5 text-xs text-slate-400 font-light list-decimal list-inside">
        {method.steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  );
};
