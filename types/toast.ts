export type ToastVariant = 'error' | 'warning' | 'info' | 'success'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

export interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, variant: ToastVariant) => void
  removeToast: (id: string) => void
}
