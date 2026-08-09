import React from "react";
import { Skeleton, SkeletonStatsCard } from "@/app/components/ui/skeleton"; // Path apke project structure ke mutabiq adjust karen

export function CategoryListSkeleton() {
  return (
    <div className="min-h-screen bg-stone-50/50 dark:bg-stone-950 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* 2. Stats Grid (Reusing SkeletonStatsCard) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatsCard key={i} className="p-4" />
        ))}
      </div>

      {/* 3. Main Table Wrapper Skeleton */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800 flex gap-3">
          <Skeleton className="flex-1 h-9 rounded-lg" />
          <Skeleton className="w-32 h-9 rounded-lg" />
        </div>

        {/* Table Header Columns */}
        <div className="flex items-center gap-4 px-5 py-3 bg-stone-50/70 dark:bg-stone-900/50 border-b border-stone-100 dark:border-stone-800">
          {[10, 48, 140, 70, 60, 80, 60, 80, 80].map((w, i) => (
            <Skeleton key={i} className="h-3" style={{ width: w }} />
          ))}
        </div>

        {/* Table Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4 border-b border-stone-100 dark:border-stone-800 last:border-0"
          >
            <Skeleton className="size-4 rounded" />
            <Skeleton className="size-11 rounded-xl shrink-0" />
            
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-52" />
            </div>

            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-16 hidden lg:block" />
            <Skeleton className="h-4 w-10 hidden xl:block" />
            <Skeleton className="h-4 w-10 hidden xl:block" />

            {/* Action Buttons */}
            <div className="flex gap-1.5 shrink-0">
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}