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
import { cookiesClient } from '@/utils/server/AmplifyServer';
import { EmailNotificationService } from './email-notification-service';

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
          const customerName = this.extractCustomerName(checkoutSession?.customerInfo || '');
          const shippingAddress = this.extractAddress(checkoutSession?.shippingAddress);
          const billingAddress = this.extractAddress(checkoutSession?.billingAddress);
          const formattedShippingAddress = shippingAddress ? this.formatAddressForTemplate(shippingAddress) : undefined;
          const formattedBillingAddress = billingAddress ? this.formatAddressForTemplate(billingAddress) : undefined;

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

  /**
   * Extrae el nombre del cliente del customerInfo
   */
  private static extractCustomerName(customerInfo: any): string | null {
    try {
      if (typeof customerInfo === 'string') {
        const parsed = JSON.parse(customerInfo);
        return parsed.name || parsed.firstName || parsed.lastName || null;
      }
      if (customerInfo && typeof customerInfo === 'object') {
        return customerInfo.name || customerInfo.firstName || customerInfo.lastName || null;
      }
      return null;
    } catch (error) {
      console.warn('Error extracting customer name:', error);
      return null;
    }
  }

  /**
   * Extrae y formatea la información de dirección del checkout
   */
  private static extractAddress(addressData: any): any {
    if (!addressData) return undefined;

    try {
      // Si es string, intentar parsear JSON
      if (typeof addressData === 'string') {
        const parsed = JSON.parse(addressData);
        return this.normalizeAddress(parsed);
      }

      // Si es objeto, normalizar directamente
      if (typeof addressData === 'object') {
        return this.normalizeAddress(addressData);
      }

      return undefined;
    } catch (error) {
      console.warn('Error extracting address:', error);
      return undefined;
    }
  }

  /**
   * Normaliza la estructura de dirección para el email
   */
  private static normalizeAddress(address: any): any {
    return {
      address1: address.address1 || address.street || address.line1,
      address2: address.address2 || address.street2 || address.line2,
      city: address.city,
      province: address.province || address.state || address.region,
      zip: address.zip || address.postalCode || address.postcode,
      country: address.country,
    };
  }

  /**
   * Formatea la dirección para el template del email
   */
  private static formatAddressForTemplate(address: any): string {
    if (!address) return '';

    const lines: string[] = [];

    // Línea 1: Dirección principal
    if (address.address1) {
      lines.push(address.address1);
    }

    // Línea 2: Dirección secundaria (si existe)
    if (address.address2) {
      lines.push(address.address2);
    }

    // Línea 3: Ciudad y provincia/estado
    if (address.city) {
      const cityLine = address.province ? `${address.city}, ${address.province}` : address.city;
      lines.push(cityLine);
    }

    // Línea 4: Código postal y país
    if (address.zip || address.country) {
      const zipCountry = [address.zip, address.country].filter(Boolean).join(', ');
      if (zipCountry) lines.push(zipCountry);
    }

    const result = lines.join('\n');

    return result;
  }
}
