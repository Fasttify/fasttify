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
import { getOrderStatus, getPaymentStatus } from './status-translations';
import { EmailFormattingUtils, type Address, type AddressInfo } from './email-formatting-utils';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

// Re-exportar interfaces desde email-formatting-utils
export type { Address, AddressInfo } from './email-formatting-utils';

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
  orderStatus: string;
  paymentStatus: string;
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
      total: EmailFormattingUtils.formatCurrency(request.order.totalAmount, request.order.currency),
      orderDate: EmailFormattingUtils.formatDate(request.order.createdAt),
      storeName: request.storeName,
      orderStatus: getOrderStatus(request.order.status),
      paymentStatus: getPaymentStatus(request.order.paymentStatus),
      shippingAddress: request.shippingAddress
        ? EmailFormattingUtils.formatAddress(request.shippingAddress)
        : undefined,
      billingAddress: request.billingAddress ? EmailFormattingUtils.formatAddress(request.billingAddress) : undefined,
    };
  }

  /**
   * Formatea una dirección para usar en el template del email
   */
  private static formatAddressForTemplate(address: Address): AddressInfo {
    return EmailFormattingUtils.formatAddressForTemplate(address);
  }

  /**
   * Envía la request a la lambda de bulk-email directamente
   */
  private static async sendBulkEmail(emailData: any): Promise<boolean> {
    try {
      const requestData = {
        ...emailData,
        priority: 'high',
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
}
