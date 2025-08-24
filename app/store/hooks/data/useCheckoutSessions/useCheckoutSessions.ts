import { useCallback, useEffect } from 'react';
import { useCheckoutSessionMutations } from './mutations';
import { useCheckoutSessionQueries } from './queries';
import type {
  ICheckoutSession,
  CheckoutSessionCreateInput,
  CheckoutSessionUpdateInput,
  UseCheckoutSessionsOptions,
  UseCheckoutSessionsResult,
} from './types';
import { useCheckoutSessionPagination } from './utils';

/**
 * Hook para gestionar sesiones de checkout con paginación y caché usando React Query
 * @param storeId - ID de la tienda para la que se gestionan las sesiones de checkout
 * @param options - Opciones de paginación y configuración (opcional)
 * @returns Objeto con sesiones de checkout, estado de carga, error, funciones CRUD y funciones de paginación
 */
export function useCheckoutSessions(
  storeId: string | undefined,
  options?: UseCheckoutSessionsOptions
): UseCheckoutSessionsResult {
  // Configuración de paginación
  const pagination = useCheckoutSessionPagination(options || {});
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
  const mutations = useCheckoutSessionMutations(storeId);
  const {
    createCheckoutSessionMutation,
    updateCheckoutSessionMutation,
    deleteCheckoutSessionMutation,
    deleteMultipleCheckoutSessionsMutation,
    completeCheckoutSessionMutation,
    expireCheckoutSessionMutation,
    cancelCheckoutSessionMutation,
  } = mutations;

  // Queries
  const queries = useCheckoutSessionQueries(
    storeId,
    { limit, sortDirection, sortField: sortField as keyof ICheckoutSession },
    currentPage,
    pageTokens
  );
  const { data, isFetching, error: queryError, refetch, fetchCheckoutSessionById } = queries;

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
  const createCheckoutSession = useCallback(
    async (sessionData: CheckoutSessionCreateInput) => {
      try {
        return await createCheckoutSessionMutation.mutateAsync(sessionData);
      } catch (err) {
        console.error('Error creating checkout session:', err);
        return null;
      }
    },
    [createCheckoutSessionMutation]
  );

  const updateCheckoutSession = useCallback(
    async (sessionData: CheckoutSessionUpdateInput) => {
      try {
        return await updateCheckoutSessionMutation.mutateAsync(sessionData);
      } catch (err) {
        console.error('Error updating checkout session:', err);
        return null;
      }
    },
    [updateCheckoutSessionMutation]
  );

  const deleteCheckoutSession = useCallback(
    async (id: string) => {
      try {
        if (!id) {
          throw new Error('Checkout session ID is required for deletion');
        }
        await deleteCheckoutSessionMutation.mutateAsync({ id, storeOwner: '' });
        return true;
      } catch (err) {
        console.error('Error deleting checkout session:', err);
        return false;
      }
    },
    [deleteCheckoutSessionMutation]
  );

  const deleteMultipleCheckoutSessions = useCallback(
    async (ids: string[]) => {
      try {
        await deleteMultipleCheckoutSessionsMutation.mutateAsync({ ids, storeOwner: '' });
        return true;
      } catch (err) {
        console.error('Error deleting multiple checkout sessions:', err);
        return false;
      }
    },
    [deleteMultipleCheckoutSessionsMutation]
  );

  // Funciones específicas para el manejo de estados
  const completeCheckoutSession = useCallback(
    async (id: string) => {
      try {
        if (!id) {
          throw new Error('Checkout session ID is required');
        }
        return await completeCheckoutSessionMutation.mutateAsync(id);
      } catch (err) {
        console.error('Error completing checkout session:', err);
        return null;
      }
    },
    [completeCheckoutSessionMutation]
  );

  const expireCheckoutSession = useCallback(
    async (id: string) => {
      try {
        if (!id) {
          throw new Error('Checkout session ID is required');
        }
        return await expireCheckoutSessionMutation.mutateAsync(id);
      } catch (err) {
        console.error('Error expiring checkout session:', err);
        return null;
      }
    },
    [expireCheckoutSessionMutation]
  );

  const cancelCheckoutSession = useCallback(
    async (id: string) => {
      try {
        if (!id) {
          throw new Error('Checkout session ID is required');
        }
        return await cancelCheckoutSessionMutation.mutateAsync(id);
      } catch (err) {
        console.error('Error cancelling checkout session:', err);
        return null;
      }
    },
    [cancelCheckoutSessionMutation]
  );

  // Datos derivados
  const checkoutSessions = data?.checkoutSessions || [];
  const hasNextPage = !!data?.nextToken;
  const hasPreviousPage = currentPage > 1;

  // Función para resetear paginación y refrescar
  const resetPaginationAndRefetch = useCallback(() => {
    resetPagination();
    refetch();
  }, [resetPagination, refetch]);

  return {
    checkoutSessions,
    loading: isFetching,
    error: queryError ? new Error(queryError.message) : null,

    currentPage,
    hasNextPage,
    hasPreviousPage,

    nextPage,
    previousPage,
    resetPagination: resetPaginationAndRefetch,

    createCheckoutSession,
    updateCheckoutSession,
    deleteCheckoutSession,
    deleteMultipleCheckoutSessions,
    completeCheckoutSession,
    expireCheckoutSession,
    cancelCheckoutSession,
    fetchCheckoutSession: fetchCheckoutSessionById,
    refreshCheckoutSessions: refetch,
  };
}
