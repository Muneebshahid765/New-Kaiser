'use client';

import React, { RefObject } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { FeaturedProductItem } from '@/app/features/products/types/product-response.types';
import { AppImage } from '@/app/components/ui/AppImage'; // <-- AppImage ka sahi path import karein

// ─── Types ────────────────────────────────────────────────────────────────────
interface CartPayload {
  id: string;
  _id: string;
  name: string;
  price: number;
  slug: string;
  stockQuantity: number;
  image: string;
}

interface FeaturedProductsSectionProps {
  featuredRef: RefObject<HTMLElement | null>;
  featuredInView: boolean;
  products: FeaturedProductItem[];
  isLoading: boolean;
  error: string | null;
  onAddToCart: (item: CartPayload) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const LABEL_COLOR: Record<string, string> = {
  primary:   'bg-amber-700',
  secondary: 'bg-indigo-600',
  accent:    'bg-red-600',
  purple:    'bg-purple-600',
  green:     'bg-emerald-600',
  blue:      'bg-blue-600',
  orange:    'bg-orange-600',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toUSD = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

// ─── Component ────────────────────────────────────────────────────────────────
export const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({
  featuredRef,
  featuredInView,
  products,
  isLoading,
  error,
  onAddToCart,
}) => {
  const router = useRouter();

  return (
    <section
      ref={featuredRef}
      className="py-16 md:py-24 px-4 md:px-12 bg-gradient-to-b from-amber-50/20 to-stone-100/30"
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl md:text-4xl font-semibold text-stone-800 mb-3"
            initial={{ opacity: 0, y: 30 }}
            animate={featuredInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Featured Products
          </motion.h2>
          <motion.p
            className="text-base md:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={featuredInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Discover our handpicked selection of premium electrical and building materials,
            trusted by professionals across Africa for their quality and reliability.
          </motion.p>
        </div>

        {/* States */}
        {isLoading && (
          <div className="text-center text-stone-500 py-8">Loading featured products...</div>
        )}
        {!isLoading && error && (
          <div className="text-center text-red-600 py-8">
            Unable to load featured products right now. Please try again later.
          </div>
        )}

        {/* List */}
        {!isLoading && !error && (
          <motion.div
            className="flex flex-col gap-6"
            initial="hidden"
            animate={featuredInView ? 'visible' : 'hidden'}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2, delayChildren: 0.4 },
              },
            }}
          >
            {products.length === 0 ? (
              <div className="text-center text-stone-500 py-8">
                No featured products available right now.
              </div>
            ) : (
              products.map((product) => {
                const outOfStock   = product.stockQuantity === 0;
                const isLowStock   = product.stockQuantity > 0 && product.stockQuantity <= 5;
                const displayPrice  = product.finalPrice ?? product.price;
                const rawImageUrl   = product.images?.[0]?.url ?? null;

                const ratingText =
                  product.averageRating > 0
                    ? `${Number(product.averageRating).toFixed(1)} (${product.totalReviews})`
                    : 'No reviews yet';

                const cartPayload: CartPayload = {
                  id:            product.id,
                  _id:           product.id,
                  name:          product.name,
                  price:         displayPrice,
                  slug:          product.slug,
                  stockQuantity: product.stockQuantity,
                  image:         rawImageUrl ?? '',
                };

                return (
                  <motion.div
                    key={product.id}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-amber-800/15 flex flex-col md:flex-row gap-6 hover:shadow-xl transition-all"
                    variants={{
                      hidden:  { opacity: 0, y: 60 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    whileHover={{ y: -6, scale: 1.01 }}
                  >
                    {/* ── AppImage Wrapper ────────────────────────────────────── */}
                    <div className="w-full md:w-72 flex-shrink-0 flex items-center">
                      <div className="w-full min-h-48 rounded-xl bg-white border border-amber-800/10 shadow-md flex items-center justify-center p-4 relative overflow-hidden">
                        <div className="relative w-full h-48 flex items-center justify-center">
                          <motion.div
                            whileHover={{ scale: 1.08 }}
                            className="w-full h-full flex items-center justify-center"
                            style={{ opacity: outOfStock ? 0.5 : 1 }}
                          >
                            <AppImage
                              src={rawImageUrl}
                              alt={product.name}
                              width={240}
                              height={180}
                              iconSize={32}
                              className="w-full h-full max-h-44 rounded-lg"
                            />
                          </motion.div>

                          {outOfStock && (
                            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-10">
                              <span className="bg-red-600 text-white px-4 py-1.5 rounded-full font-bold text-sm rotate-[-5deg]">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Labels */}
                        {product.labels?.length > 0 && (
                          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                            {product.labels.slice(0, 2).map((label, i) => (
                              <span
                                key={`${label.text}-${i}`}
                                className={`text-xs font-semibold text-white px-3 py-0.5 rounded-full shadow-md ${
                                  LABEL_COLOR[label.variant] ?? 'bg-amber-700'
                                }`}
                              >
                                {label.text}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Content ───────────────────────────────────────────── */}
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex flex-wrap justify-between items-center text-sm">
                        <span className="bg-amber-100/60 text-amber-800 px-3 py-0.5 rounded-full font-semibold">
                          {product.category.name}
                        </span>
                        <span className="text-stone-600/70 flex items-center gap-1">
                          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                          {ratingText}
                        </span>
                      </div>

                      <h3 className="text-xl md:text-2xl font-semibold text-stone-800">
                        {product.name}
                      </h3>

                      {product.features?.length > 0 && (
                        <div className="flex flex-wrap gap-2 text-sm text-stone-600/70">
                          {product.features.slice(0, 2).map((feat) => (
                            <span key={feat} className="bg-stone-100 px-3 py-0.5 rounded-full">
                              {feat}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-bold text-amber-700">
                          {toUSD(displayPrice)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-stone-400 line-through">
                            {toUSD(product.originalPrice)}
                          </span>
                        )}
                        {(product.discountPercentage ?? 0) > 0 && (
                          <span className="text-sm text-emerald-600 font-semibold">
                            -{product.discountPercentage}% off
                          </span>
                        )}
                      </div>

                      <div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            outOfStock
                              ? 'bg-red-100 text-red-700'
                              : isLowStock
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {outOfStock
                            ? 'Out of Stock'
                            : isLowStock
                            ? `Low Stock (${product.stockQuantity} left)`
                            : 'In Stock'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <motion.button
                          className="flex-1 min-w-[120px] px-4 py-2.5 bg-transparent border border-stone-300 text-stone-700 font-semibold rounded-full hover:bg-stone-50 transition-all"
                          onClick={() => router.push(`/product/${product.slug}`)}
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          View Details
                        </motion.button>
                        <motion.button
                          className="flex-1 min-w-[120px] px-4 py-2.5 bg-gradient-to-br from-amber-600 to-amber-800 text-amber-50 font-semibold rounded-full shadow-md shadow-amber-800/30 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => onAddToCart(cartPayload)}
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={outOfStock}
                        >
                          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
                        </motion.button>
                      </div>

                      {product.highlights?.length > 0 && (
                        <div className="flex flex-wrap gap-4 text-sm text-stone-600/70">
                          {product.highlights.slice(0, 2).map((h) => (
                            <div key={h} className="flex items-center gap-1.5">
                              <span className="text-amber-600">●</span>
                              {h}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        <motion.button
          className="block mx-auto mt-10 px-10 py-3.5 bg-gradient-to-br from-amber-600 to-amber-800 text-white font-semibold rounded-full shadow-lg shadow-amber-800/30 hover:shadow-xl transition-all"
          onClick={() => router.push('/products')}
          initial={{ opacity: 0, y: 20 }}
          animate={featuredInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.98 }}
        >
          View All Products
        </motion.button>
      </div>
    </section>
  );
};