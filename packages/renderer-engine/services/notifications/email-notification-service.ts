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

import type { Order } from '@/renderer-engine/types';
import { getCurrencyConfig } from './currency-config';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

// Interfaces para direcciones
export interface Address {
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
}

export interface AddressInfo {
  fullAddress: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
  userId?: string;
  storeId?: string;
  metadata?: Record<string, any>;
}

export interface EmailTemplateVariables {
  customerName: string;
  orderId: string;
  total: string;
  orderDate: string;
  storeName: string;
  shippingAddress?: string;
  billingAddress?: string;
}

export interface OrderConfirmationEmailRequest {
  order: Order;
  storeName: string;
  customerName?: string;
  shippingAddress?: Address | string;
  billingAddress?: Address | string;
}

export class EmailNotificationService {
  /**
   * Envía email de confirmación de orden con información completa
   */
  static async sendOrderConfirmation(request: OrderConfirmationEmailRequest): Promise<boolean> {
    try {
      // Validar que el cliente tenga email
      if (!request.order.customerEmail) {
        console.warn(`Customer without email for order ${request.order.id}`);
        return false;
      }

      // Preparar variables del template con información completa
      const templateVariables = this.buildOrderConfirmationVariables(request);

      // Preparar datos del email
      const emailData = {
        templateId: 'order-confirmation',
        recipients: [
          {
            email: request.order.customerEmail,
            name: request.customerName,
            userId: request.order.customerId,
            storeId: request.order.storeId,
          },
        ],
        templateVariables,
        priority: 'high',
        metadata: {
          orderId: request.order.id,
          storeId: request.order.storeId,
          notificationType: 'customer_confirmation',
        },
      };

      // Enviar email usando la API de bulk-email
      await this.sendBulkEmail(emailData);

      return true;
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      return false;
    }
  }

  /**
   * Construye las variables del template para confirmación de orden
   */
  private static buildOrderConfirmationVariables(request: OrderConfirmationEmailRequest): EmailTemplateVariables {
    return {
      customerName: request.customerName || 'Customer',
      orderId: request.order.orderNumber || request.order.id,
      total: this.formatCurrency(request.order.totalAmount, request.order.currency),
      orderDate: this.formatDate(request.order.createdAt),
      storeName: request.storeName,
      shippingAddress: request.shippingAddress ? this.formatAddress(request.shippingAddress) : undefined,
      billingAddress: request.billingAddress ? this.formatAddress(request.billingAddress) : undefined,
    };
  }

  /**
   * Formatea una dirección para usar en el template del email
   */
  private static formatAddressForTemplate(address: Address): AddressInfo {
    return {
      fullAddress: this.formatAddress(address),
      address1: address.address1,
      address2: address.address2,
      city: address.city,
      province: address.province,
      zip: address.zip,
      country: address.country,
    };
  }

  /**
   * Formatea una dirección completa como string legible
   */
  private static formatAddress(address: Address | string): string {
    if (typeof address === 'string') {
      return address;
    }

    if (!address.address1) return 'Address not specified';

    const addressParts = [
      address.address1,
      address.address2,
      address.city,
      address.province,
      address.zip,
      address.country,
    ].filter(Boolean);

    const result = addressParts.join(', ');

    return result;
  }

  /**
   * Envía la request a la lambda de bulk-email directamente
   */
  private static async sendBulkEmail(emailData: any): Promise<boolean> {
    try {
      const requestData = {
        ...emailData,
        priority: 'high' as const,
      };

      const lambdaClient = new LambdaClient({ region: 'us-east-2' });

      const command = new InvokeCommand({
        FunctionName: process.env.LAMBDA_EMAIL_BULK,
        InvocationType: 'Event',
        Payload: JSON.stringify({
          httpMethod: 'POST',
          path: '/send-bulk',
          body: JSON.stringify(requestData),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          requestContext: {
            path: '/send-bulk',
          },
        }),
      });

      const response = await lambdaClient.send(command);

      return response.StatusCode === 202;
    } catch (error) {
      console.error('Error request to lambda bulk-email:', error);
      return false;
    }
  }

  /**
   * Formatea moneda usando la configuración existente (basada en useCurrencyConfig)
   */
  private static formatCurrency(amount: number, currency: string): string {
    try {
      if (typeof amount !== 'number') return 'N/A';

      const config = getCurrencyConfig(currency);

      const formattedAmount = new Intl.NumberFormat(config.locale, {
        minimumFractionDigits: config.decimalPlaces,
        maximumFractionDigits: config.decimalPlaces,
      }).format(amount);

      return config.format.replace('{{amount}}', formattedAmount);
    } catch (error) {
      console.warn('Error formatting currency:', error);
      return `${amount} ${currency}`;
    }
  }

  /**
   * Formatea fecha para mostrar en el email
   */
  private static formatDate(dateString?: string): string {
    try {
      if (!dateString) {
        return new Date().toLocaleDateString('es-ES');
      }
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.warn('Error formatting date:', error);
      return new Date().toLocaleDateString('es-ES');
    }
  }
}
