import { type StoreSchema } from '@/data-schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import type { IOrder, OrderCreateInput, OrderUpdateInput, OrderStatus, PaymentStatus } from '../types';
import { useOrderCacheUtils } from '../utils/orderCacheUtils';
import { useOrderNotifications } from '../notifications/useOrderNotifications';

const client = generateClient<StoreSchema>({
  authMode: 'userPool',
});

/**
 * Hook para manejar todas las mutaciones de órdenes
 */
export const useOrderMutations = (storeId: string | undefined, storeName?: string) => {
  const queryClient = useQueryClient();
  const cacheUtils = useOrderCacheUtils(storeId);
  const orderNotifications = useOrderNotifications();

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

      // Enviar notificación de confirmación de orden si hay storeName
      if (storeName && newOrder.customerEmail) {
        try {
          await orderNotifications.sendOrderConfirmationNotification(newOrder, storeName);
        } catch (error) {
          console.error('Error sending order confirmation notification:', error);
        }
      }
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
    mutationFn: async ({
      id,
      status,
      previousStatus,
      updateNotes,
    }: {
      id: string;
      status: OrderStatus;
      previousStatus?: OrderStatus;
      updateNotes?: string;
    }) => {
      const { data } = await client.models.Order.update({
        id,
        status,
      });
      return { order: data as IOrder, previousStatus, updateNotes };
    },
    onSuccess: async ({ order: updatedOrder, previousStatus, updateNotes }) => {
      // Actualizar caché optimísticamente
      cacheUtils.updateOrderInCache(updatedOrder);

      // Enviar notificación de actualización de estado si hay storeName y el estado cambió
      if (storeName && previousStatus && previousStatus !== updatedOrder.status) {
        try {
          const prevStatus: OrderStatus = previousStatus || 'pending';
          const newStatus: OrderStatus = updatedOrder.status || 'pending';
          const prevPaymentStatus: PaymentStatus = updatedOrder.paymentStatus || 'pending';
          const newPaymentStatus: PaymentStatus = updatedOrder.paymentStatus || 'pending';

          await orderNotifications.sendOrderStatusUpdateNotification(
            updatedOrder,
            storeName,
            storeId || '',
            prevStatus,
            newStatus,
            prevPaymentStatus,
            newPaymentStatus,
            updateNotes
          );
        } catch (error) {
          console.error('Error sending order status update notification:', error);
        }
      }
    },
  });

  /**
   * Mutación para actualizar el estado del pago
   */
  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({
      id,
      paymentStatus,
      previousPaymentStatus,
      updateNotes,
    }: {
      id: string;
      paymentStatus: PaymentStatus;
      previousPaymentStatus?: PaymentStatus;
      updateNotes?: string;
    }) => {
      const { data } = await client.models.Order.update({
        id,
        paymentStatus,
      });
      return { order: data as IOrder, previousPaymentStatus, updateNotes };
    },
    onSuccess: async ({ order: updatedOrder, previousPaymentStatus, updateNotes }) => {
      // Actualizar caché optimísticamente
      cacheUtils.updateOrderInCache(updatedOrder);

      // Enviar notificación de actualización de estado de pago si hay storeName y el estado cambió
      if (storeName && previousPaymentStatus && previousPaymentStatus !== updatedOrder.paymentStatus) {
        try {
          await orderNotifications.sendPaymentStatusUpdateNotification(
            updatedOrder,
            storeName,
            storeId || '',
            (previousPaymentStatus || 'pending') as PaymentStatus,
            (updatedOrder.paymentStatus || 'pending') as PaymentStatus,
            updateNotes
          );
        } catch (error) {
          console.error('Error sending payment status update notification:', error);
        }
      }
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
