'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Phone, Zap, Search, X, ChevronDown, ChevronUp } from 'lucide-react'
import { usePublicFaqs } from '@/app/features/public/faq/faq.hooks'
import type { PublicFaqItem } from '@/app/features/public/faq/faq.response'

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────
const FaqItem = React.memo(({
  faq,
  index,
  isActive,
  onToggle,
}: {
  faq:      PublicFaqItem
  index:    number
  isActive: boolean
  onToggle: (id: string) => void
}) => (
  <div
    className={`bg-white border-[1.5px] rounded-2xl overflow-hidden shadow-[0_4px_18px_rgba(11,31,54,0.04)] transition-all duration-200 ${
      isActive
        ? 'border-[#d7b075] shadow-[0_12px_40px_rgba(215,176,117,0.2)] -translate-y-0.5'
        : 'border-[#d7b075]/20 hover:border-[#d7b075]/50 hover:shadow-[0_8px_28px_rgba(11,31,54,0.07)]'
    }`}
    style={{ animation: `fadeSlideUp 0.35s ease ${index * 0.05}s both` }}
  >
    <button
      type="button"
      onClick={() => onToggle(faq.id)}
      aria-expanded={isActive}
      className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-3 sm:gap-4 bg-transparent border-none cursor-pointer text-left"
    >
      <span className="flex-shrink-0 text-xs font-bold text-[#d7b075] tracking-[0.08em] min-w-[28px]">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="flex-1 text-sm sm:text-base font-semibold text-[#0b1f36] leading-relaxed">
        {faq.question}
      </span>
      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#fdf7f0] rounded-full text-[#d7b075]">
        {isActive ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </span>
    </button>

    <div
      className="overflow-hidden transition-[max-height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{ maxHeight: isActive ? '400px' : '0px' }}
    >
      <p className="px-4 sm:px-6 pb-4 sm:pb-6 sm:pl-[3.9rem] text-[#495166] text-sm sm:text-base leading-relaxed m-0">
        {faq.answer}
      </p>
    </div>
  </div>
))
FaqItem.displayName = 'FaqItem'

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const FaqSkeleton = () => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="h-16 bg-white border border-[#d7b075]/20 rounded-2xl animate-pulse"
      />
    ))}
  </div>
)

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FAQPage() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: faqs = [], isLoading, error } = usePublicFaqs()

  const toggle = useCallback((id: string) => {
    setActiveId(prev => (prev === id ? null : id))
  }, [])

  const clearSearch = useCallback(() => setSearchQuery(''), [])

  const filteredFaqs = useMemo<PublicFaqItem[]>(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return faqs
    return faqs.filter(
      f =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
    )
  }, [faqs, searchQuery])

  return (
    <>
      <div className="min-h-screen bg-[#faf5ed] font-manrope">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#fff8ee] via-[#f6efe3] to-[#ede4d5] pt-24 pb-20 px-4 sm:px-8 text-center border-b border-[#d7b075]/30">
          <div className="absolute w-[420px] h-[420px] bg-[#d7b075]/20 rounded-full blur-[80px] -top-[120px] -left-[100px] pointer-events-none" />
          <div className="absolute w-[320px] h-[320px] bg-[#d7b075]/15 rounded-full blur-[80px] -bottom-[80px] -right-[60px] pointer-events-none" />

          <div className="relative z-10 max-w-[680px] mx-auto">
            <p className="text-xs uppercase tracking-[0.4rem] text-[#8b6840] font-semibold mb-4">
              Help Centre
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-bold leading-tight text-[#0b1f36] mb-4">
              Frequently Asked{' '}
              <span className="text-[#d7b075] relative">
                Questions
                <span className="absolute bottom-0.5 left-0 w-full h-[3px] bg-[#d7b075] rounded-full opacity-45" />
              </span>
            </h1>
            <p className="text-[#495166] text-base sm:text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
              Clear answers for procurement leads, project managers, and finance
              controllers working with Africa Kaiser.
            </p>

            {/* Search */}
            <div className="relative max-w-[520px] mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#c9a97a] pointer-events-none" />
              <input
                type="text"
                placeholder="Search your question…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full py-4 pl-12 pr-14 rounded-full border-[1.5px] border-[#d7b075]/30 bg-white text-sm text-[#0b1f36] placeholder-[#b8a48c] shadow-[0_8px_32px_rgba(11,31,54,0.06)] outline-none transition-all focus:border-[#d7b075] focus:shadow-[0_0_0_4px_rgba(215,176,117,0.18)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#d7b075]/10 text-[#8b6840] flex items-center justify-center hover:bg-[#d7b075]/20 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── Accordion + Sidebar ───────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10 sm:py-16">
          <div className="grid lg:grid-cols-[1fr_300px] gap-8 lg:gap-10 items-start">
            {/* Accordion */}
            <div className="flex flex-col gap-3">
              {isLoading && <FaqSkeleton />}

              {!isLoading && error && (
                <div className="bg-red-50/80 border border-red-200/40 rounded-xl px-4 py-3 text-sm text-[#b91c1c]">
                  FAQs could not be loaded. Please try again in a moment.
                </div>
              )}

              {!isLoading && !error && filteredFaqs.length === 0 && (
                <div className="text-center py-12 px-8 text-[#495166] flex flex-col items-center gap-4">
                  <Search size={40} className="text-[#d7b075] opacity-50" />
                  <p className="text-sm">
                    {searchQuery
                      ? 'No FAQs match your search.'
                      : 'No FAQs available yet.'}
                  </p>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="text-xs text-[#d7b075] underline hover:opacity-70"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}

              {!isLoading &&
                !error &&
                filteredFaqs.map((faq, index) => (
                  <FaqItem
                    key={faq.id}
                    faq={faq}
                    index={index}
                    isActive={activeId === faq.id}
                    onToggle={toggle}
                  />
                ))}
            </div>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-8 bg-white border-[1.5px] border-[#d7b075]/30 rounded-2xl p-6 sm:p-8 shadow-[0_16px_48px_rgba(11,31,54,0.07)] text-center">
              <div className="w-16 h-16 mx-auto mb-4">
                <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                  <circle
                    cx="24"
                    cy="24"
                    r="23"
                    stroke="#d7b075"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M14 20c0-5.523 4.477-10 10-10s10 4.477 10 10v2c0 1.105-.895 2-2 2h-2a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1.5"
                    stroke="#d7b075"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M24 34v4M20 38h8"
                    stroke="#d7b075"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#0b1f36] mb-2">
                Still have questions?
              </h3>
              <p className="text-sm text-[#495166] leading-relaxed mb-5">
                Our team is ready to help you navigate procurement, logistics,
                and partnership questions directly.
              </p>

              {/* Fixed missing <a tag below */}
              <a
                href="mailto:support@africakaiser.com"
                className="block w-full py-3.5 px-4 bg-[#d7b075] text-white rounded-full font-bold text-sm text-center no-underline transition-all hover:bg-[#8b6840] hover:-translate-y-0.5 shadow-[0_6px_20px_rgba(215,176,117,0.4)]"
              >
                Contact Support
              </a>

              <div className="flex flex-col gap-2 mt-4">
                <span className="flex items-center justify-center gap-1.5 text-xs text-[#495166]">
                  <Phone size={14} className="text-[#00c6ff]" />
                  Mon–Fri, 8am–6pm WAT
                </span>
                <span className="flex items-center justify-center gap-1.5 text-xs text-[#495166]">
                  <Zap size={14} className="text-[#facc15]" />
                  Avg response: 2 hours
                </span>
              </div>
            </aside>
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}