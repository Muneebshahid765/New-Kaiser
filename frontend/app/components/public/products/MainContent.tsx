'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { useSearchParams, useRouter }             from 'next/navigation'
import { PackageSearch, RefreshCcw }              from 'lucide-react'
import { usePublicProducts }                            from '@/app/features/products/hooks/public-product.hooks'
import { useCategoryDropdown }                    from '@/app/features/categories/hooks/category.hooks'
import type { GetProductsFilterParams }           from '@/app/features/products/types/product-response.types'
import SearchBar                                  from './SearchBar'
import ProductGrid                                from './ProductGrid'
import FilterPanel                                from './FilterPanel'
import ActiveFilters                              from './ActiveFilters'

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_SORT = '-totalReviews -averageRating -createdAt'
const LIMIT        = 25

// ─── Types ────────────────────────────────────────────────────────────────────
interface FilterState {
  page:        number
  category:    string
  search:      string
  minPrice:    string
  maxPrice:    string
  sort:        string
  stockFilter: string
  onSale:      string   // '' | 'true'
  minRating:   string
}

const DEFAULT_FILTERS: FilterState = {
  page: 1, category: '', search: '', minPrice: '', maxPrice: '',
  sort: DEFAULT_SORT, stockFilter: '', onSale: '', minRating: '',
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const ProductGridSkeleton = ({ count = 12 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="rounded-[28px] bg-gradient-to-b from-white to-[#fff8ef] border border-[#b5976a]/20 h-[400px] animate-pulse"
        aria-hidden
      />
    ))}
  </div>
)

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  // ── State: initialized from URL once ──────────────────────────────────────
  const [filters, setFilters] = useState<FilterState>(() => ({
    page:        Math.max(1, Number(searchParams.get('page') || 1)),
    category:    searchParams.get('category')    ?? '',
    search:      searchParams.get('search')      ?? '',
    minPrice:    searchParams.get('minPrice')    ?? '',
    maxPrice:    searchParams.get('maxPrice')    ?? '',
    sort:        searchParams.get('sort')        ?? DEFAULT_SORT,
    stockFilter: searchParams.get('stockFilter') ?? '',
    onSale:      searchParams.get('onSale')      ?? '',
    minRating:   searchParams.get('minRating')   ?? '',
  }))

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  // ── React Query ───────────────────────────────────────────────────────────
  const queryParams = useMemo<GetProductsFilterParams>(() => ({
    page:  filters.page,
    limit: LIMIT,
    ...(filters.category    && { category:    filters.category    }),
    ...(filters.search      && { search:      filters.search      }),
    ...(filters.minPrice    && { minPrice:    filters.minPrice    }),
    ...(filters.maxPrice    && { maxPrice:    filters.maxPrice    }),
    ...(filters.sort        && { sort:        filters.sort        }),
    ...(filters.stockFilter && { stockFilter: filters.stockFilter }),
    ...(filters.onSale      && { onSale:      filters.onSale      }),
    ...(filters.minRating   && { minRating:   filters.minRating   }),
  }), [filters])

  const {
    data,
    isLoading,
    error,
  } = usePublicProducts(queryParams)

  const {
    data:      categoryDropdown  = [],
    isLoading: categoriesLoading,
    error:     categoriesError,
  } = useCategoryDropdown()

  const products   = data?.products   ?? []
  const pagination = data?.pagination

  
