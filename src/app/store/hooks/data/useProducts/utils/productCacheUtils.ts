import { useQueryClient } from '@tanstack/react-query';
import type { IProduct } from '../types';

/**
 * Utilidades para manejar el caché de productos en React Query
 */
export const useProductCacheUtils = (storeId: string | undefined) => {
  const queryClient = useQueryClient();

  /**
   * Actualiza el caché de productos optimísticamente después de una actualización
   */
  const updateProductInCache = (updatedProduct: IProduct) => {
    if (!storeId) return;

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
  };

  /**
   * Remueve productos del caché optimísticamente después de una eliminación
   */
  const removeProductsFromCache = (deletedIds: string[]) => {
    if (!storeId) return;

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
  };

  /**
   * Busca un producto en el caché existente
   */
  const findProductInCache = (id: string): IProduct | null => {
    if (!storeId) return null;

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

    return null;
  };

  /**
   * Invalida todas las queries de productos para una tienda
   */
  const invalidateProductsCache = () => {
    if (!storeId) return;
    queryClient.invalidateQueries({ queryKey: ['products', storeId] });
  };

  /**
   * Agrega un producto nuevo al caché optimísticamente
   */
  const addProductToCache = (newProduct: IProduct) => {
    if (!storeId) return;

    let shouldInvalidateCache = false;

    queryClient
      .getQueryCache()
      .findAll({ queryKey: ['products', storeId] })
      .forEach((query) => {
        const oldData = query.state.data as { products: IProduct[]; nextToken: string | null } | undefined;
        if (oldData?.products) {
          // Solo agregar a la primera página si tiene espacio
          if (query.queryKey.includes(1) || query.queryKey.length === 2) {
            // Detectar el límite dinámicamente basándose en la query key
            // La query key es: ['products', storeId, limit, sortDirection, sortField, currentPage]
            // El limit está en la posición 2
            const limit = (query.queryKey[2] as number) || 50;

            // Validar que el limit sea un número válido
            if (typeof limit !== 'number' || limit <= 0) {
              shouldInvalidateCache = true;
              return;
            }

            if (oldData.products.length < limit) {
              // Si la primera página tiene espacio, agregar el producto
              queryClient.setQueryData(query.queryKey, {
                ...oldData,
                products: [newProduct, ...oldData.products],
              });
            } else {
              // Si la primera página está llena, marcar para invalidar caché
              shouldInvalidateCache = true;
            }
          }
        }
      });

    // Si la primera página está llena, invalidar el caché para que se recargue correctamente
    if (shouldInvalidateCache) {
      queryClient.invalidateQueries({ queryKey: ['products', storeId] });
    }
  };

  return {
    updateProductInCache,
    removeProductsFromCache,
    findProductInCache,
    invalidateProductsCache,
    addProductToCache,
  };
};
