import { MenuItem } from '@/app/store/hooks/data/useNavigationMenus'

// Navigation Manager Props
export interface NavigationManagerProps {
  storeId: string
}

// Navigation Menu List Props
export interface NavigationMenuListProps {
  storeId: string
  onEdit?: (menuId: string) => void
  onDelete?: (menuId: string) => void
  onView?: (menuId: string) => void
}

// Navigation Menu Form Props
export interface NavigationMenuFormProps {
  storeId: string
  domain: string
  menuId?: string // Si se proporciona, es modo edición
  onSuccess: (message: string) => void
  onCancel: () => void
}

// Menu Item Form Props
export interface MenuItemFormProps {
  items: MenuItem[]
  onChange: (items: MenuItem[]) => void
  disabled?: boolean
  itemErrors?: Record<number, Record<string, string>>
}

// Menu Item Props para componentes individuales
export interface MenuItemProps {
  item: MenuItem
  index: number
  onUpdate: (index: number, item: MenuItem) => void
  onDelete: (index: number) => void
  onMove?: (fromIndex: number, toIndex: number) => void
}

// Estados del formulario
export interface MenuFormState {
  name: string
  handle: string
  isMain: boolean
  isActive: boolean
  menuItems: MenuItem[]
  isSubmitting: boolean
  errors: Record<string, string>
  menuItemErrors?: Record<number, Record<string, string>>
}

// Opciones para selects
export interface SelectOption {
  label: string
  value: string
}

export const MENU_ITEM_TYPES: SelectOption[] = [
  { label: 'Enlace interno', value: 'internal' },
  { label: 'Enlace externo', value: 'external' },
  { label: 'Página', value: 'page' },
  { label: 'Colección', value: 'collection' },
  { label: 'Producto', value: 'product' },
]

export const TARGET_OPTIONS: SelectOption[] = [
  { label: 'Misma ventana', value: '_self' },
  { label: 'Nueva ventana', value: '_blank' },
]
