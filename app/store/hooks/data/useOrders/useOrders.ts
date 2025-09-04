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
export function useOrders(
  storeId: string | undefined,
  options?: UseOrdersOptions,
  storeName?: string
): UseOrdersResult {
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
  const mutations = useOrderMutations(storeId, storeName);
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

  // Datos derivados
  const orders = data?.orders || [];
  const hasNextPage = !!data?.nextToken;
  const hasPreviousPage = currentPage > 1;

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

        // Verificar si la página actual quedó vacía después de la eliminación
        const remainingOrders = orders.filter((order) => !ids.includes(order.id));

        // Si no quedan órdenes en la página actual y hay página anterior, ir a la anterior
        if (remainingOrders.length === 0 && hasPreviousPage) {
          previousPage();
        }
        // Si no quedan órdenes y no hay página anterior, refrescar para mostrar la siguiente página
        else if (remainingOrders.length === 0 && !hasPreviousPage) {
          refetch();
        }

        return true;
      } catch (err) {
        console.error('Error deleting multiple orders:', err);
        return false;
      }
    },
    [deleteMultipleOrdersMutation, orders, hasPreviousPage, previousPage, refetch]
  );

  // Funciones específicas para el manejo de estados
  const updateOrderStatus = useCallback(
    async (id: string, status: OrderStatus, previousStatus?: OrderStatus, updateNotes?: string) => {
      try {
        if (!id) {
          throw new Error('Order ID is required');
        }
        const result = await updateOrderStatusMutation.mutateAsync({
          id,
          status,
          previousStatus,
          updateNotes,
        });
        return result.order;
      } catch (err) {
        console.error('Error updating order status:', err);
        return null;
      }
    },
    [updateOrderStatusMutation]
  );

  const updatePaymentStatus = useCallback(
    async (id: string, paymentStatus: PaymentStatus, previousPaymentStatus?: PaymentStatus, updateNotes?: string) => {
      try {
        if (!id) {
          throw new Error('Order ID is required');
        }
        const result = await updatePaymentStatusMutation.mutateAsync({
          id,
          paymentStatus,
          previousPaymentStatus,
          updateNotes,
        });
        return result.order;
      } catch (err) {
        console.error('Error updating payment status:', err);
        return null;
      }
    },
    [updatePaymentStatusMutation]
  );

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
