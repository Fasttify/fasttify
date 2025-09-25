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

import { cookiesClient } from '@/utils/server/AmplifyServer';
import { AnalyticsWebhookEventSchema } from '../types/analytics-webhook.types';
import type {
  OrderCreatedData,
  OrderCancelledData,
  OrderRefundedData,
  InventoryLowData,
  InventoryOutData,
  NewCustomerData,
  CustomerLoginData,
} from '../types/analytics-webhook.types';
import { pricingMetricsService } from './pricing-metrics.service';
import { customerMetricsService } from './customer-metrics.service';
import { inventoryMetricsService } from './inventory-metrics.service';
import { conversionMetricsService } from './conversion-metrics.service';
import { detailedMetricsService } from './detailed-metrics.service';

/**
 * Servicio para actualizar analíticas en tiempo real mediante webhooks
 */
export class AnalyticsUpdateService {
  /**
   * Actualiza las métricas cuando se crea una nueva orden
   */
  async updateOrderMetrics(storeId: string, orderData: OrderCreatedData): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // Obtener o crear analytics del día
    const analytics = await this.getOrCreateAnalytics(storeId, today);

    // Calcular métricas usando servicios especializados
    const pricingMetrics = await pricingMetricsService.calculateOrderPricingMetrics(orderData, analytics);
    const customerMetrics = await customerMetricsService.calculateOrderCustomerMetrics(orderData, analytics, storeId);
    const conversionMetrics = await conversionMetricsService.calculateOrderConversionMetrics(orderData, analytics);

    // Validar métricas antes de actualizar
    if (!pricingMetricsService.validatePricingCalculations(pricingMetrics)) {
      throw new Error('Invalid pricing calculations detected');
    }

    if (!customerMetricsService.validateCustomerMetrics(customerMetrics)) {
      throw new Error('Invalid customer metrics detected');
    }

    if (!conversionMetricsService.validateConversionMetrics(conversionMetrics)) {
      throw new Error('Invalid conversion metrics detected');
    }

