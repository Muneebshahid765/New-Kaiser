'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StatVariant = 'default' | 'tinted' | 'bordered' | 'accent-top'

export interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon | React.ReactNode
  iconColor?: string // Tailwind text color class, e.g. "text-orange-500"
  iconBgColor?: string // Tailwind bg color class, e.g. "bg-orange-50 dark:bg-orange-950/50"
  trend?: {
    value: string | number // e.g. "12.5%" or "+450"
    isPositive?: boolean | null // true = green up, false = red down, null = neutral gray
    label?: string // e.g. "vs last month"
  }
  variant?: StatVariant
  accentColor?: string // Gradient/Top line color, e.g. "from-orange-500 to-amber-500"
  className?: string
  loading?: boolean
  onClick?: () => void
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'text-orange-500 dark:text-orange-400',
  iconBgColor = 'bg-orange-50 dark:bg-orange-950/40 border-orange-100 dark:border-orange-900/40',
  trend,
  variant = 'default',
  accentColor = 'from-orange-500 via-amber-500 to-amber-700',
  className,
  loading = false,
  onClick,
}) => {
  // Render loading state skeleton
  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-stone-900 p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-24 bg-stone-200 dark:bg-stone-800 rounded-md" />
          <div className="w-10 h-10 rounded-xl bg-stone-200 dark:bg-stone-800" />
        </div>
        <div className="h-8 w-32 bg-stone-200 dark:bg-stone-800 rounded-md mb-3" />
        <div className="h-3 w-28 bg-stone-100 dark:bg-stone-800/60 rounded-md" />
      </div>
    )
  }

  const isClickable = Boolean(onClick)

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={cn(
        'group relative overflow-hidden rounded-2xl transition-all duration-200 text-left flex flex-col justify-between p-5 sm:p-6',
        // Backgrounds & Borders based on Variant
        variant === 'default' &&
          'bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-sm shadow-stone-950/5 hover:shadow-md hover:border-stone-300 dark:hover:border-stone-700',
        variant === 'tinted' &&
          'bg-stone-50/70 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800/60 shadow-none hover:bg-stone-100/80 dark:hover:bg-stone-900',
        variant === 'bordered' &&
          'bg-transparent border-2 border-stone-200 dark:border-stone-800 hover:border-orange-500/50 dark:hover:border-orange-500/50',
        variant === 'accent-top' &&
          'bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm shadow-stone-950/5 hover:shadow-md',
        isClickable && 'cursor-pointer active:scale-[0.99]',
        className,
      )}
    >
      {/* Top Accent Bar (if variant === 'accent-top') */}
      {variant === 'accent-top' && (
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r',
            accentColor,
          )}
        />
      )}

      <div>
        {/* Header: Title & Icon */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-xs sm:text-sm font-medium text-stone-500 dark:text-stone-400 tracking-wide uppercase">
            {title}
          </span>

          {Icon && (
            <div
              className={cn(
                'p-2.5 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105',
                iconBgColor,
                iconColor,
              )}
            >
              {typeof Icon === 'function' ? <Icon className="size-5" /> : Icon}
            </div>
          )}
        </div>

        {/* Main Metric Value */}
        <div className="flex items-baseline gap-2 mb-2">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {value}
          </h3>
        </div>
      </div>

      {/* Footer: Trend or Sub-description */}
      {(trend || description) && (
        <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-stone-100 dark:border-stone-800/50 text-xs mt-2">
          {trend && (
            <div
              className={cn(
                'inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-xs shrink-0',
                trend.isPositive === true &&
                  'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40',
                trend.isPositive === false &&
                  'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40',
                trend.isPositive === null &&
                  'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400',
              )}
            >
              {trend.isPositive === true && <TrendingUp className="size-3.5" />}
              {trend.isPositive === false && <TrendingDown className="size-3.5" />}
              {trend.isPositive === null && <Minus className="size-3.5" />}
              <span>{trend.value}</span>
            </div>
          )}

          <span className="text-stone-500 dark:text-stone-400 font-normal truncate">
            {trend?.label || description}
          </span>
        </div>
      )}
    </div>
  )
}