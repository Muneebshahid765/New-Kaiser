// components/home/BenefitsSection.tsx
import React from 'react';
import { BadgeCheck, Headset, Handshake } from 'lucide-react';

const benefits = [
  {
    icon: <BadgeCheck className="w-7 h-7 text-emerald-500" />,
    title: 'Quality Guaranteed',
    text: 'All products meet international standards with comprehensive warranties and quality certifications.',
  },
  {
    icon: <Headset className="w-7 h-7 text-indigo-500" />,
    title: 'Expert Support',
    text: 'Professional technical assistance and consultation from our experienced engineering team.',
  },
  {
    icon: <Handshake className="w-7 h-7 text-amber-500" />,
    title: 'Local Partnership',
    text: 'Deep understanding of African markets with local presence and community engagement.',
  },
];

export const BenefitsSection: React.FC = () => {
  return (
    <section className="py-12 md:py-20 px-4 md:px-12 bg-gradient-to-b from-stone-50 to-amber-50/30">
      <div className="max-w-4xl mx-auto flex flex-col gap-5">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="flex items-center gap-5 p-6 md:p-8 rounded-xl border border-amber-800/10 bg-white shadow-md hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            <div className="w-14 h-14 min-w-14 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200/40 flex items-center justify-center">
              {benefit.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-stone-800 mb-1">{benefit.title}</h3>
              <p className="text-stone-600/80 leading-relaxed">{benefit.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};