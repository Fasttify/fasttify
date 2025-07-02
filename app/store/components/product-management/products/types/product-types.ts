import type { IProduct } from '@/app/store/hooks/data/useProducts';

export type SortDirection = 'asc' | 'desc' | null;
export type SortField = 'name' | 'status' | 'quantity' | 'price' | 'category' | 'creationDate';

export interface VisibleColumns {
  product: boolean;
  status: boolean;
  inventory: boolean;
  price: boolean;
  category: boolean;
  actions: boolean;
}

export interface ProductListProps {
  storeId: string;
  products: IProduct[];
  loading: boolean;
  error: Error | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
  currentPage: number;
  deleteMultipleProducts: (ids: string[]) => Promise<boolean>;
  refreshProducts: () => void;
  deleteProduct: (id: string) => Promise<boolean>;
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
}
