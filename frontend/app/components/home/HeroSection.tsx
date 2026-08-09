// components/home/HeroSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Zap, Handshake } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const router = useRouter();

  const features = [
    { icon: <ShieldCheck className="w-7 h-7 text-emerald-500" />, title: 'Quality Guaranteed', description: 'Certified Components' },
    { icon: <Zap className="w-7 h-7 text-amber-500" />, title: 'Fast Delivery', description: 'Logistics Across Africa' },
    { icon: <Handshake className="w-7 h-7 text-indigo-500" />, title: 'Expert Support', description: 'Technical Guidance' },
  ];

  const stats = [
    { value: '10,000+', label: 'Products Available' },
    { value: '50+', label: 'African Countries Served' },
    { value: '15+', label: 'Years Experience' },
  ];

  return (
    <section className="w-full max-w-full mx-auto bg-gradient-to-br from-amber-50 via-orange-50 to-stone-200 px-4 sm:px-6 lg:px-12 py-8 md:py-16 relative overflow-hidden">
      <div className="w-full max-w-6xl mx-auto">
        <div className="relative px-4 md:px-12 py-8 md:py-20">
          {/* Glow effect */}
          <div className="absolute -top-5 -left-5 w-3/5 h-3/5 bg-gradient-radial from-amber-200/60 to-transparent pointer-events-none blur-2xl" />

          <div className="relative max-w-3xl mx-auto text-center text-stone-900">
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight tracking-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Premium Electrical &amp; Building Materials for <span className="text-amber-700 font-bold">Africa</span>
            </motion.h1>

            <motion.p
              className="text-base md:text-lg text-stone-700/85 leading-relaxed mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Empowering African infrastructure with quality electrical components,
              building materials, and expert solutions. Your trusted partner for
              construction excellence.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4 justify-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              <motion.button
                className="px-7 py-3.5 bg-gradient-to-br from-amber-600 to-amber-800 text-amber-50 font-semibold rounded-full shadow-lg shadow-amber-800/30 hover:shadow-xl transition-all"
                onClick={() => router.push('/products')}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Shop Now
              </motion.button>
              <motion.button
                className="px-7 py-3.5 bg-transparent text-stone-700 font-semibold rounded-full border border-amber-700/40 hover:bg-stone-100/50 transition-all"
                onClick={() => router.push('/about')}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                View Catalog
              </motion.button>
            </motion.div>

            {/* Feature Strip */}
            <motion.div
              className="flex flex-wrap justify-center gap-6 md:gap-12 mt-12"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15, delayChildren: 0.8 },
                },
              }}
            >
              {features.map((item) => (
                <motion.div
                  key={item.title}
                  className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-amber-800/10 shadow-md flex flex-col items-center gap-1.5 min-w-[140px]"
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ y: -6, scale: 1.02 }}
                >
                  <div className="text-2xl">{item.icon}</div>
                  <h4 className="text-base font-medium text-stone-800">{item.title}</h4>
                  <p className="text-sm text-stone-600/70">{item.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              className="mt-14 px-6 py-5 flex flex-wrap justify-center gap-8 md:gap-16 bg-white/85 backdrop-blur-sm rounded-full border border-amber-800/30 shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl md:text-3xl font-bold text-amber-700">{stat.value}</div>
                  <div className="text-sm text-stone-600/70">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};