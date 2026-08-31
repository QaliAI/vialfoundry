import React from 'react';
import { ShieldCheck, FileCheck, Snowflake, Lock } from 'lucide-react';

export const TrustBand: React.FC = () => {
  const trustItems = [
    {
      icon: ShieldCheck,
      title: 'Third-Party Tested',
      desc: 'Purity and mass verified by independent analytical laboratories.'
    },
    {
      icon: FileCheck,
      title: 'Lot Documentation',
      desc: 'Every lot published with HPLC chromatograms and COA records.'
    },
    {
      icon: Snowflake,
      title: 'Cold-Chain Storage',
      desc: 'Maintained at -20°C with nitrogen seal and fast insulated dispatch.'
    },
    {
      icon: Lock,
      title: 'Direct Procurement',
      desc: 'Secure institutional order requests with direct order fulfillment.'
    }
  ];

  return (
    <section className="border-b border-slate-200/80 bg-white py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start space-x-3.5 group">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-cyan-700 flex-shrink-0 group-hover:bg-cyan-50 group-hover:border-cyan-200 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-display font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-normal leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

