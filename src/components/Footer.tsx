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
      /* optimistic UI */
    }
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Email Capture & Brand Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-800 items-start">
          
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                <div className="w-3.5 h-3.5 rounded-[2px] bg-cyan-400" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                VIAL <span className="text-cyan-400 font-normal">FOUNDRY</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 font-normal max-w-md leading-relaxed">
              Precision-built research materials supported by batch documentation, HPLC identity verification, and independent analytical testing.
            </p>
          </div>

          <div className="lg:col-span-6 space-y-3">
            <h4 className="font-display text-sm font-bold text-white">
              Stay informed on batch releases & analytical documentation.
            </h4>
            <p className="text-xs text-slate-400">
              Receive lot availability, independent test reports, and research publication notices.
            </p>

            {subscribed ? (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thank you. You are subscribed to Vial Foundry batch updates.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center space-x-2 max-w-md">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter institutional email..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-sm transition-all flex items-center space-x-1.5 font-display"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Links Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          
          <div className="space-y-3">
            <h5 className="font-mono text-xs font-semibold text-slate-200 uppercase tracking-wider">Shop Catalog</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/catalog')} className="text-slate-400 hover:text-white transition-colors">All Research Materials</button></li>
              <li><button onClick={() => navigate('/catalog')} className="text-slate-400 hover:text-white transition-colors">Reference Standards</button></li>
              <li><button onClick={() => navigate('/catalog')} className="text-slate-400 hover:text-white transition-colors">Analytical Standards</button></li>
              <li><button onClick={() => navigate('/catalog')} className="text-slate-400 hover:text-white transition-colors">Single Compounds</button></li>
              <li><button onClick={() => navigate('/catalog')} className="text-slate-400 hover:text-white transition-colors">Laboratory Supplies</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-mono text-xs font-semibold text-slate-200 uppercase tracking-wider">Quality & Testing</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/verify')} className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">Batch Verification Portal</button></li>
              <li><button onClick={() => navigate('/quality')} className="text-slate-400 hover:text-white transition-colors">The Foundry Standard</button></li>
              <li><button onClick={() => navigate('/quality')} className="text-slate-400 hover:text-white transition-colors">HPLC & LC-MS Testing</button></li>
              <li><button onClick={() => navigate('/resources')} className="text-slate-400 hover:text-white transition-colors">COA Library Guide</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-mono text-xs font-semibold text-slate-200 uppercase tracking-wider">Company</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/about')} className="text-slate-400 hover:text-white transition-colors">About Vial Foundry</button></li>
              <li><button onClick={() => navigate('/contact')} className="text-slate-400 hover:text-white transition-colors">Contact Support</button></li>
              <li><button onClick={() => navigate('/resources')} className="text-slate-400 hover:text-white transition-colors">Research Guides</button></li>
              <li><button onClick={() => navigate('/affiliates')} className="text-cyan-400 hover:text-cyan-300 transition-colors">Affiliate Program</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-mono text-xs font-semibold text-slate-200 uppercase tracking-wider">Support</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/contact')} className="text-slate-400 hover:text-white transition-colors">Institutional Procurement</button></li>
              <li><button onClick={() => navigate('/legal/shipping')} className="text-slate-400 hover:text-white transition-colors">Shipping & Cold Storage</button></li>
              <li><button onClick={() => navigate('/legal/refunds')} className="text-slate-400 hover:text-white transition-colors">Return Policy</button></li>
              <li><button onClick={() => navigate('/contact')} className="text-slate-400 hover:text-white transition-colors">Bulk Quote Inquiries</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-mono text-xs font-semibold text-slate-200 uppercase tracking-wider">Policies & Legal</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/legal/ruo-disclaimer')} className="text-slate-400 hover:text-white transition-colors">Research Use Only (RUO)</button></li>
              <li><button onClick={() => navigate('/legal/privacy')} className="text-slate-400 hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => navigate('/legal/terms')} className="text-slate-400 hover:text-white transition-colors">Terms of Service</button></li>
              <li><button onClick={() => navigate('/legal/acceptable-use')} className="text-slate-400 hover:text-white transition-colors">Acceptable Use</button></li>
            </ul>
          </div>

        </div>

        {/* Research Use Only Banner Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center space-x-3 text-slate-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="leading-relaxed">
              <strong>FOR RESEARCH USE ONLY (RUO):</strong> All products sold by Vial Foundry are intended strictly for laboratory and analytical research purposes. Not for human, clinical, veterinary, or therapeutic use.
            </span>
          </div>
          <span className="text-slate-500 whitespace-nowrap text-[11px]">
            &copy; {new Date().getFullYear()} VialFoundry.com
          </span>
        </div>

      </div>
    </footer>
  );
};

