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

import type { Order } from '../../types';
import { cookiesClient } from '@/utils/server/AmplifyServer';
import { EmailNotificationService, EmailFormattingUtils, type Address } from './index';

export class EmailOrderService {
  /**
   * Envía email de confirmación al cliente cuando se crea una orden
   */
  static async sendOrderConfirmationEmail(order: Order, checkoutSession: any): Promise<void> {
    try {
      // Ejecutar en background para no bloquear la respuesta
      setImmediate(async () => {
        try {
          const storeInfo = await this.getStoreInfo(checkoutSession?.storeId || '');
          const customerName = EmailFormattingUtils.extractCustomerName(checkoutSession?.customerInfo || '');
          const shippingAddress = EmailFormattingUtils.extractAddress(checkoutSession?.shippingAddress);
          const billingAddress = EmailFormattingUtils.extractAddress(checkoutSession?.billingAddress);
          const formattedShippingAddress = shippingAddress
            ? EmailFormattingUtils.formatAddress(shippingAddress)
            : undefined;
          const formattedBillingAddress = billingAddress
            ? EmailFormattingUtils.formatAddress(billingAddress)
            : undefined;

          await EmailNotificationService.sendOrderConfirmation({
            order,
            storeName: storeInfo.storeName,
            customerName: customerName || 'Customer',
            shippingAddress: formattedShippingAddress || undefined,
            billingAddress: formattedBillingAddress || undefined,
          });
        } catch (error) {
          console.error('Error sending order confirmation email:', error);
        }
      });
    } catch (error) {
      console.error('Error scheduling order confirmation email:', error);
    }
  }

  /**
   * Obtiene información básica de la tienda
   */
  private static async getStoreInfo(storeId: string): Promise<{ storeName: string }> {
    try {
      const response = await cookiesClient.models.UserStore.get({ storeId });
      if (response.data) {
        return {
          storeName: response.data.storeName,
        };
      }
      return { storeName: 'My Store' };
    } catch (error) {
      console.warn('Error getting store info:', error);
      return { storeName: 'My Store' };
    }
  }
}
