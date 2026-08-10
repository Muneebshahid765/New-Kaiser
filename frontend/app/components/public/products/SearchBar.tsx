'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'

interface SearchBarProps {
  onSearch:          (term: string) => void
  onClear:           () => void
  onOpenFilters:     () => void
  initialSearchTerm: string
}

const DEBOUNCE_MS = 400

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  onOpenFilters,
  initialSearchTerm,
}) => {
  const [value,    setValue]    = useState(initialSearchTerm)
  const timerRef               = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync if parent resets (e.g. resetFilters called externally)
  useEffect(() => {
    setValue(initialSearchTerm)
  }, [initialSearchTerm])

  // Debounced search
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setValue(term)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onSearch(term.trim())
    }, DEBOUNCE_MS)
  }, [onSearch])

  // Instant search on Enter
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    if (timerRef.current) clearTimeout(timerRef.current)
    onSearch(value.trim())
  }, [onSearch, value])

  const handleClear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setValue('')
    onClear()
  }, [onClear])

  // Cleanup on unmount
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return (
    <div className="flex flex-col gap-3 mb-5">

      {/* Search Input */}
      <div className="relative flex items-center">
        <Search
          size={17}
          className="absolute left-4 text-[#b5976a] pointer-events-none shrink-0"
        />

        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
          aria-label="Search products"
          className="w-full pl-10 pr-10 py-3 rounded-2xl border border-[#b5976a]/30 bg-white/90 text-sm font-medium text-[#3c2a17] placeholder-[#3c2a17]/40 outline-none transition-all focus:border-[#b5976a] focus:shadow-[0_4px_16px_rgba(181,151,106,0.2)] hover:border-[#b5976a]/50"
        />

        {/* Clear button — only visible when there is input */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 p-1 rounded-full text-[#3c2a17]/40 hover:text-[#3c2a17] hover:bg-[#3c2a17]/10 transition-all"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Filter Button */}
      <button
        type="button"
        onClick={onOpenFilters}
        className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl border border-[#b5976a]/30 bg-white/90 text-sm font-semibold text-[#3c2a17] transition-all hover:border-[#b5976a] hover:bg-[#b5976a]/8 hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(181,151,106,0.2)] active:translate-y-0"
      >
        <SlidersHorizontal size={16} className="text-[#b5976a]" />
        Filters &amp; Sort
      </button>
    </div>
  )
}

export default SearchBar