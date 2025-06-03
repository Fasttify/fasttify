import { IProduct } from '@/app/store/hooks/useProducts'

export interface ProductSectionProps {
  selectedProducts: IProduct[]
  onAddProduct: (product: IProduct) => void
  onRemoveProduct: (productId: string) => void
}

export interface ProductItemProps {
  product: IProduct
  index: number
  onRemove: (productId: string) => void
}

export interface ProductSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedProducts: IProduct[]
  onAddProduct: (product: IProduct) => void
  onRemoveProduct: (productId: string) => void
}

export type SortOption = 'mas-recientes' | 'mas-antiguos' | 'precio-mayor' | 'precio-menor'

export type { IProduct } from '@/app/store/hooks/useProducts'
