import { useCallback, useState } from 'react';
import type { PaginationOptions } from '../types';

/**
 * Hook personalizado para manejar la paginación de órdenes
 */
export const useOrderPagination = (options: PaginationOptions) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageTokens, setPageTokens] = useState<(string | null)[]>([null]);

  const limit = options.limit || 50;
  const sortDirection = options.sortDirection || 'DESC';
  const sortField = options.sortField || 'createdAt';

  /**
   * Resetea la paginación a la primera página
   */
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setPageTokens([null]);
  }, []);

  /**
   * Avanza a la siguiente página
   */
  const nextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  /**
   * Retrocede a la página anterior
   */
  const previousPage = useCallback(() => {
    setCurrentPage((prev) => prev - 1);
  }, []);

  /**
   * Actualiza los tokens de página cuando se recibe un nuevo nextToken
   */
  const updatePageTokens = useCallback(
    (nextToken: string | null) => {
      if (nextToken && pageTokens.length === currentPage) {
        setPageTokens((tokens) => [...tokens, nextToken]);
      }
    },
    [currentPage, pageTokens.length]
  );

  /**
   * Obtiene el token de la página actual
   */
  const getCurrentPageToken = useCallback(() => {
    return pageTokens[currentPage - 1];
  }, [currentPage, pageTokens]);

  /**
   * Verifica si hay una página siguiente
   */
  const hasNextPage = useCallback(
    (nextToken: string | null, ordersCount: number = 0) => {
      // Si no hay nextToken, no hay más páginas
      if (!nextToken) return false;
      // Si tenemos menos órdenes que el límite, no hay más páginas
      if (ordersCount < limit) return false;
      // Si tenemos exactamente el límite, solo hay más páginas si hay nextToken
      return true;
    },
    [limit]
  );

  /**
   * Verifica si hay una página anterior
   */
  const hasPreviousPage = useCallback(() => {
    return currentPage > 1;
  }, [currentPage]);

  return {
    currentPage,
    pageTokens,
    limit,
    sortDirection,
    sortField,
    resetPagination,
    nextPage,
    previousPage,
    updatePageTokens,
    getCurrentPageToken,
    hasNextPage,
    hasPreviousPage,
  };
};
