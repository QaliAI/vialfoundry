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
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-800">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display text-base font-bold text-slate-900">Payment via {method.label}</div>
            <div className="text-[11px] font-mono text-slate-500">{method.tagline}</div>
          </div>
        </div>
        {method.discountRate > 0 && (
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[11px] font-bold">
            {Math.round(method.discountRate * 100)}% DISCOUNT APPLIED
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block text-[10px] uppercase">Amount Due</span>
          <span className="text-slate-900 text-lg font-bold">${total.toFixed(2)}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block text-[10px] uppercase">Order Reference</span>
          <span className="text-cyan-800 font-bold text-sm">{orderRef}</span>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Send Payment To</span>
          <span className="text-slate-900 font-bold break-all">{method.handle}</span>
        </div>
        {onCopyHandle && !method.link && (
          <button onClick={onCopyHandle} className="flex items-center space-x-1 text-slate-600 hover:text-slate-950 font-medium px-2.5 py-1 rounded bg-white border border-slate-200 shadow-2xs">
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
          className="w-full py-3 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-display font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-sm"
        >
          <span>Open Secure {method.label} Link</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}

      <ol className="space-y-1.5 text-xs text-slate-600 font-normal list-decimal list-inside bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
        {method.steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  );
};

