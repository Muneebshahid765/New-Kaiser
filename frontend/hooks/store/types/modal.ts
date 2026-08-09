import { ReactNode } from 'react'

export type ModalType = 'ALERT' | 'CONFIRM' | 'CUSTOM'
export type ModalVariant = 'danger' | 'warning' | 'info' | 'success'
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'

export interface ModalOptions {
  title?: string
  description?: string
  content?: ReactNode
  size?: ModalSize
  variant?: ModalVariant
  confirmText?: string
  cancelText?: string
  onConfirm?: () => Promise<void> | void
  onCancel?: () => void
  showCloseButton?: boolean
}

export interface ModalState extends ModalOptions {
  isOpen: boolean
  type: ModalType | null
  isLoading?: boolean
  openModal: (type: ModalType, options: ModalOptions) => void
  closeModal: () => void
  setLoading: (loading: boolean) => void
}