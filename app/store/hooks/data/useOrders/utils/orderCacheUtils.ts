import { useQueryClient } from '@tanstack/react-query';
import type { IOrder } from '../types';

/**
 * Utilidades para manejar el caché de órdenes en React Query
 */
export const useOrderCacheUtils = (storeId: string | undefined) => {
  const queryClient = useQueryClient();

  /**
   * Actualiza el caché de órdenes optimísticamente después de una actualización
   */
  const updateOrderInCache = (updatedOrder: IOrder) => {
    if (!storeId) return;

    queryClient
      .getQueryCache()
      .findAll({ queryKey: ['orders', storeId] })
      .forEach((query) => {
        const oldData = query.state.data as { orders: IOrder[]; nextToken: string | null } | undefined;
        if (oldData?.orders.some((o) => o.id === updatedOrder.id)) {
          queryClient.setQueryData(query.queryKey, {
            ...oldData,
            orders: oldData.orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)),
          });
        }
      });
  };

  /**
   * Remueve órdenes del caché optimísticamente después de una eliminación
   */
  const removeOrdersFromCache = (deletedIds: string[]) => {
    if (!storeId) return;

    queryClient
      .getQueryCache()
      .findAll({ queryKey: ['orders', storeId] })
      .forEach((query) => {
        const oldData = query.state.data as { orders: IOrder[]; nextToken: string | null } | undefined;
        if (oldData?.orders.some((o) => deletedIds.includes(o.id))) {
          queryClient.setQueryData(query.queryKey, {
            ...oldData,
            orders: oldData.orders.filter((o) => !deletedIds.includes(o.id)),
          });
        }
      });
  };

  /**
   * Busca una orden en el caché existente
   */
  const findOrderInCache = (id: string): IOrder | null => {
    if (!storeId) return null;

    const queryCache = queryClient.getQueryCache();
    const orderQueries = queryCache.findAll({ queryKey: ['orders', storeId] });

    for (const query of orderQueries) {
      const pageData = query.state.data as { orders: IOrder[] } | undefined;
      if (pageData?.orders) {
        const existingOrder = pageData.orders.find((o) => o.id === id);
        if (existingOrder) {
          return existingOrder;
        }
      }
    }

    return null;
  };

  /**
   * Invalida todas las queries de órdenes para una tienda
   */
  const invalidateOrdersCache = () => {
    if (!storeId) return;
    queryClient.invalidateQueries({ queryKey: ['orders', storeId] });
  };

  return {
    updateOrderInCache,
    removeOrdersFromCache,
    findOrderInCache,
    invalidateOrdersCache,
  };
};
