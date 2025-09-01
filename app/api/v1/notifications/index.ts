/*
 * APIs de Notificaciones para el Panel Admin
 *
 * Este módulo proporciona endpoints para que el panel admin pueda enviar
 * correos electrónicos relacionados con pedidos y actualizaciones de estado.
 */

export { default as sendOrderConfirmation } from './send-order-confirmation/route';
export { default as sendOrderStatusUpdate } from './send-order-status-update/route';

// Tipos de datos para las APIs
export interface OrderConfirmationRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
  storeName: string;
  orderStatus: string;
  paymentStatus: string;
  orderTotal: string;
  orderDate: string;
  shippingAddress?: string;
  billingAddress?: string;
  adminToken: string;
  storeId: string;
}

export interface OrderStatusUpdateRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
  storeName: string;
  previousOrderStatus: string;
  newOrderStatus: string;
  previousPaymentStatus: string;
  newPaymentStatus: string;
  orderTotal: string;
  orderDate: string;
  shippingAddress?: string;
  billingAddress?: string;
  updateNotes?: string;
  adminToken: string;
  storeId: string;
}

// Respuestas de las APIs
export interface NotificationResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    customerEmail: string;
    emailSent: boolean;
    timestamp: string;
  };
}
