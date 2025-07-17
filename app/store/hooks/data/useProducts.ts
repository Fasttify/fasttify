import type { Schema } from '@/amplify/data/resource';
import { normalizeAttributesField, withLowercaseName } from '@/app/store/hooks/utils/productUtils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import { useCallback, useEffect, useState } from 'react';

const client = generateClient<Schema>({
  authMode: 'userPool',
});

/**
 * Interfaz para representar un producto
 */
export type IProduct = Schema['Product']['type'];

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
 * Hook para gestionar productos con paginación y caché usando React Query
 * @param storeId - ID de la tienda para la que se gestionan los productos
 * @param options - Opciones de paginación y configuración (opcional)
 * @returns Objeto con productos, estado de carga, error, funciones CRUD y funciones de paginación
 */
export function useProducts(storeId: string | undefined, options?: UseProductsOptions): UseProductsResult {
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageTokens, setPageTokens] = useState<(string | null)[]>([null]);

  const limit = options?.limit || 50;
  const sortDirection = options?.sortDirection || 'DESC';
  const sortField = options?.sortField || 'creationDate';
  const enabled = options?.enabled !== false && !!storeId;

  useEffect(() => {
    setCurrentPage(1);
    setPageTokens([null]);
  }, [storeId, limit, sortDirection, sortField]);

  const fetchProductsPage = async () => {
    if (!storeId) throw new Error('Store ID is required');

    const token = pageTokens[currentPage - 1];

    const { data, nextToken } = await client.models.Product.listProductByStoreId(
      {
        storeId: storeId,
      },
      {
        limit,
        nextToken: token,
      }
    );

    const sortedData = [...(data || [])].sort((a, b) => {
      const fieldA = a[sortField as keyof typeof a];
      const fieldB = b[sortField as keyof typeof b];

      if (fieldA === undefined || fieldA === null) return sortDirection === 'ASC' ? -1 : 1;
      if (fieldB === undefined || fieldB === null) return sortDirection === 'ASC' ? 1 : -1;

      if (fieldA < fieldB) return sortDirection === 'ASC' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'ASC' ? 1 : -1;
      return 0;
    });

    return {
      products: sortedData as IProduct[],
      nextToken: nextToken as string | null,
    };
  };

  const {
    data,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['products', storeId, limit, sortDirection, sortField, currentPage],
    queryFn: fetchProductsPage,
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data?.nextToken && pageTokens.length === currentPage) {
      setPageTokens((tokens) => [...tokens, data.nextToken]);
    }
  }, [data?.nextToken, pageTokens.length, currentPage]);

  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductCreateInput) => {
      const { username } = await getCurrentUser();
      const dataToSend = withLowercaseName({
        ...productData,
        attributes: normalizeAttributesField(
          productData.attributes as string | { name?: string; values?: string[] }[] | undefined
        ),
        storeId: storeId || '',
        owner: username,
        status: productData.status || 'DRAFT',
        quantity: productData.quantity || 0,
      });

      const { data } = await client.models.Product.create(dataToSend);
      return data as IProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', storeId] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (productData: ProductUpdateInput) => {
      const dataToSend = withLowercaseName({
        ...productData,
        attributes: normalizeAttributesField(
          productData.attributes as string | { name?: string; values?: string[] }[] | undefined
        ),
      });

      const { data } = await client.models.Product.update(dataToSend);
      return data as IProduct;
    },
    onSuccess: (updatedProduct) => {
      queryClient
        .getQueryCache()
        .findAll({ queryKey: ['products', storeId] })
        .forEach((query) => {
          const oldData = query.state.data as { products: IProduct[]; nextToken: string | null } | undefined;
          if (oldData?.products.some((p) => p.id === updatedProduct.id)) {
            queryClient.setQueryData(query.queryKey, {
              ...oldData,
              products: oldData.products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
            });
          }
        });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await client.models.Product.delete({ id });
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient
        .getQueryCache()
        .findAll({ queryKey: ['products', storeId] })
        .forEach((query) => {
          const oldData = query.state.data as { products: IProduct[]; nextToken: string | null } | undefined;
          if (oldData?.products.some((p) => p.id === deletedId)) {
            queryClient.setQueryData(query.queryKey, {
              ...oldData,
              products: oldData.products.filter((p) => p.id !== deletedId),
            });
          }
        });
    },
  });

  const deleteMultipleProductsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => client.models.Product.delete({ id })));
      return ids;
    },
    onSuccess: (deletedIds) => {
      queryClient
        .getQueryCache()
        .findAll({ queryKey: ['products', storeId] })
        .forEach((query) => {
          const oldData = query.state.data as { products: IProduct[]; nextToken: string | null } | undefined;
          if (oldData?.products.some((p) => deletedIds.includes(p.id))) {
            queryClient.setQueryData(query.queryKey, {
              ...oldData,
              products: oldData.products.filter((p) => !deletedIds.includes(p.id)),
            });
          }
        });
    },
  });

  const fetchProductById = useCallback(
    async (id: string): Promise<IProduct | null> => {
      if (!storeId) {
        console.error('Cannot get product: storeId not defined');
        return null;
      }

      const queryCache = queryClient.getQueryCache();
      const productQueries = queryCache.findAll({ queryKey: ['products', storeId] });

      for (const query of productQueries) {
        const pageData = query.state.data as { products: IProduct[] } | undefined;
        if (pageData?.products) {
          const existingProduct = pageData.products.find((p) => p.id === id);
          if (existingProduct) {
            return existingProduct;
          }
        }
      }

      try {
        const { data: product } = await client.models.Product.get({ id });

        if (product) {
          queryClient.setQueryData(['product', id], product);
          return product as IProduct;
        }

        return null;
      } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
      }
    },
    [storeId, queryClient]
  );

  const products = data?.products || [];
  const hasNextPage = !!data?.nextToken;
  const hasPreviousPage = currentPage > 1;

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const previousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const resetPaginationAndRefetch = () => {
    setCurrentPage(1);
    setPageTokens([null]);
    refetch();
  };

  return {
    products,
    loading: isFetching,
    error: queryError ? new Error(queryError.message) : null,

    currentPage,
    hasNextPage,
    hasPreviousPage,

    nextPage,
    previousPage,
    resetPagination: resetPaginationAndRefetch,

    createProduct: async (productData) => {
      try {
        return await createProductMutation.mutateAsync(productData);
      } catch (err) {
        console.error('Error creating product:', err);
        return null;
      }
    },
    updateProduct: async (productData) => {
      try {
        return await updateProductMutation.mutateAsync(productData);
      } catch (err) {
        console.error('Error updating product:', err);
        return null;
      }
    },
    deleteProduct: async (id) => {
      try {
        await deleteProductMutation.mutateAsync(id);
        return true;
      } catch (err) {
        console.error('Error deleting product:', err);
        return false;
      }
    },
    deleteMultipleProducts: async (ids) => {
      try {
        await deleteMultipleProductsMutation.mutateAsync(ids);
        return true;
      } catch (err) {
        console.error('Error deleting multiple products:', err);
        return false;
      }
    },
    fetchProduct: fetchProductById,
    refreshProducts: refetch,
  };
}
