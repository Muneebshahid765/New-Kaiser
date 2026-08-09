import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Layers, X } from 'lucide-react';

interface CategoryImage {
  path?: string;
  url?: string;
}

interface Category {
  _id?: string;
  name: string;
  slug?: string;
  status?: string;
  image?: CategoryImage | string;
  productCount?: number;
  count?: number;
}

interface CategoryMegaDropdownProps {
  categories?: Category[];
  isOpen: boolean;
  onClose: () => void;
  topOffset?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const INITIAL_VISIBLE = 9;
const LOAD_MORE_COUNT = 9;

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const getCategoryImage = (cat: Category): string | null => {
  if (!cat?.image) return null;
  
  const imgPath = 
    typeof cat.image === 'string' 
      ? cat.image 
      : cat.image?.path || cat.image?.url || null;
  
  if (!imgPath) return null;
  if (imgPath.startsWith('http')) return imgPath;
  return `${API_URL}${imgPath}`;
};

const GRADIENTS = [
  'from-[#b5976a] to-[#8a6534]',
  'from-[#00c6ff] to-[#0072ff]',
  'from-[#f472b6] to-[#a855f7]',
  'from-[#10b981] to-[#059669]',
  'from-[#f59e0b] to-[#d97706]',
  'from-[#6366f1] to-[#4338ca]',
  'from-[#ef4444] to-[#b91c1c]',
  'from-[#14b8a6] to-[#0d9488]',
];

const CategoryMegaDropdown: React.FC<CategoryMegaDropdownProps> = ({
  categories = [],
  isOpen,
  onClose,
  topOffset = 70,
  onMouseEnter,
  onMouseLeave,
}) => {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) setVisibleCount(INITIAL_VISIBLE);
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { 
      if (e.key === 'Escape') onClose(); 
    };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { 
      document.body.style.overflow = ''; 
    };
  }, [isOpen]);

  const handleCategoryClick = useCallback((category: Category) => {
    onClose();
    const slug = category.slug || encodeURIComponent(category.name);
    router.push(`/products?category=${slug}`);
  }, [router, onClose]);

  const handleViewAll = useCallback(() => {
    onClose();
    router.push('/products');
  }, [router, onClose]);

  const activeCategories = categories.filter(cat => 
    cat.status === 'active' && cat.slug !== 'uncategorized'
  );
  
  const visibleCategories = activeCategories.slice(0, visibleCount);
  const hasMore = visibleCount < activeCategories.length;
  const remaining = activeCategories.length - visibleCount;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-[9000] animate-fadeIn"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed left-0 right-0 z-[9001] bg-white px-[60px] py-[52px] pb-12 overflow-y-auto animate-slideDown"
        style={{ 
          top: `${topOffset}px`, 
          bottom: 0,
          scrollbarWidth: 'thin',
          scrollbarColor: '#e5e0d8 transparent'
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-5 z-[9002] bg-[#f5ede0] border-none w-9 h-9 rounded-full cursor-pointer flex items-center justify-center text-lg text-[#5c4a2e] hover:bg-[#e8c98a] transition-colors duration-200"
          onClick={onClose}
          aria-label="Close categories"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-end justify-between mb-9 border-b border-[#f0e8dc] pb-5">
          <div>
            <h2 className="font-serif text-[28px] font-semibold text-[#1a1208] tracking-wide m-0">
              Browse Categories
            </h2>
            <p className="font-sans text-[13px] text-[#9c8e7e] mt-1 tracking-[0.3px]">
              {activeCategories.length} categories · Find what you need
            </p>
          </div>
          <button
            className="font-sans text-[13px] font-medium text-[#b5976a] bg-none border border-[#e8c98a] px-5 py-2 rounded-full cursor-pointer flex items-center gap-1.5 transition-all duration-200 hover:bg-[#b5976a] hover:text-white hover:border-[#b5976a] whitespace-nowrap"
            onClick={handleViewAll}
          >
            View All Products
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-6 gap-y-6">
          {visibleCategories.map((cat, index) => {
            const id = cat._id || cat.name || String(index);
            const name = cat.name || '';
            const imgSrc = getCategoryImage(cat);
            const count = cat.productCount ?? cat.count ?? null;
            const initial = name.charAt(0).toUpperCase();
            const gradient = GRADIENTS[index % GRADIENTS.length];
            const delay = `${(index % LOAD_MORE_COUNT) * 0.04}s`;

            return (
              <div
                key={id}
                className="flex flex-col items-center gap-3 cursor-pointer p-1.5 rounded-2xl transition-transform duration-200 hover:-translate-y-1.5 hover:scale-105 animate-cardIn"
                style={{ animationDelay: delay }}
                onClick={() => handleCategoryClick(cat)}
                onMouseEnter={() => setHoveredId(id)}
                onMouseLeave={() => setHoveredId(null)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick(cat)}
                aria-label={`Browse ${name}`}
              >
                <div className="relative w-[90px] h-[90px] rounded-full overflow-hidden flex-shrink-0 shadow-md border-[2.5px] border-transparent transition-all duration-200 hover:border-[#b5976a] hover:shadow-[0_6px_24px_rgba(181,151,106,0.35)]">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={name}
                      loading="lazy"
                      className="w-full h-full object-cover block"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full flex items-center justify-center font-serif text-[26px] font-semibold text-white bg-gradient-to-br ${gradient}`}
                    style={{ display: imgSrc ? 'none' : 'flex' }}
                  >
                    {initial}
                  </div>
                  {count !== null && (
                    <span className="absolute bottom-1 right-2.5 bg-[#1a1208] text-[#e8c98a] font-sans text-[9px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap border-[1.5px] border-white leading-[1.4]">
                      {count} {count === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </div>
                <span className="font-sans text-xs font-medium text-[#2c2016] text-center leading-[1.35] max-w-[90px] break-words transition-colors duration-200 hover:text-[#b5976a]">
                  {name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="mt-9 flex items-center justify-center gap-4">
            <button
              className="font-sans text-[13px] font-medium text-[#5c4a2e] bg-[#faf5ee] border border-[#e8c98a] px-7 py-2.5 rounded-full cursor-pointer flex items-center gap-2 transition-all duration-200 hover:bg-[#f0e0c0] hover:border-[#b5976a]"
              onClick={() => setVisibleCount((v) => v + LOAD_MORE_COUNT)}
            >
              <Layers size={14} />
              Load More
            </button>
            <div className="w-[2px] h-[18px] bg-[#e8c98a] rounded-full opacity-50" />
            <span className="font-sans text-xs text-[#9c8e7e]">
              {remaining} more {remaining === 1 ? 'category' : 'categories'}
            </span>
          </div>
        )}
      </div>

      {/* Tailwind animations - add to global CSS or use tailwind.config */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-slideDown {
          animation: slideDown 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-cardIn {
          animation: cardIn 0.35s ease both;
        }
        .font-serif {
          font-family: 'Cormorant Garamond', serif;
        }
        .font-sans {
          font-family: 'DM Sans', sans-serif;
        }
        /* Scrollbar styling */
        .cmdd-panel::-webkit-scrollbar {
          width: 6px;
        }
        .cmdd-panel::-webkit-scrollbar-track {
          background: transparent;
        }
        .cmdd-panel::-webkit-scrollbar-thumb {
          background: #e5e0d8;
          border-radius: 99px;
        }
      `}</style>
    </>
  );
};

export default CategoryMegaDropdown;