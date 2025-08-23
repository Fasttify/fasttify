import { type StoreSchema } from '@/data-schema';

/**
 * Interfaz para representar un producto
 */
export type IProduct = StoreSchema['Product']['type'];

/**
 * Tipo para los datos necesarios al crear un producto
 */
export type ProductCreateInput = Omit<IProduct, 'id' | 'owner'>;

/**
 * Tipo para los datos al actualizar un producto
 */
export type ProductUpdateInput = Partial<Omit<IProduct, 'id' | 'owner'>> & {
  id: string;
};

/**
 * Opciones para filtrar productos
 */
export interface ProductFilterOptions {
  category?: string;
  featured?: boolean;
  status?: 'active' | 'inactive' | 'pending' | 'draft';
  priceRange?: { min?: number; max?: number };
}

/**
 * Opciones de paginación
 */
export interface PaginationOptions {
  limit?: number;
  sortDirection?: 'ASC' | 'DESC';
  sortField?: keyof IProduct;
}

/**
 * Resultado del hook useProducts
 */
export interface UseProductsResult {
  products: IProduct[];
  loading: boolean;
  error: Error | null;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
  resetPagination: () => void;
  createProduct: (productData: ProductCreateInput) => Promise<IProduct | null>;
  updateProduct: (productData: ProductUpdateInput) => Promise<IProduct | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  deleteMultipleProducts: (ids: string[]) => Promise<boolean>;
  duplicateProduct: (id: string) => Promise<IProduct | null>;
  refreshProducts: () => void;
  fetchProduct: (id: string) => Promise<IProduct | null>;
}

/**
 * Opciones de paginación y configuración
 */
export interface UseProductsOptions extends PaginationOptions {
  skipInitialFetch?: boolean;
  enabled?: boolean;
}

/**
 * Resultado de la consulta de productos
 */
export interface ProductsQueryResult {
  products: IProduct[];
  nextToken: string | null;
}
