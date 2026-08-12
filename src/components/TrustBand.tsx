import React from 'react';
import { FileCheck, Shield, Cpu, Lock, FlaskConical } from 'lucide-react';

export const TrustBand: React.FC = () => {
  const trustItems = [
    {
      icon: FileCheck,
      title: 'Batch-Specific Documentation',
      desc: 'Every lot tied to physical HPLC & LC-MS analytical records.'
    },
    {
      icon: Shield,
      title: 'Third-Party Independent Testing',
      desc: 'Purity and mass verified by accredited analytical laboratories.'
    },
    {
      icon: Cpu,
      title: 'Lot Level Traceability',
      desc: 'Immutable batch archives accessible through open lot search.'
    },
    {
      icon: Lock,
      title: 'Desiccated Cold Storage',
      desc: 'Stored at -20°C with nitrogen flush protection.'
    },
    {
      icon: FlaskConical,
      title: 'Strict RUO Compliance',
      desc: 'Materials synthesized solely for laboratory research.'
    }
  ];

  return (
    <section className="border-y border-white/10 bg-slate-950/60 py-8 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start space-x-3 group">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-cyan-400 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/10 transition-colors flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-light leading-snug">
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
