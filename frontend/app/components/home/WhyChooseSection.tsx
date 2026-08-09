// components/home/WhyChooseSection.tsx
import React, { RefObject } from 'react';
import { motion } from 'framer-motion';

interface WhyChooseSectionProps {
  whyChooseRef: RefObject<HTMLElement | null>;
  whyChooseInView: boolean;
}

const stats = [
  { value: '10,000+', title: 'Products Available', desc: 'Comprehensive electrical and building materials inventory' },
  { value: '50+', title: 'Years Experience', desc: 'Decades of expertise in African markets' },
  { value: '25', title: 'Countries Served', desc: 'Expanding across the African continent' },
  { value: '99%', title: 'Customer Satisfaction', desc: 'Trusted by professionals and businesses' },
];

export const WhyChooseSection: React.FC<WhyChooseSectionProps> = ({ whyChooseRef, whyChooseInView }) => {
  return (
    <section ref={whyChooseRef} className="py-16 md:py-24 px-4 md:px-12 bg-gradient-to-br from-stone-50 to-amber-50/40">
      <div className="max-w-6xl mx-auto text-center text-stone-800">
        <motion.h2
          className="text-3xl md:text-4xl font-semibold mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={whyChooseInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Why Choose Africa Kaiser
        </motion.h2>

        <motion.p
          className="text-base md:text-lg text-stone-600 max-w-3xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={whyChooseInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Leading the way in electrical and building materials across Africa with
          unmatched quality, expertise, and commitment to excellence.
        </motion.p>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          animate={whyChooseInView ? 'visible' : 'hidden'}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.12, delayChildren: 0.4 },
            },
          }}
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.title}
              className="bg-white rounded-2xl p-8 border border-amber-800/10 shadow-md text-center hover:shadow-xl transition-all"
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 },
              }}
              whileHover={{ y: -6, scale: 1.03 }}
            >
              <div className="text-3xl md:text-4xl font-bold text-amber-700 mb-2">{stat.value}</div>
              <div className="text-lg font-semibold text-stone-800 mb-1">{stat.title}</div>
              <p className="text-sm text-stone-600/70">{stat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};