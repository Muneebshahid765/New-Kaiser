// components/home/AboutSection.tsx
import React, { RefObject } from 'react';
import { motion } from 'framer-motion';

interface AboutSectionProps {
  aboutRef: RefObject<HTMLElement | null>;
  aboutInView: boolean;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ aboutRef, aboutInView }) => {
  return (
    <section ref={aboutRef} className="py-16 md:py-24 px-4 md:px-12 bg-gradient-to-b from-stone-50 to-amber-50/60 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -top-24 -left-16 w-80 h-80 rounded-full bg-amber-700/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-amber-700/10 blur-3xl" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.h2
          className="text-3xl md:text-4xl font-semibold text-stone-800 mb-4 inline-block relative"
          initial={{ opacity: 0, y: 30 }}
          animate={aboutInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          About Africa Kaiser
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-amber-600 rounded-full" />
        </motion.h2>

        <motion.p
          className="text-base md:text-lg text-stone-600 max-w-3xl mx-auto mt-8 mb-14 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={aboutInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Empowering Africa's growth through quality electrical and building
          materials, connecting communities with reliable solutions for a brighter
          future.
        </motion.p>

        <div className="flex flex-col gap-6">
          <motion.div
            className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-amber-800/10 flex flex-col md:flex-row items-start md:items-center gap-6 text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={aboutInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            whileHover={{ y: -8, scale: 1.01 }}
          >
            <div className="w-16 h-16 min-w-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-lg shadow-amber-800/30">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-stone-800 mb-2">Our Mission</h3>
              <p className="text-stone-600 leading-relaxed">
                To be Africa's leading supplier of premium electrical and building
                materials, fostering sustainable development across the continent. We
                believe in empowering local communities through access to quality
                products that build lasting infrastructure and create opportunities
                for growth.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-amber-800/10 flex flex-col md:flex-row-reverse items-start md:items-center gap-6 text-left"
            initial={{ opacity: 0, x: 50 }}
            animate={aboutInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.6 }}
            whileHover={{ y: -8, scale: 1.01 }}
          >
            <div className="w-16 h-16 min-w-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-lg shadow-amber-800/30">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-stone-800 mb-2">African Heritage</h3>
              <p className="text-stone-600 leading-relaxed">
                Rooted in African values of ubuntu and community, we understand the
                unique challenges and opportunities across our diverse continent. Our
                deep local knowledge combined with international quality standards
                ensures that every product we offer is perfectly suited for African
                conditions and requirements.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};