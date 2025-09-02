import { z } from 'zod';

export const sendOrderConfirmationSchema = z.object({
  orderId: z.string().min(1, 'ID del pedido requerido'),
  customerEmail: z.string().email('Email del cliente inválido'),
  customerName: z.string().min(1, 'Nombre del cliente requerido'),
  storeName: z.string().min(1, 'Nombre de la tienda requerido'),
  orderStatus: z.string().min(1, 'Estado del pedido requerido'),
  paymentStatus: z.string().min(1, 'Estado de pago requerido'),
  orderTotal: z.string().min(1, 'Total del pedido requerido'),
  orderDate: z.string().min(1, 'Fecha del pedido requerida'),
  shippingAddress: z.string().optional(),
  billingAddress: z.string().optional(),
  storeId: z.string().min(1, 'ID de la tienda requerido'),
});

export const sendOrderStatusUpdateSchema = z.object({
  orderId: z.string().min(1, 'ID del pedido requerido'),
  customerEmail: z.string().email('Email del cliente inválido'),
  customerName: z.string().min(1, 'Nombre del cliente requerido'),
  storeName: z.string().min(1, 'Nombre de la tienda requerido'),
  previousOrderStatus: z.string().min(1, 'Estado anterior del pedido requerido'),
  newOrderStatus: z.string().min(1, 'Nuevo estado del pedido requerido'),
  previousPaymentStatus: z.string().min(1, 'Estado anterior de pago requerido'),
  newPaymentStatus: z.string().min(1, 'Nuevo estado de pago requerido'),
  orderTotal: z.string().min(1, 'Total del pedido requerido'),
  orderDate: z.string().min(1, 'Fecha del pedido requerida'),
  shippingAddress: z.string().optional(),
  billingAddress: z.string().optional(),
  updateNotes: z.string().optional(),
  storeId: z.string().min(1, 'ID de la tienda requerido'),
});
