import { useCallback, useEffect } from 'react';
import { useOrderMutations } from './mutations';
import { useOrderQueries } from './queries';
import type {
  IOrder,
  OrderCreateInput,
  OrderUpdateInput,
  UseOrdersOptions,
  UseOrdersResult,
  OrderStatus,
  PaymentStatus,
} from './types';
import { useOrderPagination } from './utils';

/**
 * Hook para gestionar órdenes con paginación y caché usando React Query
 * @param storeId - ID de la tienda para la que se gestionan las órdenes
 * @param options - Opciones de paginación y configuración (opcional)
 * @returns Objeto con órdenes, estado de carga, error, funciones CRUD y funciones de paginación
 */
export function useOrders(storeId: string | undefined, options?: UseOrdersOptions): UseOrdersResult {
  // Configuración de paginación
  const pagination = useOrderPagination(options || {});
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
  const mutations = useOrderMutations(storeId);
  const {
    createOrderMutation,
    updateOrderMutation,
    deleteOrderMutation,
    deleteMultipleOrdersMutation,
    updateOrderStatusMutation,
    updatePaymentStatusMutation,
  } = mutations;

  // Queries
  const queries = useOrderQueries(
    storeId,
    { limit, sortDirection, sortField: sortField as keyof IOrder },
    currentPage,
    pageTokens
  );
  const { data, isFetching, error: queryError, refetch, fetchOrderById } = queries;

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
  const createOrder = useCallback(
    async (orderData: OrderCreateInput) => {
      try {
        return await createOrderMutation.mutateAsync(orderData);
      } catch (err) {
        console.error('Error creating order:', err);
        return null;
      }
    },
    [createOrderMutation]
  );

  const updateOrder = useCallback(
    async (orderData: OrderUpdateInput) => {
      try {
        return await updateOrderMutation.mutateAsync(orderData);
      } catch (err) {
        console.error('Error updating order:', err);
        return null;
      }
    },
    [updateOrderMutation]
  );

  const deleteOrder = useCallback(
    async (id: string) => {
      try {
        if (!id) {
          throw new Error('Order ID is required for deletion');
        }
        await deleteOrderMutation.mutateAsync({ id, storeOwner: '' });
        return true;
      } catch (err) {
        console.error('Error deleting order:', err);
        return false;
      }
    },
    [deleteOrderMutation]
  );

  const deleteMultipleOrders = useCallback(
    async (ids: string[]) => {
      try {
        await deleteMultipleOrdersMutation.mutateAsync({ ids, storeOwner: '' });
        return true;
      } catch (err) {
        console.error('Error deleting multiple orders:', err);
        return false;
      }
    },
    [deleteMultipleOrdersMutation]
  );

  // Funciones específicas para el manejo de estados
  const updateOrderStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      try {
        if (!id) {
          throw new Error('Order ID is required');
        }
        return await updateOrderStatusMutation.mutateAsync({ id, status });
      } catch (err) {
        console.error('Error updating order status:', err);
        return null;
      }
    },
    [updateOrderStatusMutation]
  );

  const updatePaymentStatus = useCallback(
    async (id: string, paymentStatus: PaymentStatus) => {
      try {
        if (!id) {
          throw new Error('Order ID is required');
        }
        return await updatePaymentStatusMutation.mutateAsync({ id, paymentStatus });
      } catch (err) {
        console.error('Error updating payment status:', err);
        return null;
      }
    },
    [updatePaymentStatusMutation]
  );

  // Datos derivados
  const orders = data?.orders || [];
  const hasNextPage = !!data?.nextToken;
  const hasPreviousPage = currentPage > 1;

  // Función para resetear paginación y refrescar
  const resetPaginationAndRefetch = useCallback(() => {
    resetPagination();
    refetch();
  }, [resetPagination, refetch]);

  return {
    orders,
    loading: isFetching,
    error: queryError ? new Error(queryError.message) : null,

    currentPage,
    hasNextPage,
    hasPreviousPage,

    nextPage,
    previousPage,
    resetPagination: resetPaginationAndRefetch,

    createOrder,
    updateOrder,
    deleteOrder,
    deleteMultipleOrders,
    updateOrderStatus,
    updatePaymentStatus,
    fetchOrder: fetchOrderById,
    refreshOrders: refetch,
  };
}
