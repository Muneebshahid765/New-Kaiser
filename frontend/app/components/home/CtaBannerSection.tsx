// components/home/CtaBannerSection.tsx
import React from 'react';
import { motion } from 'framer-motion';

const features = ['Quality Assured', 'Locally Sourced', 'Community Focused', 'Sustainable Services'];

export const CtaBannerSection: React.FC = () => {
  return (
    <section className="py-10 md:py-16 px-4 md:px-12 bg-white">
      <div className="max-w-5xl mx-auto bg-stone-900 rounded-3xl p-8 md:p-16 text-amber-50 shadow-2xl relative overflow-hidden">
        {/* Border decoration */}
        <div className="absolute inset-4 rounded-2xl border border-white/20 pointer-events-none" />

        <h2 className="text-2xl md:text-4xl font-bold text-center mb-5">
          Building Africa's Future Together
        </h2>
        <p className="text-base md:text-lg text-center max-w-3xl mx-auto leading-relaxed opacity-90 mb-10">
          From bustling cities to remote villages, from residential projects to
          industrial complexes, Africa Kaiser is committed to providing the
          materials that power progress. Join us in building a stronger, more
          connected Africa.
        </p>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm md:text-base font-medium">
              <span className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold">✓</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};