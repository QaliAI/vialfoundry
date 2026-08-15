import React, { useState } from 'react';
import { ShieldCheck, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    const value = email;
    setEmail('');
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, source: 'footer_form' }),
      });
    } catch {
      /* optimistic UI — subscription is best-effort */
    }
  };

  return (
    <footer className="bg-slate-950 border-t border-white/10 text-slate-400 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Email Capture & Brand Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-white/10 items-center">
          
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/15 flex items-center justify-center">
                <div className="w-3 h-3 rounded-sm bg-cyan-400" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                VIAL <span className="text-cyan-400 font-light">FOUNDRY</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-light max-w-md">
              Precision-built research materials supported by batch documentation, HPLC identity verification, and independent analytical testing.
            </p>
          </div>

          <div className="lg:col-span-6 space-y-2">
            <h4 className="font-display text-sm font-bold text-white">
              Get new batch and documentation updates.
            </h4>
            <p className="text-xs text-slate-400 font-light">
              Receive lot availability, testing notifications, and analytical documentation releases.
            </p>

            {subscribed ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thank you. You are subscribed to Vial Foundry batch updates.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter institution email..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-display font-bold text-xs hover:bg-cyan-400 transition-all flex items-center space-x-1"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Links Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <h5 className="mono-tag text-xs font-semibold text-white uppercase tracking-wider">Catalog & Products</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/catalog')} className="hover:text-cyan-300">All Materials</button></li>
              <li><button onClick={() => navigate('/catalog')} className="hover:text-cyan-300">Reference Standards</button></li>
              <li><button onClick={() => navigate('/catalog')} className="hover:text-cyan-300">Analytical Standards</button></li>
              <li><button onClick={() => navigate('/catalog')} className="hover:text-cyan-300">Single Compounds</button></li>
              <li><button onClick={() => navigate('/catalog')} className="hover:text-cyan-300">Lab Supplies</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="mono-tag text-xs font-semibold text-white uppercase tracking-wider">Quality & Verification</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/verify')} className="hover:text-cyan-300 text-emerald-400 font-bold">Batch Verification Engine</button></li>
              <li><button onClick={() => navigate('/quality')} className="hover:text-cyan-300">The Foundry Standard</button></li>
              <li><button onClick={() => navigate('/quality')} className="hover:text-cyan-300">HPLC & LC-MS Protocols</button></li>
              <li><button onClick={() => navigate('/resources')} className="hover:text-cyan-300">COA Reader Library</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="mono-tag text-xs font-semibold text-white uppercase tracking-wider">Company</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/about')} className="hover:text-cyan-300">About Vial Foundry</button></li>
              <li><button onClick={() => navigate('/contact')} className="hover:text-cyan-300">Contact Support</button></li>
              <li><button onClick={() => navigate('/resources')} className="hover:text-cyan-300">Research Articles</button></li>
              <li><button onClick={() => navigate('/contact')} className="hover:text-cyan-300">Institutional Procurement</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="mono-tag text-xs font-semibold text-white uppercase tracking-wider">Policies & Legal</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/legal/ruo-disclaimer')} className="hover:text-cyan-300">Research Use Only Policy</button></li>
              <li><button onClick={() => navigate('/legal/shipping')} className="hover:text-cyan-300">Shipping & Cold Storage</button></li>
              <li><button onClick={() => navigate('/legal/refunds')} className="hover:text-cyan-300">Returns & Replacement</button></li>
              <li><button onClick={() => navigate('/legal/privacy')} className="hover:text-cyan-300">Privacy & Data Security</button></li>
              <li><button onClick={() => navigate('/legal/terms')} className="hover:text-cyan-300">Terms of Service</button></li>
              <li><button onClick={() => navigate('/legal/acceptable-use')} className="hover:text-cyan-300">Acceptable Use</button></li>
            </ul>
          </div>

        </div>

        {/* Research Use Only Banner Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-900 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center space-x-3 text-slate-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>RESEARCH USE ONLY (RUO):</strong> All materials sold by Vial Foundry are intended exclusively for laboratory, analytical, and scientific research. Not for human, clinical, veterinary, or therapeutic application.
            </span>
          </div>
          <span className="text-slate-500 whitespace-nowrap">
            © 2026 VialFoundry.com
          </span>
        </div>

      </div>
    </footer>
  );
};
