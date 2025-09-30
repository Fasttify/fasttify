import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { IProduct, PaginationOptions, ProductsQueryResult } from '../types';
import { storeClient } from '@/lib/amplify-client';

/**
 * Hook para manejar las queries de productos
 */
export const useProductQueries = (
  storeId: string | undefined,
  options: PaginationOptions,
  currentPage: number,
  pageTokens: (string | null)[]
) => {
  const queryClient = useQueryClient();
  const { limit, sortDirection, sortField } = options;

  /**
   * Función para obtener productos de una página específica
   */
  const fetchProductsPage = async (): Promise<ProductsQueryResult> => {
    if (!storeId) throw new Error('Store ID is required');

    const token = pageTokens[currentPage - 1];

    const { data, nextToken } = await storeClient.models.Product.listProductByStoreId(
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

  /**
   * Query principal para obtener productos
   */
  const {
    data,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['products', storeId, limit, sortDirection, sortField, currentPage],
    queryFn: fetchProductsPage,
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  /**
   * Función para buscar un producto específico por ID
   */
  const fetchProductById = async (id: string): Promise<IProduct | null> => {
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
      const { data: product } = await storeClient.models.Product.get({ id });

      if (product) {
        queryClient.setQueryData(['product', id], product);
        return product as IProduct;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      return null;
    }
  };

  return {
    data,
    isFetching,
    error: queryError,
    refetch,
    fetchProductById,
  };
};
