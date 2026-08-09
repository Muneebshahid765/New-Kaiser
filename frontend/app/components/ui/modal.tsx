'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModalSize } from '@/hooks/store/types/modal'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  size?: ModalSize
  showCloseButton?: boolean
}

const sizeMap: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  full: 'max-w-[calc(100vw-2rem)] md:max-w-[90vw] h-[90vh]',
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      className,
      size = 'lg',
      showCloseButton = true,
    },
    ref,
  ) => {
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
      setMounted(true)
    }, [])

    React.useEffect(() => {
      if (isOpen && typeof window !== 'undefined') {
        document.body.style.overflow = 'hidden'
      }
      return () => {
        if (typeof window !== 'undefined') {
          document.body.style.overflow = 'unset'
        }
      }
    }, [isOpen])

    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      if (isOpen) window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!mounted || !isOpen) return null

    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 isolation-isolate">
        {/* Backdrop: Adapts to dark mode */}
        <div
          className="absolute inset-0 bg-stone-900/60 dark:bg-black/80 backdrop-blur-md transition-opacity animate-fade-in cursor-pointer"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Main Box: Light in Buyer App / Dark in Admin App */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          className={cn(
            'relative w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 sm:p-7 shadow-xl shadow-orange-950/5 dark:shadow-black/50 z-10 text-left flex flex-col overflow-hidden max-h-[85vh]',
            'transform transition-all scale-100 animate-in fade-in-50 zoom-in-95 duration-200',
            sizeMap[size],
            className,
          )}
        >
          {/* Top Decorative Warm Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-amber-700" />

          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200/80 dark:border-stone-800 shrink-0">
              {title && (
                <h3
                  id="modal-title"
                  className="text-lg font-semibold text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  type="button"
                  className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-orange-50 dark:hover:bg-stone-800 active:bg-orange-100 dark:active:bg-stone-700 p-2 rounded-xl transition-all ml-auto focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  aria-label="Close modal"
                >
                  <X className="size-5" />
                </button>
              )}
            </div>
          )}

          {/* Content Body */}
          <div className="text-sm text-stone-700 dark:text-stone-300 overflow-y-auto flex-1 pr-1 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700 scrollbar-track-transparent">
            {children}
          </div>
        </div>
      </div>,
      document.body,
    )
  },
)

Modal.displayName = 'Modal'