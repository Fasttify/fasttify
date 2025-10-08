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

import { AnalyticsWebhookEventSchema } from '@/api/webhooks/_lib/analytics/types/analytics-webhook.types';
import type {
  OrderCreatedData,
  OrderCancelledData,
  OrderRefundedData,
  InventoryLowData,
  InventoryOutData,
  NewCustomerData,
  CustomerLoginData,
} from '@/api/webhooks/_lib/analytics/types/analytics-webhook.types';
import { orderAnalyticsService } from '@/api/webhooks/_lib/analytics/services/order-analytics.service';
import { inventoryAnalyticsService } from '@/api/webhooks/_lib/analytics/services/inventory-analytics.service';
import { customerAnalyticsService } from '@/api/webhooks/_lib/analytics/services/customer-analytics.service';
import { viewAnalyticsService } from '@/api/webhooks/_lib/analytics/services/view-analytics.service';

/**
 * Fachada de actualización de analíticas.
 *
 * - Expone métodos de alto nivel por tipo de evento.
 * - Cada método delega la lógica a servicios de dominio especializados
 *   (órdenes, inventario, clientes, vistas) para mantener el SRP.
 * - Mantener esta clase delgada facilita pruebas y mantenimiento.
 */
export class AnalyticsUpdateService {
  /** Delegación: creación de orden */
  async updateOrderMetrics(storeId: string, orderData: OrderCreatedData): Promise<void> {
    await orderAnalyticsService.onOrderCreated(storeId, orderData);
  }
  /** Delegación: cancelación de orden */
  async updateOrderCancelledMetrics(storeId: string, orderData: OrderCancelledData): Promise<void> {
    await orderAnalyticsService.onOrderCancelled(storeId, orderData);
  }
  /** Delegación: reembolso de orden */
  async updateOrderRefundedMetrics(storeId: string, orderData: OrderRefundedData): Promise<void> {
    await orderAnalyticsService.onOrderRefunded(storeId, orderData);
  }
  /** Delegación: inventario bajo */
  async updateInventoryLowMetrics(storeId: string, inventoryData: InventoryLowData): Promise<void> {
    await inventoryAnalyticsService.onInventoryLow(storeId, inventoryData);
  }
  /** Delegación: inventario agotado */
  async updateInventoryOutMetrics(storeId: string, inventoryData: InventoryOutData): Promise<void> {
    await inventoryAnalyticsService.onInventoryOut(storeId, inventoryData);
  }
  /** Delegación: nuevo cliente */
  async updateNewCustomerMetrics(storeId: string, customerData: NewCustomerData): Promise<void> {
    await customerAnalyticsService.onNewCustomer(storeId, customerData);
  }
  /** Delegación: login de cliente */
  async updateCustomerLoginMetrics(storeId: string, customerData: CustomerLoginData): Promise<void> {
    await customerAnalyticsService.onCustomerLogin(storeId, customerData);
  }
  /** Delegación: vista de tienda */
  async updateStoreViewMetrics(storeId: string, viewData: any): Promise<void> {
    await viewAnalyticsService.onStoreView(storeId, viewData);
  }
  /**
   * Valida el payload del webhook (Zod). Devuelve estructura uniforme
   * para controlar flujo en el controlador antes de procesar métricas.
   */
  validateWebhookEvent(event: unknown): { isValid: boolean; errors: string[]; data?: any } {
    const result = AnalyticsWebhookEventSchema.safeParse(event);
    if (result.success) {
      return {
        isValid: true,
        errors: [],
        data: result.data,
      };
    }
    return {
      isValid: false,
      errors: result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
    };
  }
}
export const analyticsUpdateService = new AnalyticsUpdateService();
