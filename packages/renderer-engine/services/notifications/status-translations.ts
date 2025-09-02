/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Estados del pedido según el modelo order.ts
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Traducciones de estados del pedido
export const orderStatusTranslations: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  processing: 'En Procesamiento',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

// Traducciones de estados de pago
export const paymentStatusTranslations: Record<PaymentStatus, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  failed: 'Fallido',
  refunded: 'Reembolsado',
};

/**
 * Traduce el estado del pedido del inglés al español
 */
export function translateOrderStatus(status: OrderStatus): string {
  return orderStatusTranslations[status] || status;
}

/**
 * Traduce el estado de pago del inglés al español
 */
export function translatePaymentStatus(status: PaymentStatus): string {
  return paymentStatusTranslations[status] || status;
}

/**
 * Obtiene el estado del pedido traducido con validación
 */
export function getOrderStatus(status: string): string {
  if (isValidOrderStatus(status)) {
    return translateOrderStatus(status as OrderStatus);
  }
  return status; // Retorna el original si no es válido
}

/**
 * Obtiene el estado de pago traducido con validación
 */
export function getPaymentStatus(status: string): string {
  if (isValidPaymentStatus(status)) {
    return translatePaymentStatus(status as PaymentStatus);
  }
  return status; // Retorna el original si no es válido
}

/**
 * Valida si el estado del pedido es válido
 */
export function isValidOrderStatus(status: string): status is OrderStatus {
  return status in orderStatusTranslations;
}

/**
 * Valida si el estado de pago es válido
 */
export function isValidPaymentStatus(status: string): status is PaymentStatus {
  return status in paymentStatusTranslations;
}

/**
 * Obtiene todos los estados del pedido disponibles
 */
export function getAvailableOrderStatuses(): OrderStatus[] {
  return Object.keys(orderStatusTranslations) as OrderStatus[];
}

/**
 * Obtiene todos los estados de pago disponibles
 */
export function getAvailablePaymentStatuses(): PaymentStatus[] {
  return Object.keys(paymentStatusTranslations) as PaymentStatus[];
}
