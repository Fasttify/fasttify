import { useCallback, useEffect } from 'react';
import { useProductMutations } from './mutations';
import { useProductQueries } from './queries';
import type { UseProductsOptions, UseProductsResult } from './types';
import { useProductPagination } from './utils';

/**
 * Hook para gestionar productos con paginación y caché usando React Query
 * @param storeId - ID de la tienda para la que se gestionan los productos
 * @param options - Opciones de paginación y configuración (opcional)
 * @returns Objeto con productos, estado de carga, error, funciones CRUD y funciones de paginación
 */
export function useProducts(storeId: string | undefined, options?: UseProductsOptions): UseProductsResult {
  // Configuración de paginación
  const pagination = useProductPagination(options || {});
  const {
    currentPage,
    pageTokens,
    limit,
    sortDirection,
    sortField,
    resetPagination,
    nextPage,
    previousPage,
    updatePageTokens,
  } = pagination;

  // Mutaciones
  const mutations = useProductMutations(storeId);
  const {
    createProductMutation,
    updateProductMutation,
    deleteProductMutation,
    deleteMultipleProductsMutation,
    duplicateProductMutation,
  } = mutations;

  // Queries
  const queries = useProductQueries(storeId, { limit, sortDirection, sortField }, currentPage, pageTokens);
  const { data, isFetching, error: queryError, refetch, fetchProductById } = queries;

  // Efectos para manejar la paginación
  useEffect(() => {
    resetPagination();
  }, [storeId, limit, sortDirection, sortField, resetPagination]);

  useEffect(() => {
    if (data?.nextToken) {
      updatePageTokens(data.nextToken);
    }
  }, [data?.nextToken, updatePageTokens]);

  // Funciones wrapper para las mutaciones
  const createProduct = useCallback(
    async (productData) => {
      try {
        return await createProductMutation.mutateAsync(productData);
      } catch (err) {
        console.error('Error creating product:', err);
        return null;
      }
    },
    [createProductMutation]
  );

  const updateProduct = useCallback(
    async (productData) => {
      try {
        return await updateProductMutation.mutateAsync(productData);
      } catch (err) {
        console.error('Error updating product:', err);
        return null;
      }
    },
    [updateProductMutation]
  );

  const deleteProduct = useCallback(
    async (id) => {
      try {
        if (!id) {
          throw new Error('Product ID is required for deletion');
        }
        await deleteProductMutation.mutateAsync(id);
        return true;
      } catch (err) {
        console.error('Error deleting product:', err);
        return false;
      }
    },
    [deleteProductMutation]
  );

  const deleteMultipleProducts = useCallback(
    async (ids) => {
      try {
        await deleteMultipleProductsMutation.mutateAsync(ids);
        return true;
      } catch (err) {
        console.error('Error deleting multiple products:', err);
        return false;
      }
    },
    [deleteMultipleProductsMutation]
  );

  const duplicateProduct = useCallback(
    async (id) => {
      try {
        if (!id) {
          throw new Error('Product ID is required for duplication');
        }
        return await duplicateProductMutation.mutateAsync(id);
      } catch (err) {
        console.error('Error duplicating product:', err);
        return null;
      }
    },
    [duplicateProductMutation]
  );

  // Datos derivados
  const products = data?.products || [];
  const hasNextPage = !!data?.nextToken;
  const hasPreviousPage = currentPage > 1;

  // Función para resetear paginación y refrescar
  const resetPaginationAndRefetch = useCallback(() => {
    resetPagination();
    refetch();
  }, [resetPagination, refetch]);

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

    createProduct,
    updateProduct,
    deleteProduct,
    deleteMultipleProducts,
    duplicateProduct,
    fetchProduct: fetchProductById,
    refreshProducts: refetch,
  };
}
