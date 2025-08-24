import { type StoreSchema } from '@/data-schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import type { IOrder, OrderCreateInput, OrderUpdateInput, OrderStatus, PaymentStatus } from '../types';
import { useOrderCacheUtils } from '../utils/orderCacheUtils';

const client = generateClient<StoreSchema>({
  authMode: 'userPool',
});

/**
 * Hook para manejar todas las mutaciones de órdenes
 */
export const useOrderMutations = (storeId: string | undefined) => {
  const queryClient = useQueryClient();
  const cacheUtils = useOrderCacheUtils(storeId);

  /**
   * Mutación para crear una orden
   */
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: OrderCreateInput) => {
      const { username } = await getCurrentUser();
      const dataToSend = {
        ...orderData,
        storeOwner: username,
        status: orderData.status || 'pending',
        paymentStatus: orderData.paymentStatus || 'pending',
        currency: orderData.currency || 'COP',
        subtotal: orderData.subtotal || 0,
        shippingCost: orderData.shippingCost || 0,
        taxAmount: orderData.taxAmount || 0,
        totalAmount: orderData.totalAmount || 0,
      };

      const { data } = await client.models.Order.create(dataToSend);
      return data as IOrder;
    },
    onSuccess: async (newOrder) => {
      // Actualizar caché optimísticamente
      cacheUtils.updateOrderInCache(newOrder);
    },
  });

  /**
   * Mutación para actualizar una orden
   */
  const updateOrderMutation = useMutation({
    mutationFn: async (orderData: OrderUpdateInput) => {
      const dataToSend = {
        ...orderData,
        // Recalcular total si se actualizan los montos
        totalAmount:
          orderData.subtotal !== undefined || orderData.shippingCost !== undefined || orderData.taxAmount !== undefined
            ? (orderData.subtotal || 0) + (orderData.shippingCost || 0) + (orderData.taxAmount || 0)
            : undefined,
      };

      const { data } = await client.models.Order.update(dataToSend);
      return data as IOrder;
    },
    onSuccess: async (updatedOrder) => {
      // Actualizar caché optimísticamente
      cacheUtils.updateOrderInCache(updatedOrder);
    },
  });

  /**
   * Mutación para eliminar una orden
   */
  const deleteOrderMutation = useMutation({
    mutationFn: async ({ id, storeOwner }: { id: string; storeOwner: string }) => {
      if (!id) {
        throw new Error('ID is required for deletion');
      }
      await client.models.Order.delete({ id });
      return id;
    },
    onSuccess: async (deletedId) => {
      // Remover del caché optimísticamente
      cacheUtils.removeOrdersFromCache([deletedId]);
    },
  });

  /**
   * Mutación para eliminar múltiples órdenes
   */
  const deleteMultipleOrdersMutation = useMutation({
    mutationFn: async ({ ids, storeOwner }: { ids: string[]; storeOwner: string }) => {
      await Promise.all(ids.map((id) => client.models.Order.delete({ id })));
      return ids;
    },
    onSuccess: async (deletedIds) => {
      // Remover del caché optimísticamente
      cacheUtils.removeOrdersFromCache(deletedIds);
    },
  });

  /**
   * Mutación para actualizar el estado de una orden
   */
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { data } = await client.models.Order.update({
        id,
        status,
      });
      return data as IOrder;
    },
    onSuccess: async (updatedOrder) => {
      // Actualizar caché optimísticamente
      cacheUtils.updateOrderInCache(updatedOrder);
    },
  });

  /**
   * Mutación para actualizar el estado del pago
   */
  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ id, paymentStatus }: { id: string; paymentStatus: PaymentStatus }) => {
      const { data } = await client.models.Order.update({
        id,
        paymentStatus,
      });
      return data as IOrder;
    },
    onSuccess: async (updatedOrder) => {
      // Actualizar caché optimísticamente
      cacheUtils.updateOrderInCache(updatedOrder);
    },
  });

  return {
    createOrderMutation,
    updateOrderMutation,
    deleteOrderMutation,
    deleteMultipleOrdersMutation,
    updateOrderStatusMutation,
    updatePaymentStatusMutation,
  };
};
