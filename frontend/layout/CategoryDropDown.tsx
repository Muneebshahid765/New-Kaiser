'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Layers, X, Grid } from 'lucide-react';
import { CategoryListItem } from '@/app/features/categories/types/category-reponse.types';

interface CategoryMegaDropdownProps {
  categories?: CategoryListItem[];
  isOpen: boolean;
  onClose: () => void;
  topOffset?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const INITIAL_VISIBLE = 10;
const LOAD_MORE_COUNT = 10;
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const getCategoryImage = (cat: CategoryListItem): string | null => {
  if (!cat.image?.path) return null;
  const imgPath = cat.image.path;
  if (imgPath.startsWith('http')) return imgPath;
  return `${API_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
};

const GRADIENTS = [
  'from-amber-600 to-yellow-800',
  'from-blue-600 to-indigo-800',
  'from-emerald-600 to-teal-800',
  'from-purple-600 to-pink-800',
  'from-rose-600 to-red-800',
];

export const CategoryMegaDropdown: React.FC<CategoryMegaDropdownProps> = ({
  categories = [],
  isOpen,
  onClose,
  topOffset = 70,
  onMouseEnter,
  onMouseLeave,
}) => {
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  useEffect(() => {
    if (isOpen) setVisibleCount(INITIAL_VISIBLE);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCategoryClick = useCallback(
    (category: CategoryListItem) => {
      onClose();
      const slug = category.slug || encodeURIComponent(category.name);
      router.push(`/products?category=${slug}`);
    },
    [router, onClose]
  );

  const activeCategories = categories.filter(
    (cat) => String(cat.status).toLowerCase() === 'active' && cat.slug !== 'uncategorized'
  );

  const visibleCategories = activeCategories.slice(0, visibleCount);
  const hasMore = visibleCount < activeCategories.length;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[990] transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Dropdown Panel */}
      <div
        className="fixed left-0 right-0 z-[991] bg-white border-b border-slate-200 shadow-2xl overflow-y-auto animate-slideDown"
        style={{ top: `${topOffset}px`, maxHeight: `calc(100vh - ${topOffset}px)` }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="max-w-7xl mx-auto p-6 sm:p-8 relative">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Grid size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 m-0 leading-tight">
                  Product Categories
                </h3>
                <p className="text-xs text-slate-500 m-0">
                  Explore over {activeCategories.length} categories
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  router.push('/products');
                }}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-amber-50 px-3.5 py-2 rounded-lg hover:bg-amber-100 transition"
              >
                View All Products <ChevronRight size={14} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {visibleCategories.map((cat, idx) => {
              const id = cat.id || String(idx);
              const imgSrc = getCategoryImage(cat);
              const gradient = GRADIENTS[idx % GRADIENTS.length];

              return (
                <div
                  key={id}
                  onClick={() => handleCategoryClick(cat)}
                  className="group flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50/40 cursor-pointer transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative bg-slate-100 border border-slate-200/60">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm`}>
                        {cat.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-slate-800 truncate group-hover:text-amber-800 transition-colors m-0">
                      {cat.name}
                    </h4>
                    {cat.productCount !== undefined && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {cat.productCount} Items
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_COUNT)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-5 py-2.5 rounded-full transition"
              >
                <Layers size={14} /> Load More Categories ({activeCategories.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};