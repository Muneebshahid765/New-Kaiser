'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'dots' | 'pulse'
  className?: string
}

export function Loader({ size = 'md', variant = 'spinner', className }: LoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  if (variant === 'dots') {
    return (
      <div className={cn("flex items-center space-x-1.5 justify-center", className)}>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn("rounded-full bg-emerald-500/20 animate-ping", sizeClasses[size], className)} />
    )
  }

  // Default Spinner
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div className={cn("rounded-full border-2 border-slate-800 border-t-emerald-500 animate-spin", sizeClasses[size])} />
    </div>
  )
}