    // Actualizar métricas combinadas
    await this.updateAnalytics(analytics.id, {
      ...pricingMetrics,
      newCustomers: (analytics.newCustomers || 0) + customerMetrics.newCustomers,
      returningCustomers: (analytics.returningCustomers || 0) + customerMetrics.returningCustomers,
      totalCustomers: (analytics.totalCustomers || 0) + customerMetrics.totalCustomers,
      conversionRate: conversionMetrics.conversionRate,
    });
  }

  /**
   * Actualiza las métricas cuando se cancela una orden
   */
  async updateOrderCancelledMetrics(storeId: string, orderData: OrderCancelledData): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const analytics = await this.getOrCreateAnalytics(storeId, today);

    // Calcular métricas usando servicios especializados
    const pricingMetrics = await pricingMetricsService.calculateOrderCancelledMetrics(orderData, analytics);
    const conversionMetrics = await conversionMetricsService.calculateOrderCancelledConversionMetrics(
      orderData,
      analytics
    );

    // Validar métricas antes de actualizar
    if (!pricingMetricsService.validatePricingCalculations(pricingMetrics)) {
      throw new Error('Invalid pricing calculations detected for cancelled order');
    }

    if (!conversionMetricsService.validateConversionMetrics(conversionMetrics)) {
      throw new Error('Invalid conversion metrics detected for cancelled order');
    }

    await this.updateAnalytics(analytics.id, {
      ...pricingMetrics,
      conversionRate: conversionMetrics.conversionRate,
    });
  }

  /**
   * Actualiza las métricas cuando se procesa un reembolso
   */
  async updateOrderRefundedMetrics(storeId: string, orderData: OrderRefundedData): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const analytics = await this.getOrCreateAnalytics(storeId, today);

    // Calcular métricas usando servicios especializados
    const pricingMetrics = await pricingMetricsService.calculateOrderRefundedMetrics(orderData, analytics);

    // Validar métricas antes de actualizar
    if (!pricingMetricsService.validatePricingCalculations(pricingMetrics)) {
      throw new Error('Invalid pricing calculations detected for refunded order');
    }

    await this.updateAnalytics(analytics.id, pricingMetrics);
  }

  /**
   * Actualiza las métricas de inventario bajo
   */
  async updateInventoryLowMetrics(storeId: string, inventoryData: InventoryLowData): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const analytics = await this.getOrCreateAnalytics(storeId, today);

    // Calcular métricas usando servicios especializados
    const inventoryMetrics = await inventoryMetricsService.calculateInventoryLowMetrics(inventoryData, analytics);

    // Validar métricas antes de actualizar
    if (!inventoryMetricsService.validateInventoryMetrics(inventoryMetrics)) {
      throw new Error('Invalid inventory metrics detected for low stock');
    }

    await this.updateAnalytics(analytics.id, inventoryMetrics);
  }

  /**
   * Actualiza las métricas de inventario agotado
   */
  async updateInventoryOutMetrics(storeId: string, inventoryData: InventoryOutData): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const analytics = await this.getOrCreateAnalytics(storeId, today);

    // Calcular métricas usando servicios especializados
    const inventoryMetrics = await inventoryMetricsService.calculateInventoryOutMetrics(inventoryData, analytics);

    // Validar métricas antes de actualizar
    if (!inventoryMetricsService.validateInventoryMetrics(inventoryMetrics)) {
      throw new Error('Invalid inventory metrics detected for out of stock');
    }

    await this.updateAnalytics(analytics.id, inventoryMetrics);
  }

  /**
   * Actualiza las métricas de clientes nuevos
   */
  async updateNewCustomerMetrics(storeId: string, customerData: NewCustomerData): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const analytics = await this.getOrCreateAnalytics(storeId, today);

    // Calcular métricas usando servicios especializados
    const customerMetrics = await customerMetricsService.calculateNewCustomerMetrics(customerData, analytics);

    // Validar métricas antes de actualizar
    if (!customerMetricsService.validateCustomerMetrics(customerMetrics)) {
      throw new Error('Invalid customer metrics detected for new customer');
    }

    await this.updateAnalytics(analytics.id, customerMetrics);
  }

  /**
   * Actualiza las métricas de login de clientes
   */
  async updateCustomerLoginMetrics(storeId: string, customerData: CustomerLoginData): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const analytics = await this.getOrCreateAnalytics(storeId, today);

    // Calcular métricas usando servicios especializados
    const customerMetrics = await customerMetricsService.calculateCustomerLoginMetrics(customerData, analytics);

    // Validar métricas antes de actualizar
    if (!customerMetricsService.validateCustomerMetrics(customerMetrics)) {
      throw new Error('Invalid customer metrics detected for customer login');
    }

    await this.updateAnalytics(analytics.id, customerMetrics);
  }

  /**
   * Actualiza las métricas de vistas de tienda
   */
  async updateStoreViewMetrics(storeId: string, viewData: any): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const analytics = await this.getOrCreateAnalytics(storeId, today);

    // Calcular métricas de conversión básicas
    const conversionMetrics = await conversionMetricsService.calculateStoreViewMetrics(viewData, analytics);

    // Calcular métricas detalladas (dispositivo, país, navegador, etc.)
    const detailedMetrics = await detailedMetricsService.calculateDetailedStoreViewMetrics(viewData, analytics);

    // Combinar todas las métricas
    const allMetrics = {
      ...conversionMetrics,
      ...detailedMetrics,
    };

    // Validar métricas antes de actualizar
    if (!conversionMetricsService.validateConversionMetrics(conversionMetrics)) {
      throw new Error('Invalid conversion metrics detected for store view');
    }

    if (!detailedMetricsService.validateDetailedMetrics(detailedMetrics)) {
      throw new Error('Invalid detailed metrics detected for store view');
    }

    await this.updateAnalytics(analytics.id, allMetrics);
  }

  /**
   * Obtiene o crea analytics para un día específico
   */
  private async getOrCreateAnalytics(storeId: string, date: string) {
    // Buscar analytics existentes - usar índice simple y filtrar por fecha
    const existingResponse = await cookiesClient.models.StoreAnalytics.analyticsByStore({ storeId });

    // Filtrar por fecha en el cliente
    const existingAnalytics = existingResponse.data?.find((analytics) => analytics.date === date);

    if (existingAnalytics) {
      return existingAnalytics;
    }

    // Crear nuevos analytics
    const store = await cookiesClient.models.UserStore.get({ storeId });
    const storeOwner = store?.data?.userId;

    if (!storeOwner) {
      throw new Error(`Store owner not found for store ${storeId}`);
    }

    const createResponse = await cookiesClient.models.StoreAnalytics.create({
      storeId,
      storeOwner,
      date,
      period: 'daily',
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      newCustomers: 0,
      returningCustomers: 0,
      totalCustomers: 0,
      totalProductsSold: 0,
      uniqueProductsSold: 0,
      lowStockAlerts: 0,
      outOfStockProducts: 0,
      storeViews: 0,
      conversionRate: 0,
      totalDiscounts: 0,
      discountPercentage: 0,
      sessionsByCountry: null,
      sessionsByDevice: null,
      sessionsByBrowser: null,
      sessionsByReferrer: null,
      uniqueVisitors: 0,
      totalSessions: 0,
    });

    if (!createResponse.data) {
      throw new Error(`Failed to create analytics record: ${JSON.stringify(createResponse.errors)}`);
    }

    return createResponse.data;
  }

  /**
   * Actualiza analytics existentes
   */
  private async updateAnalytics(analyticsId: string, updates: Partial<any>) {
    // Convertir objetos JavaScript a JSON strings para campos JSON
    const processedUpdates: any = { ...updates };

    // Campos que deben ser convertidos a JSON
    const jsonFields = [
      'sessionsByCountry',
      'sessionsByDevice',
      'sessionsByBrowser',
      'sessionsByReferrer',
      'countries',
      'conversionRateByCountry',
      'uniqueVisitorsByCountry',
    ];

    for (const field of jsonFields) {
      if (processedUpdates[field] !== undefined) {
        if (processedUpdates[field] === null) {
          // Mantener null como null
          processedUpdates[field] = null;
        } else if (typeof processedUpdates[field] === 'object') {
          // Convertir objetos a JSON string
          processedUpdates[field] = JSON.stringify(processedUpdates[field]);
        }
        // Si es string, mantenerlo como está
      }
    }

    const result = await cookiesClient.models.StoreAnalytics.update({
      id: analyticsId,
      ...processedUpdates,
    });

    return result;
  }

  /**
   * Valida el evento del webhook usando Zod
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

// Instancia singleton del servicio
export const analyticsUpdateService = new AnalyticsUpdateService();
