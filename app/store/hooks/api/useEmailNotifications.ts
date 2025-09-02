import { useState, useCallback } from 'react';
import type { OrderStatusUpdateEmailRequest } from '@/app/store/services';

export interface OrderConfirmationEmailRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
  storeName: string;
  orderTotal: string;
  orderDate: string;
  shippingAddress?: string;
  billingAddress?: string;
}

export interface EmailNotificationState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Hook para manejar las notificaciones de email desde el panel de administración
 */
export function useEmailNotifications() {
  const [state, setState] = useState<EmailNotificationState>({
    loading: false,
    error: null,
    success: false,
  });

  /**
   * Envía email de confirmación de orden
   */
  const sendOrderConfirmation = useCallback(async (request: OrderConfirmationEmailRequest): Promise<boolean> => {
    setState({ loading: true, error: null, success: false });

    try {
      const response = await fetch('/api/v1/notifications/send-order-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error sending order confirmation email');
      }

      setState({ loading: false, error: null, success: true });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({ loading: false, error: errorMessage, success: false });
      return false;
    }
  }, []);

  /**
   * Envía email de actualización de estado de orden
   */
  const sendOrderStatusUpdate = useCallback(async (request: OrderStatusUpdateEmailRequest): Promise<boolean> => {
    setState({ loading: true, error: null, success: false });

    try {
      const response = await fetch('/api/v1/notifications/send-order-status-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error sending order status update email');
      }

      setState({ loading: false, error: null, success: true });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({ loading: false, error: errorMessage, success: false });
      return false;
    }
  }, []);

  /**
   * Resetea el estado del hook
   */
  const resetState = useCallback(() => {
    setState({ loading: false, error: null, success: false });
  }, []);

  return {
    ...state,
    sendOrderConfirmation,
    sendOrderStatusUpdate,
    resetState,
  };
}
