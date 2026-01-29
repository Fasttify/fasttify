import { useCallback } from 'react';
import { useEmailNotifications } from '@/app/store/hooks/api/useEmailNotifications';
import type { OrderStatus, PaymentStatus } from '@/app/store/hooks/data/useOrders/types';
import {
  EmailFormattingUtils,
  getOrderStatus,
  getPaymentStatus,
} from '@fasttify/liquid-forge/services/notifications/client-utils';

/**
 * Hook para manejar las notificaciones de email relacionadas con órdenes
 */
export function useOrderNotifications() {
  const emailNotifications = useEmailNotifications();

  /**
   * Envía notificación de confirmación de orden
   */
  const sendOrderConfirmationNotification = useCallback(
    async (order: any, storeName: string): Promise<boolean> => {
      if (!order.customerEmail) {
        console.warn(`Order ${order.id} has no customer email, skipping confirmation notification`);
        return false;
      }

      const request = {
        orderId: order.orderNumber || order.id,
        customerEmail: order.customerEmail || '',
        customerName: EmailFormattingUtils.extractCustomerName(order.customerInfo) || 'Cliente',
        storeName,
        orderTotal: EmailFormattingUtils.formatCurrency(order.totalAmount || 0, order.currency || 'COP'),
        orderDate: EmailFormattingUtils.formatDate(order.createdAt || new Date().toISOString()),
        shippingAddress: order.shippingAddress
          ? EmailFormattingUtils.formatAddress(
              EmailFormattingUtils.extractAddress(order.shippingAddress) || order.shippingAddress
            )
          : undefined,
        billingAddress: order.billingAddress
          ? EmailFormattingUtils.formatAddress(
              EmailFormattingUtils.extractAddress(order.billingAddress) || order.billingAddress
            )
          : undefined,
      };

      return await emailNotifications.sendOrderConfirmation(request);
    },
    [emailNotifications]
  );

  /**
   * Envía notificación de actualización de estado de orden
   */
  const sendOrderStatusUpdateNotification = useCallback(
    async (
      order: any,
      storeName: string,
      storeId: string,
      previousOrderStatus: OrderStatus,
      newOrderStatus: OrderStatus,
      previousPaymentStatus: PaymentStatus,
      newPaymentStatus: PaymentStatus,
      updateNotes?: string
    ): Promise<boolean> => {
      if (!order.customerEmail) {
        console.warn(`Order ${order.id} has no customer email, skipping status update notification`);
        return false;
      }

      const request = {
        orderId: order.orderNumber || order.id,
        customerEmail: order.customerEmail || '',
        customerName: EmailFormattingUtils.extractCustomerName(order.customerInfo) || 'Cliente',
        storeName,
        storeId,
        previousOrderStatus: getOrderStatus(previousOrderStatus),
        newOrderStatus: getOrderStatus(newOrderStatus),
        previousPaymentStatus: getPaymentStatus(previousPaymentStatus),
        newPaymentStatus: getPaymentStatus(newPaymentStatus),
        orderTotal: EmailFormattingUtils.formatCurrency(order.totalAmount || 0, order.currency || 'COP'),
        orderDate: EmailFormattingUtils.formatDate(order.createdAt || new Date().toISOString()),
        shippingAddress: order.shippingAddress
          ? EmailFormattingUtils.formatAddress(
              EmailFormattingUtils.extractAddress(order.shippingAddress) || order.shippingAddress
            )
          : undefined,
        billingAddress: order.billingAddress
          ? EmailFormattingUtils.formatAddress(
              EmailFormattingUtils.extractAddress(order.billingAddress) || order.billingAddress
            )
          : undefined,
        updateNotes,
      };

      return await emailNotifications.sendOrderStatusUpdate(request);
    },
    [emailNotifications]
  );

  /**
   * Envía notificación de actualización de estado de pago
   */
  const sendPaymentStatusUpdateNotification = useCallback(
    async (
      order: any,
      storeName: string,
      storeId: string,
      previousPaymentStatus: PaymentStatus,
      newPaymentStatus: PaymentStatus,
      updateNotes?: string
    ): Promise<boolean> => {
      if (!order.customerEmail) {
        console.warn(`Order ${order.id} has no customer email, skipping payment status update notification`);
        return false;
      }

      const request = {
        orderId: order.orderNumber || order.id,
        customerEmail: order.customerEmail || '',
        customerName: EmailFormattingUtils.extractCustomerName(order.customerInfo) || 'Cliente',
        storeName,
        storeId,
        previousOrderStatus: getOrderStatus(order.status || 'pending'),
        newOrderStatus: getOrderStatus(order.status || 'pending'), // No cambió el estado de la orden
        previousPaymentStatus: getPaymentStatus(previousPaymentStatus),
        newPaymentStatus: getPaymentStatus(newPaymentStatus),
        orderTotal: EmailFormattingUtils.formatCurrency(order.totalAmount || 0, order.currency || 'COP'),
        orderDate: EmailFormattingUtils.formatDate(order.createdAt || new Date().toISOString()),
        shippingAddress: order.shippingAddress
          ? EmailFormattingUtils.formatAddress(
              EmailFormattingUtils.extractAddress(order.shippingAddress) || order.shippingAddress
            )
          : undefined,
        billingAddress: order.billingAddress
          ? EmailFormattingUtils.formatAddress(
              EmailFormattingUtils.extractAddress(order.billingAddress) || order.billingAddress
            )
          : undefined,
        updateNotes,
      };

      return await emailNotifications.sendOrderStatusUpdate(request);
    },
    [emailNotifications]
  );

  return {
    ...emailNotifications,
    sendOrderConfirmationNotification,
    sendOrderStatusUpdateNotification,
    sendPaymentStatusUpdateNotification,
  };
}