const updateFilters = useCallback((updates: Partial<FilterState>) => {
  setFilters(prev => {
    const next = { ...prev, ...updates }

    const params = new URLSearchParams()
    if (next.category)                   params.set('category',    next.category)
    if (next.search)                     params.set('search',      next.search)
    if (next.minPrice)                   params.set('minPrice',    next.minPrice)
    if (next.maxPrice)                   params.set('maxPrice',    next.maxPrice)
    if (next.sort !== DEFAULT_SORT)      params.set('sort',        next.sort)
    if (next.stockFilter)                params.set('stockFilter', next.stockFilter)
    if (next.onSale === 'true')          params.set('onSale',      'true')
    if (next.minRating)                  params.set('minRating',   next.minRating)
    if (next.page > 1)                   params.set('page',        String(next.page))

    const newUrl = `/products${params.size ? `?${params}` : ''}`

    
    queueMicrotask(() => {
      router.replace(newUrl, { scroll: false })
    })

    return next
  })
}, [router])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearch = useCallback((term: string) =>
    updateFilters({ search: term, page: 1 }), [updateFilters])

  const handlePageChange = useCallback((page: number) => {
    updateFilters({ page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [updateFilters])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    router.replace('/products', { scroll: false })
  }, [router])

  const clearFilter = useCallback((type: string) => {
    const map: Record<string, Partial<FilterState>> = {
      search:      { search:      ''            },
      category:    { category:    ''            },
      priceRange:  { minPrice:    '', maxPrice: '' },
      sort:        { sort:        DEFAULT_SORT  },
      stockFilter: { stockFilter: ''            },
      onSale:      { onSale:      ''            },
      minRating:   { minRating:   ''            },
    }
    if (map[type]) updateFilters({ ...map[type], page: 1 })
  }, [updateFilters])

  // ── Derived ───────────────────────────────────────────────────────────────
  const preparedCategories = useMemo(() =>
    categoryDropdown.map(c => ({ key: c.id, label: c.name, value: c.id })),
    [categoryDropdown],
  )

  const getCategoryName = useCallback((id: string) =>
    categoryDropdown.find(c => c.id === id)?.name ?? id,
    [categoryDropdown],
  )

  const activeFilterChips = useMemo(() => {
    const STOCK_LABELS: Record<string, string> = {
      instock:    'In Stock',
      outofstock: 'Out of Stock',
      lowstock:   'Low Stock',
    }
    const SORT_LABELS: Record<string, string> = {
      '-createdAt': 'Newest',
      createdAt:    'Oldest',
      '-price':     'Price ↓',
      price:        'Price ↑',
    }
    const chips: Array<{ key: string; label: string; type: string }> = []

    if (filters.search)                chips.push({ key: 'search',      label: `"${filters.search}"`,                         type: 'search'      })
    if (filters.category)              chips.push({ key: 'category',    label: getCategoryName(filters.category),              type: 'category'    })
    if (filters.minPrice || filters.maxPrice)
                                       chips.push({ key: 'priceRange',  label: `$${filters.minPrice || '0'} – $${filters.maxPrice || '∞'}`, type: 'priceRange' })
    if (filters.stockFilter)           chips.push({ key: 'stockFilter', label: STOCK_LABELS[filters.stockFilter] ?? filters.stockFilter, type: 'stockFilter' })
    if (filters.onSale === 'true')     chips.push({ key: 'onSale',      label: 'On Sale',                                     type: 'onSale'      })
    if (filters.minRating)             chips.push({ key: 'minRating',   label: `${filters.minRating}★ & above`,               type: 'minRating'   })
    if (filters.sort !== DEFAULT_SORT) chips.push({ key: 'sort',        label: SORT_LABELS[filters.sort] ?? 'Sorted',         type: 'sort'        })

    return chips
  }, [filters, getCategoryName])

  const hasActiveFilters = activeFilterChips.length > 0

  const headingText = filters.search
    ? `Results for "${filters.search}"`
    : filters.category
    ? getCategoryName(filters.category)
    : 'All Products'

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f4f0e9]">

      {/* Banner */}
      <div className="w-full h-[300px] overflow-hidden mb-10">
        <img
          src="/banner-products.webp"
          alt="Products"
          className="w-full h-full object-cover object-center"
          fetchPriority="high"
        />
      </div>

      <div className="px-4 sm:px-8 lg:px-16 pb-16">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside className="lg:w-[280px] lg:flex-shrink-0">
            <h2 className="text-2xl lg:text-[2.4rem] font-bold text-[#b5976a] mb-4">
              {headingText}
            </h2>

            <SearchBar
              onSearch={handleSearch}
              onClear={resetFilters}
              onOpenFilters={() => setIsFilterPanelOpen(true)}
              initialSearchTerm={filters.search}
            />

            {hasActiveFilters && (
              <ActiveFilters
                chips={activeFilterChips}
                onClear={clearFilter}
                onClearAll={resetFilters}
              />
            )}

            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#b5976a]/50 to-transparent my-5" />
          </aside>

          {/* ── Main ────────────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">

            {isLoading && <ProductGridSkeleton count={12} />}

            {!isLoading && error && (
              <div className="text-center py-16">
                <h3 className="text-2xl font-bold text-[#3c2a17] mb-4">Error loading products</h3>
                <p className="text-[#6b4c25] mb-6">{error.message}</p>
                <button
                  onClick={() => updateFilters({ page: filters.page })}
                  className="px-6 py-3 bg-[#b5976a] text-white rounded-lg hover:bg-[#a1835b] transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {!isLoading && !error && products.length === 0 && (
              <div className="flex justify-center py-16">
                <div className="text-center bg-white p-10 rounded-2xl max-w-[450px] w-full shadow-sm border border-[#eee]">
                  <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#f5f5f5] flex items-center justify-center text-[#c89b3c]">
                    <PackageSearch size={48} />
                  </div>
                  <h2 className="text-2xl font-bold text-[#222] mb-2.5">No Products Found</h2>
                  <p className="text-sm text-[#777] mb-6">
                    {hasActiveFilters
                      ? 'No products match your filters. Try adjusting or clearing them.'
                      : "We couldn't find anything. Try different keywords."}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="inline-flex items-center gap-2 bg-[#c89b3c] text-white px-5 py-2.5 rounded-lg hover:bg-[#a67c2d] transition-colors"
                    >
                      <RefreshCcw size={18} /> Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            )}

            {!isLoading && !error && products.length > 0 && (
              <ProductGrid
                products={products}
                pagination={pagination}
                currentPage={filters.page}
                onPageChange={handlePageChange}
              />
            )}
          </main>
        </div>
      </div>

      {/* ── Filter Panel ────────────────────────────────────────────────── */}
      {isFilterPanelOpen && (
        <FilterPanel
          categories={preparedCategories}
          categoriesLoading={categoriesLoading}
          categoriesError={categoriesError?.message ?? null}
          draftFilters={{
            category:    filters.category,
            minPrice:    filters.minPrice,
            maxPrice:    filters.maxPrice,
            sort:        filters.sort,
            stockFilter: filters.stockFilter,
            onSale:      filters.onSale === 'true',   // string → boolean for FilterPanel
            minRating:   filters.minRating,
          }}
          onClose={() => setIsFilterPanelOpen(false)}
          onApply={(f) => {
            updateFilters({
              category:    f.category    ?? '',
              minPrice:    f.minPrice    ?? '',
              maxPrice:    f.maxPrice    ?? '',
              sort:        f.sort        ?? DEFAULT_SORT,
              stockFilter: f.stockFilter ?? '',
              onSale:      f.onSale ? 'true' : '',    // boolean → string for state/API
              minRating:   f.minRating   ?? '',
              page: 1,
            })
            setIsFilterPanelOpen(false)
          }}
          onReset={() => { resetFilters(); setIsFilterPanelOpen(false) }}
        />
      )}
    </div>
  )
}