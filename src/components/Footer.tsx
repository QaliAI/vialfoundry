import React, { useState } from 'react';
import { ShieldCheck, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { VERIFIED_BATCH_RECORDS } from '../data/verified-batch-records';

interface FooterProps {
  navigate: (path: string) => void;
}

const hasBatchDocuments = Object.keys(VERIFIED_BATCH_RECORDS).length > 0;

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
    <footer className="bg-brand-ink border-t border-brand-graphite/40 text-slate-400 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Email Capture & Brand Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-brand-graphite/40 items-start">
          
          <div className="lg:col-span-6 space-y-3">
            <BrandLogo variant="horizontal" height={34} tone="white" />
            <p className="text-sm text-slate-400 font-normal max-w-md leading-relaxed pt-2">
              Research peptides with clear product details, batch numbers and documents when we have them.
            </p>
            {/* Approved brand statement (Brand Identity &amp; Visual System board) */}
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-teal pt-2">
              Research fuels what&rsquo;s next.
            </p>
          </div>

          <div className="lg:col-span-6 space-y-3">
            <h4 className="font-display text-sm font-bold text-white">
              Get product updates
            </h4>
            <p className="text-xs text-slate-400">
              Hear about new products, batch documents and availability.
            </p>

            {subscribed ? (
              <div className="p-3 rounded-xl bg-brand-mineral/40 border border-brand-mineral text-brand-paper text-xs font-sans flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Thank you. You are subscribed to Vial Foundry updates.</span>
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
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-graphite/40 border border-brand-graphite text-white placeholder-slate-500 text-xs font-sans focus:outline-none focus:border-slate-300"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-mineral hover:bg-brand-mineral/80 text-white font-medium text-xs shadow-sm transition-all flex items-center space-x-1.5 font-display"
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
            <h5 className="font-sans text-xs font-semibold text-slate-200 uppercase tracking-wider">Shop Catalog</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/catalog')} className="text-slate-400 hover:text-white transition-colors">All Peptides</button></li>
              <li><button onClick={() => navigate('/catalog?category=Reference+Materials')} className="text-slate-400 hover:text-white transition-colors">Research Peptides</button></li>
              <li><button onClick={() => navigate('/catalog?category=Analytical+Standards')} className="text-slate-400 hover:text-white transition-colors">Peptide Standards</button></li>
              <li><button onClick={() => navigate('/catalog?category=Single+Compounds')} className="text-slate-400 hover:text-white transition-colors">Single Peptides</button></li>
              <li><button onClick={() => navigate('/catalog?category=Specialty+Materials')} className="text-slate-400 hover:text-white transition-colors">Specialty Peptides</button></li>
              <li><button onClick={() => navigate('/catalog?category=Lab+Supplies')} className="text-slate-400 hover:text-white transition-colors">Research Supplies</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-sans text-xs font-semibold text-slate-200 uppercase tracking-wider">Quality & Documents</h5>
            <ul className="space-y-2 text-xs">
              {/* Only promoted once we actually hold a certificate. The /verify
                  route stays available either way. */}
              {hasBatchDocuments && (
                <li><button onClick={() => navigate('/verify')} className="text-slate-400 hover:text-white transition-colors">Batch Documents</button></li>
              )}
              <li><button onClick={() => navigate('/quality')} className="text-slate-400 hover:text-white transition-colors">How We Handle Quality</button></li>
              <li><button onClick={() => navigate('/resources')} className="text-slate-400 hover:text-white transition-colors">How to Read a Document</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-sans text-xs font-semibold text-slate-200 uppercase tracking-wider">Company</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/about')} className="text-slate-400 hover:text-white transition-colors">About Vial Foundry</button></li>
              <li><button onClick={() => navigate('/contact')} className="text-slate-400 hover:text-white transition-colors">Contact Support</button></li>
              <li><button onClick={() => navigate('/resources')} className="text-slate-400 hover:text-white transition-colors">Research Guides</button></li>
              <li><button onClick={() => navigate('/affiliates')} className="text-slate-400 hover:text-white transition-colors">Affiliate Program</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-sans text-xs font-semibold text-slate-200 uppercase tracking-wider">Support</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/contact')} className="text-slate-400 hover:text-white transition-colors">Bulk Orders</button></li>
              <li><button onClick={() => navigate('/legal/shipping')} className="text-slate-400 hover:text-white transition-colors">Shipping & Storage</button></li>
              <li><button onClick={() => navigate('/legal/refunds')} className="text-slate-400 hover:text-white transition-colors">Return Policy</button></li>
              <li><button onClick={() => navigate('/contact')} className="text-slate-400 hover:text-white transition-colors">Bulk Pricing</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-sans text-xs font-semibold text-slate-200 uppercase tracking-wider">Policies & Legal</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/legal/ruo-disclaimer')} className="text-slate-400 hover:text-white transition-colors">Research Use Only (RUO)</button></li>
              <li><button onClick={() => navigate('/legal/privacy')} className="text-slate-400 hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => navigate('/legal/terms')} className="text-slate-400 hover:text-white transition-colors">Terms of Service</button></li>
              <li><button onClick={() => navigate('/legal/acceptable-use')} className="text-slate-400 hover:text-white transition-colors">Acceptable Use</button></li>
            </ul>
          </div>

        </div>

        {/* Research Use Only Banner Disclaimer */}
        <div className="p-4 rounded-xl bg-brand-graphite/30 border border-brand-graphite/40 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans">
          <div className="flex items-center space-x-3 text-slate-300">
            <ShieldCheck className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <span className="leading-relaxed">
              <strong>FOR RESEARCH USE ONLY:</strong> All Vial Foundry products are supplied strictly for laboratory research use. Not for human or animal consumption, and not for medical, veterinary, therapeutic or diagnostic use.
            </span>
          </div>
          <span className="text-slate-500 whitespace-nowrap text-[11px] font-mono">
            &copy; {new Date().getFullYear()} VialFoundry.com
          </span>
        </div>

      </div>
    </footer>
  );
};
