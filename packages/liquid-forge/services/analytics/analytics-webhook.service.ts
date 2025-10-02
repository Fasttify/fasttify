/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { logger } from '@/liquid-forge/lib/logger';
import { AnalyticsWebhookJWTAuth } from '@/api/webhooks/_lib/middleware/jwt-auth.middleware';

/**
 * Tipos para eventos de analíticas
 */
export type AnalyticsWebhookEventType =
  | 'ORDER_CREATED'
  | 'ORDER_CANCELLED'
  | 'ORDER_REFUNDED'
  | 'INVENTORY_LOW'
  | 'INVENTORY_OUT'
  | 'NEW_CUSTOMER'
  | 'CUSTOMER_LOGIN';

export interface AnalyticsWebhookEvent {
  type: AnalyticsWebhookEventType;
  storeId: string;
  timestamp: string;
  data: any;
}

export interface OrderCreatedData {
  orderId: string;
  totalAmount: number;
  currency: string;
  customerId?: string;
  customerType: 'registered' | 'guest';
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  discountAmount?: number;
  subtotal?: number;
}

export interface OrderCancelledData {
  orderId: string;
  totalAmount: number;
  currency: string;
  customerId?: string;
  reason?: string;
}

export interface OrderRefundedData {
  orderId: string;
  refundAmount: number;
  currency: string;
  customerId?: string;
  reason?: string;
}

export interface InventoryLowData {
  productId: string;
  currentQuantity: number;
  threshold: number;
}

export interface InventoryOutData {
  productId: string;
  productName: string;
}

export interface NewCustomerData {
  customerId: string;
  customerType: 'registered' | 'guest';
  registrationDate: string;
}

export interface CustomerLoginData {
  customerId: string;
  customerType: 'registered' | 'guest';
  loginDate: string;
}

/**
 * Servicio para disparar webhooks de analíticas
 */
export class AnalyticsWebhookService {
  private static instance: AnalyticsWebhookService;
  private webhookUrl: string;
  private isEnabled: boolean;

  private constructor() {
    // URL del webhook de analíticas
    this.webhookUrl = '/api/webhooks/analytics';
    // Habilitado por defecto, se puede deshabilitar con variable de entorno
    this.isEnabled = process.env.ANALYTICS_WEBHOOK_ENABLED !== 'false';
  }

  public static getInstance(): AnalyticsWebhookService {
    if (!AnalyticsWebhookService.instance) {
      AnalyticsWebhookService.instance = new AnalyticsWebhookService();
    }
    return AnalyticsWebhookService.instance;
  }

  /**
   * Dispara webhook cuando se crea una nueva orden
   */
  public async fireOrderCreated(storeId: string, orderData: OrderCreatedData): Promise<void> {
    if (!this.isEnabled) return;

    const event: AnalyticsWebhookEvent = {
      type: 'ORDER_CREATED',
      storeId,
      timestamp: new Date().toISOString(),
      data: orderData,
    };

    await this.sendWebhook(event);
  }

  /**
   * Dispara webhook cuando se cancela una orden
   */
  public async fireOrderCancelled(storeId: string, orderData: OrderCancelledData): Promise<void> {
    if (!this.isEnabled) return;

    const event: AnalyticsWebhookEvent = {
      type: 'ORDER_CANCELLED',
      storeId,
      timestamp: new Date().toISOString(),
      data: orderData,
    };

    await this.sendWebhook(event);
  }

  /**
   * Dispara webhook cuando se procesa un reembolso
   */
  public async fireOrderRefunded(storeId: string, orderData: OrderRefundedData): Promise<void> {
    if (!this.isEnabled) return;

    const event: AnalyticsWebhookEvent = {
      type: 'ORDER_REFUNDED',
      storeId,
      timestamp: new Date().toISOString(),
      data: orderData,
    };

    await this.sendWebhook(event);
  }

  /**
   * Dispara webhook cuando el inventario está bajo
   */
  public async fireInventoryLow(storeId: string, inventoryData: InventoryLowData): Promise<void> {
    if (!this.isEnabled) return;

    const event: AnalyticsWebhookEvent = {
      type: 'INVENTORY_LOW',
      storeId,
      timestamp: new Date().toISOString(),
      data: inventoryData,
    };

    await this.sendWebhook(event);
  }

  /**
   * Dispara webhook cuando el inventario se agota
   */
  public async fireInventoryOut(storeId: string, inventoryData: InventoryOutData): Promise<void> {
    if (!this.isEnabled) return;

    const event: AnalyticsWebhookEvent = {
      type: 'INVENTORY_OUT',
      storeId,
      timestamp: new Date().toISOString(),
      data: inventoryData,
    };

    await this.sendWebhook(event);
  }

  /**
   * Dispara webhook cuando se registra un nuevo cliente
   */
  public async fireNewCustomer(storeId: string, customerData: NewCustomerData): Promise<void> {
    if (!this.isEnabled) return;

    const event: AnalyticsWebhookEvent = {
      type: 'NEW_CUSTOMER',
      storeId,
      timestamp: new Date().toISOString(),
      data: customerData,
    };

    await this.sendWebhook(event);
  }

  /**
   * Dispara webhook cuando un cliente hace login
   */
  public async fireCustomerLogin(storeId: string, customerData: CustomerLoginData): Promise<void> {
    if (!this.isEnabled) return;

    const event: AnalyticsWebhookEvent = {
      type: 'CUSTOMER_LOGIN',
      storeId,
      timestamp: new Date().toISOString(),
      data: customerData,
    };

    await this.sendWebhook(event);
  }

  /**
   * Envía el webhook a la API de analíticas
   */
  private async sendWebhook(event: AnalyticsWebhookEvent): Promise<void> {
    try {
      // Construir URL absoluta para el servidor
      const baseUrl = this.getBaseUrl();
      const fullUrl = `${baseUrl}${this.webhookUrl}`;

      // Generar JWT token para autenticación
      const jwtToken = AnalyticsWebhookJWTAuth.generateToken(event.storeId, event.type);

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      logger.error(`[Analytics Webhook] Failed to send webhook for ${event.type}`, error, 'AnalyticsWebhook');
      // No re-lanzamos el error para no afectar el flujo principal
    }
  }

  /**
   * Obtiene la URL base según el entorno
   */
  private getBaseUrl(): string {
    if (process.env.APP_ENV === 'production') {
      return process.env.APP_URL || 'https://fasttify.com';
    }

    return 'http://localhost:3000';
  }

  /**
   * Habilita o deshabilita el servicio
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Verifica si el servicio está habilitado
   */
  public isServiceEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Configura la URL del webhook
   */
  public setWebhookUrl(url: string): void {
    this.webhookUrl = url;
  }
}

// Instancia singleton exportada
export const analyticsWebhookService = AnalyticsWebhookService.getInstance();
