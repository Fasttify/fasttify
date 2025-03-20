import type { IProduct } from '@/app/store/hooks/useProducts'

export type SortDirection = 'asc' | 'desc' | null
export type SortField = 'name' | 'status' | 'quantity' | 'price' | 'category' | null

export interface VisibleColumns {
  product: boolean
  status: boolean
  inventory: boolean
  price: boolean
  category: boolean
  actions: boolean
}

export interface ProductListProps {
  storeId: string
  products: IProduct[]
  loading: boolean
  error: Error | null
  hasNextPage: boolean
  loadNextPage: () => void
  deleteMultipleProducts: (ids: string[]) => Promise<boolean>
  refreshProducts: () => void
  deleteProduct: (id: string) => Promise<boolean>
}
