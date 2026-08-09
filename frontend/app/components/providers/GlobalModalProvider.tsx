'use client'

import React from 'react'
import { Modal } from '../ui/modal'
import { AlertTriangle, Info, CheckCircle2, AlertOctagon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useModalStore } from '@/hooks/store/useModalStore'

const variantStyles = {
  danger: {
    icon: AlertOctagon,
    color: 'text-red-500 bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900/50',
    btn: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/40',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50',
    btn: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500/40',
  },
  info: {
    icon: Info,
    color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-100 dark:border-orange-900/50',
    btn: 'bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-500/40',
  },
  success: {
    icon: CheckCircle2,
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50',
    btn: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500/40',
  },
}

export function GlobalModalProvider() {
  const store = useModalStore()

  if (!store.isOpen) return null

  const handleConfirm = async () => {
    if (!store.onConfirm) {
      store.closeModal()
      return
    }

    try {
      store.setLoading(true)
      await store.onConfirm()
      store.closeModal()
    } catch (error) {
      console.error('Modal action failed:', error)
    } finally {
      store.setLoading(false)
    }
  }

  const handleCancel = () => {
    if (store.onCancel) store.onCancel()
    store.closeModal()
  }

  const VariantIcon = store.variant ? variantStyles[store.variant].icon : Info

  return (
    <Modal
      isOpen={store.isOpen}
      onClose={handleCancel}
      title={store.title}
      size={store.size}
      showCloseButton={store.showCloseButton}
    >
      {(store.type === 'ALERT' || store.type === 'CONFIRM') && (
        <div className="flex flex-col gap-5 pt-1">
          <div className="flex items-start gap-4">
            {store.variant && (
              <div
                className={cn(
                  'p-3 rounded-2xl border shrink-0',
                  variantStyles[store.variant].color,
                )}
              >
                <VariantIcon className="size-6" />
              </div>
            )}
            <div className="flex-1 space-y-1">
              {store.description && (
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  {store.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200/80 dark:border-stone-800">
            {store.type === 'CONFIRM' && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={store.isLoading}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all focus:outline-none disabled:opacity-50"
              >
                {store.cancelText}
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={store.isLoading}
              className={cn(
                'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2 focus:outline-none focus:ring-2 disabled:opacity-50',
                store.variant ? variantStyles[store.variant].btn : '',
              )}
            >
              {store.isLoading && <Loader2 className="size-4 animate-spin" />}
              {store.confirmText}
            </button>
          </div>
        </div>
      )}

      {store.type === 'CUSTOM' && store.content}
    </Modal>
  )
}