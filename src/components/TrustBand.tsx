import React from 'react';
import { ShieldCheck, FileCheck, Snowflake, Lock } from 'lucide-react';

export const TrustBand: React.FC = () => {
  const trustItems = [
    {
      icon: ShieldCheck,
      title: 'Documentation Status, Stated',
      desc: 'Every lot says whether a certificate is on file — including when one is not.'
    },
    {
      icon: FileCheck,
      title: 'Lot Documentation',
      desc: 'Where a certificate is on file, you can read the issuing lab’s own document.'
    },
    {
      icon: Snowflake,
      title: 'Cold Storage Handling',
      desc: 'Stored under desiccated conditions with insulated packaging.'
    },
    {
      icon: Lock,
      title: 'Direct Sourcing',
      desc: 'Institutional orders and reference compounds supplied direct.'
    }
  ];

  return (
    <section className="border-b border-brand-border bg-brand-paper py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start space-x-3.5 group">
                <div className="p-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-graphite flex-shrink-0 group-hover:border-brand-border-strong transition-colors">
                  <Icon className="w-5 h-5 text-brand-accent" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-display font-bold text-brand-ink leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-brand-steel font-normal leading-relaxed">
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
