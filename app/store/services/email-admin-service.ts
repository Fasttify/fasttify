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

import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

export interface OrderStatusUpdateEmailRequest {
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
  storeId: string;
}

/**
 * Servicio especializado para emails del panel de administración
 */
export class EmailAdminService {
  /**
   * Envía email de actualización de estado de orden (desde panel admin)
   */
  static async sendOrderStatusUpdate(request: OrderStatusUpdateEmailRequest): Promise<boolean> {
    try {
      // Validar que el cliente tenga email
      if (!request.customerEmail) {
        console.warn(`Customer without email for order ${request.orderId}`);
        return false;
      }

      // Preparar variables del template
      const templateVariables = {
        customerName: request.customerName,
        orderId: request.orderId,
        total: request.orderTotal,
        orderDate: request.orderDate,
        storeName: request.storeName,
        previousOrderStatus: request.previousOrderStatus,
        newOrderStatus: request.newOrderStatus,
        previousPaymentStatus: request.previousPaymentStatus,
        newPaymentStatus: request.newPaymentStatus,
        shippingAddress: request.shippingAddress,
        billingAddress: request.billingAddress,
        updateNotes: request.updateNotes,
      };

      // Preparar datos del email
      const emailData = {
        templateId: 'order-status-update',
        recipients: [
          {
            email: request.customerEmail,
            name: request.customerName,
            metadata: {
              orderId: request.orderId,
              notificationType: 'status_update',
            },
          },
        ],
        templateVariables,
        priority: 'high',
        metadata: {
          orderId: request.orderId,
          notificationType: 'status_update',
        },
      };

      // Enviar email usando la API de bulk-email
      await this.sendBulkEmail(emailData);

      return true;
    } catch (error) {
      console.error('Error sending order status update:', error);
      return false;
    }
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
