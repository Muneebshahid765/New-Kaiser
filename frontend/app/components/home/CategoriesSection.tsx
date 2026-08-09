'use client';

import React, { RefObject } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FeaturedCategoryItem } from '@/app/features/categories/types/category-reponse.types';
import { AppImage } from '@/app/components/ui/AppImage'; // AppImage component import path check kar lein

interface CategoriesSectionProps {
  categoriesRef: RefObject<HTMLElement | null>;
  categoriesInView: boolean;
  categories: FeaturedCategoryItem[];
  isLoading: boolean;
  error: string | null;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  categoriesRef,
  categoriesInView,
  categories,
  isLoading,
  error,
}) => {
  const router = useRouter();

  return (
    <section
      ref={categoriesRef}
      className="py-16 md:py-24 px-4 md:px-12 bg-gradient-to-b from-amber-50/30 to-stone-100/50"
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.h2
          className="text-3xl md:text-4xl font-semibold text-stone-800 text-center mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={categoriesInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Product Categories
        </motion.h2>

        <motion.p
          className="text-base md:text-lg text-stone-600 text-center max-w-3xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={categoriesInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Explore our comprehensive range of electrical and building materials,
          carefully selected to meet the highest quality standards for African markets.
        </motion.p>

        {/* States */}
        {isLoading && (
          <div className="text-center text-stone-500 py-8">Loading categories...</div>
        )}
        {!isLoading && error && (
          <div className="text-center text-red-600 py-8">{error}. Please try again later.</div>
        )}

        {/* List */}
        {!isLoading && !error && (
          <motion.div
            className="flex flex-col gap-6 mb-10"
            initial="hidden"
            animate={categoriesInView ? 'visible' : 'hidden'}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15, delayChildren: 0.4 },
              },
            }}
          >
            {categories.length === 0 ? (
              <div className="text-center text-stone-500 py-8">
                Categories are not available right now. Please check back later.
              </div>
            ) : (
              categories.map((category) => (
                <motion.div
                  key={category.id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-amber-800/15 flex flex-col md:flex-row cursor-pointer hover:shadow-xl transition-all"
                  onClick={() => router.push(`/products?category=${category.slug}`)}
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ y: -6, scale: 1.01 }}
                >
                  {/* Image Container using AppImage */}
                  <div className="w-full md:w-2/5 h-48 md:h-56 flex items-center justify-center p-4 bg-white overflow-hidden">
                    <AppImage
                      src={category.image?.path ?? null}
                      alt={category.name}
                      width={300}
                      height={200}
                      iconSize={36}
                      className="w-full h-full object-contain transition-transform duration-300 rounded-lg"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 md:p-10">
                    <h3 className="text-xl md:text-2xl font-semibold text-stone-800 mb-2">
                      {category.name}
                    </h3>
                    <span className="inline-flex items-center gap-2 bg-amber-100/60 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                      {category.productCount} {category.productCount === 1 ? 'Item' : 'Items'}
                    </span>
                    <p className="text-stone-600 leading-relaxed mb-4">
                      {category.description ||
                        `Premium ${category.name.toLowerCase()} curated for African markets.`}
                    </p>
                    <button className="text-amber-700 font-semibold hover:translate-x-1 transition-transform">
                      Explore Category →
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* CTA */}
        <motion.button
          className="block mx-auto px-10 py-3.5 bg-gradient-to-br from-amber-600 to-amber-800 text-white font-semibold rounded-full shadow-lg shadow-amber-800/30 hover:shadow-xl transition-all"
          onClick={() => router.push('/products')}
          initial={{ opacity: 0, y: 20 }}
          animate={categoriesInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.98 }}
        >
          View All Categories
        </motion.button>
      </div>
    </section>
  );
};