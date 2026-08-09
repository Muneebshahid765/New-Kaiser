import { create } from 'zustand'
import { ModalOptions, ModalState, ModalType } from './types/modal'

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  type: null,
  title: '',
  description: '',
  content: null,
  size: 'md',
  variant: 'info',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  isLoading: false,
  showCloseButton: true,

  openModal: (type: ModalType, options: ModalOptions) =>
    set({
      isOpen: true,
      type,
      size: options.size || 'md',
      variant: options.variant || 'info',
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      showCloseButton: options.showCloseButton ?? true,
      isLoading: false,
      ...options,
    }),

  closeModal: () =>
    set({
      isOpen: false,
      type: null,
      content: null,
      onConfirm: undefined,
      onCancel: undefined,
      isLoading: false,
    }),

  setLoading: (isLoading: boolean) => set({ isLoading }),
}))

// Enterprise Shortcut Helper Methods
export const modals = {
  alert: (options: Omit<ModalOptions, 'content'>) =>
    useModalStore.getState().openModal('ALERT', options),

  confirm: (options: Omit<ModalOptions, 'content'>) =>
    useModalStore.getState().openModal('CONFIRM', options),

  open: (content: React.ReactNode, options?: Omit<ModalOptions, 'content'>) =>
    useModalStore.getState().openModal('CUSTOM', { ...options, content }),

  close: () => useModalStore.getState().closeModal(),
}