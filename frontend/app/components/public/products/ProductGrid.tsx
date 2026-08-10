'use client'

import React, { useMemo }  from 'react'
import Link                from 'next/link'
import StockBadge          from '../../cart/StockBadge'
import { AppImage }        from '@/app/components/ui/AppImage'
import type {
  FilteredProductItem,
  ProductsPagination,
} from '@/app/features/products/types/product-response.types'

interface ProductGridProps {
  products:     FilteredProductItem[]
  pagination?:  ProductsPagination
  currentPage:  number
  onPageChange: (page: number) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const Stars = ({ rating }: { rating: number }) => {
  const full  = Math.floor(rating)
  const empty = 5 - full - (rating - full >= 0.25 ? 1 : 0)
  return (
    <>
      {Array.from({ length: full  }).map((_, i) => <span key={`f${i}`} className="text-[#f7b500]">★</span>)}
      {rating - full >= 0.25 &&                      <span className="text-[#f7b500]">★</span>}
      {Array.from({ length: empty }).map((_, i) => <span key={`e${i}`} className="text-[#d1c2a6]">★</span>)}
    </>
  )
}

const getPageNumbers = (current: number, total: number): (number | '...')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const delta = 2
  const middle = Array.from(
    { length: Math.min(total - 1, current + delta) - Math.max(2, current - delta) + 1 },
    (_, i) => Math.max(2, current - delta) + i,
  )
  const result: (number | '...')[] = []
  current - delta > 2       ? result.push(1, '...') : result.push(1)
  result.push(...middle)
  current + delta < total-1 ? result.push('...', total) : result.push(total)
  return result
}

// ─── Component ────────────────────────────────────────────────────────────────
const ProductGrid: React.FC<ProductGridProps> = ({
  products, pagination, currentPage, onPageChange,
}) => {
  const placeholders = useMemo(() => {
    const rem = products.length % 5
    return rem === 0 ? 0 : 5 - rem
  }, [products.length])

  const totalPages = pagination?.totalPages ?? 1

  return (
    <div>
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
        {products.map((product) => {
          // Backend already applies discount — finalPrice is source of truth
          const displayPrice   = product.finalPrice    ?? product.price
          const hasDiscount    = product.originalPrice != null && product.originalPrice > displayPrice
          const savedAmount    = hasDiscount ? (product.originalPrice! - displayPrice).toFixed(2) : null
          const rating         = Math.min(Math.max(Number(product.averageRating ?? 0), 0), 5)
          const reviewCount    = Number(product.totalReviews ?? 0)
          const outOfStock     = product.stockQuantity === 0

          return (
            <div
              key={product.id}
              className="group relative flex flex-col gap-4 w-full p-5 rounded-[28px] bg-gradient-to-b from-white via-[#fff8ef] to-[#ffe8cc] border border-[#b5976a]/35 shadow-[0_18px_55px_rgba(31,19,3,0.12)] transition-all duration-300 hover:-translate-y-3 hover:scale-[1.01] hover:shadow-[0_25px_55px_rgba(60,42,23,0.18)] hover:border-[#b5976a]/60"
            >
              {/* ── Image ───────────────────────────────────────────────── */}
              <div className="relative w-full h-[240px] rounded-[22px] bg-[radial-gradient(circle_at_20%_20%,rgba(255,246,232,0.95)_0%,rgba(255,226,192,0.92)_55%,rgba(255,200,150,0.85)_100%)] border border-[#b5976a]/20 flex items-center justify-center p-[18px] shadow-[inset_0_15px_40px_rgba(255,255,255,0.5)] overflow-hidden">
                {savedAmount && (
                  <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white px-3 py-1.5 rounded-md text-sm font-bold shadow-[0_4px_12px_rgba(239,68,68,0.4)] animate-pulse">
                    Save ${savedAmount}
                  </div>
                )}
                {outOfStock && (
                  <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center rounded-[22px] backdrop-blur-[2px]">
                    <span className="bg-[#dc2626] text-white px-3.5 py-1.5 rounded-[30px] font-bold text-sm -rotate-3 shadow-md">
                      Out of Stock
                    </span>
                  </div>
                )}
                <AppImage
                  src={product.images[0]?.url ?? null}
                  alt={product.name}
                  width={200}
                  height={200}
                  iconSize={36}
                  className={`w-full h-full object-contain z-10 mix-blend-multiply transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1.5 group-hover:-rotate-1 ${outOfStock ? 'opacity-50' : ''}`}
                />
              </div>

              {/* ── Details ─────────────────────────────────────────────── */}
              <div className="flex flex-col flex-grow gap-2.5 px-1">
                <h2 className="text-[1.08rem] font-bold text-[#2c1a10] leading-tight line-clamp-2">
                  {product.name}
                </h2>

                <StockBadge product={product} size="sm" />

                {reviewCount > 0 && rating > 0 && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <div className="flex gap-0.5"><Stars rating={rating} /></div>
                    <span className="font-bold text-[#2c1a10]">{rating.toFixed(1)}</span>
                    <span className="text-xs text-[#6b4c25]/60">({reviewCount} reviews)</span>
                  </div>
                )}

                <div className="flex flex-col items-start gap-3 mt-auto pt-3 border-t border-[#2c1a10]/10">
                  <div className="flex flex-col gap-0.5">
                    {hasDiscount && (
                      <p className="text-sm text-[#2c1a10]/40 line-through m-0">
                        {fmt(product.originalPrice!)}
                      </p>
                    )}
                    <p className="text-[1.35rem] font-bold text-[#d03801] m-0">
                      {fmt(displayPrice)}
                    </p>
                  </div>
                  <Link
                    href={`/product/${product.slug}`}
                    className="relative inline-flex items-center justify-center gap-1.5 w-full px-5 py-2.5 rounded-full bg-gradient-to-r from-[#b57d30] via-[#f0b458] to-[#f7d28d] text-[#3b210d] font-semibold no-underline text-sm shadow-[0_12px_25px_rgba(181,125,48,0.35)] transition-all duration-300 hover:translate-x-1 group/link"
                  >
                    View Details
                    <span className="transition-transform duration-300 group-hover/link:translate-x-1">›</span>
                  </Link>
                </div>
              </div>
            </div>
          )
        })}

        {Array.from({ length: placeholders }).map((_, i) => (
          <div key={`ph-${i}`} className="invisible" aria-hidden />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 pt-5">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#b5976a] text-white hover:bg-[#a1835b] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex gap-2 order-first sm:order-none">
            {getPageNumbers(currentPage, totalPages).map((page, i) =>
              page === '...' ? (
                <span key={`d${i}`} className="px-3 py-2 text-[#b5976a] font-semibold">…</span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-[#a1835b] text-white border border-[#a1835b]'
                      : 'bg-[#f8f9fa] border border-[#dee2e6] hover:bg-[#a1835b] hover:text-white'
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#b5976a] text-white hover:bg-[#a1835b] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductGrid