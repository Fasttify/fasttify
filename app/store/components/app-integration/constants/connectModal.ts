export type Step = 1 | 2 | 3
export type Option = 'existing' | 'new' | null
export type Status = 'idle' | 'loading' | 'success' | 'error'

export const BENEFITS = [
  'Importación automática de productos desde Master Shop',
  'Sincronización de inventario en tiempo real',
  'Actualización automática de precios y descripciones',
  'Gestión centralizada de tu catálogo de productos',
] as const

export const MIN_API_KEY_LENGTH = 5

export const MASTER_SHOP_LOGIN_URL = 'https://app.mastershop.com/login'

export interface ConnectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}
