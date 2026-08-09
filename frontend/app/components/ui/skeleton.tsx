import * as React from "react"
import { cn } from "@/lib/utils"

// 1. Base Skeleton Element (Tailwind Dark-Mode & Theme Ready)
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-xl bg-stone-200/80 dark:bg-stone-800/80",
        className
      )}
      {...props}
    />
  )
}

// 2. Reusable Layout-Specific Skeletons for Any Page Component

/**
 * Standard Card Skeleton (Product Card, Feature Box, Media Box)
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-5 border border-stone-200/80 dark:border-stone-800 rounded-2xl bg-white dark:bg-stone-900 space-y-4", className)}>
      <Skeleton className="h-44 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Dashboard Stats Card Skeleton (Revenue, Analytics, Counters)
 */
export function SkeletonStatsCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800 rounded-2xl bg-white dark:bg-stone-900 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="size-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-36" />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-4 w-12 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

/**
 * Table Rows Skeleton (Product List, User List, Invoices)
 */
export function SkeletonTable({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("w-full border border-stone-200/80 dark:border-stone-800 rounded-2xl bg-white dark:bg-stone-900 overflow-hidden", className)}>
      {/* Table Header */}
      <div className="flex items-center justify-between p-4 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-stone-100 dark:divide-stone-800/60">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="size-10 rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1 max-w-sm">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
            <Skeleton className="h-4 w-20 hidden sm:block" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * List / Feed Item Skeleton (Activity Feed, Notifications, Comments)
 */
export function SkeletonList({ items = 4, className }: { items?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3.5 p-3.5 border border-stone-200/60 dark:border-stone-800/60 rounded-xl bg-white dark:bg-stone-900">
          <Skeleton className="size-10 rounded-full shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <Skeleton className="h-3 w-12 shrink-0" />
        </div>
      ))}
    </div>
  )
}

/**
 * Form / Detail Page Skeleton (Settings, Profile Edit, Add Product)
 */
export function SkeletonForm({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6 p-6 border border-stone-200/80 dark:border-stone-800 rounded-2xl bg-white dark:bg-stone-900", className)}>
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  )
}

export { Skeleton }