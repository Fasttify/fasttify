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

import type { OrderValidationResult } from './types/order-types';

export class OrderValidator {
  /**
   * Valida los datos de la orden antes de crearla
   */
  public validateOrderData(orderData: any): OrderValidationResult {
    const errors: string[] = [];

    // Validar campos requeridos
    if (!orderData.orderNumber) errors.push('orderNumber is required');
    if (!orderData.storeId) errors.push('storeId is required');
    if (!orderData.customerId) errors.push('customerId is required');
    if (!orderData.customerType) errors.push('customerType is required');
    if (!orderData.storeOwner) errors.push('storeOwner is required');

    // Validar campos numéricos
    if (typeof orderData.subtotal !== 'number') errors.push('subtotal must be a number');
    if (typeof orderData.totalAmount !== 'number') errors.push('totalAmount must be a number');
    if (typeof orderData.shippingCost !== 'number') errors.push('shippingCost must be a number');
    if (typeof orderData.taxAmount !== 'number') errors.push('taxAmount must be a number');

    // Validar enums
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderData.status)) {
      errors.push(`status must be one of: ${validStatuses.join(', ')}`);
    }

    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(orderData.paymentStatus)) {
      errors.push(`paymentStatus must be one of: ${validPaymentStatuses.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida que los campos JSON sean strings válidos después de la conversión
   */
  public validateJsonFields(orderData: any): OrderValidationResult {
    const errors: string[] = [];

    if (orderData.shippingAddress && typeof orderData.shippingAddress !== 'string') {
      errors.push('Invalid shippingAddress format after JSON.stringify');
    }

    if (orderData.billingAddress && typeof orderData.billingAddress !== 'string') {
      errors.push('Invalid billingAddress format after JSON.stringify');
    }

    if (orderData.customerInfo && typeof orderData.customerInfo !== 'string') {
      errors.push('Invalid customerInfo format after JSON.stringify');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida que los campos requeridos estén presentes
   */
  public validateRequiredFields(orderData: any): OrderValidationResult {
    const errors: string[] = [];

    if (!orderData.orderNumber) errors.push('orderNumber is required');
    if (!orderData.storeId) errors.push('storeId is required');
    if (!orderData.customerId) errors.push('customerId is required');
    if (!orderData.customerType) errors.push('customerType is required');
    if (!orderData.storeOwner) errors.push('storeOwner is required');

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const orderValidator = new OrderValidator();
