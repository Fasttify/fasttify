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
import { logger } from '@/renderer-engine/lib/logger';
import type { OrderCreatedData, NewCustomerData, CustomerLoginData } from '../types/analytics-webhook.types';

/**
 * Servicio especializado para métricas de clientes
 */
export class CustomerMetricsService {
  /**
   * Calcula métricas de clientes para una nueva orden
   */
  async calculateOrderCustomerMetrics(
    orderData: OrderCreatedData,
    currentAnalytics: any,
    storeId: string
  ): Promise<{
    newCustomers: number;
    returningCustomers: number;
    totalCustomers: number;
  }> {
    if (!orderData.customerId) {
      return { newCustomers: 0, returningCustomers: 0, totalCustomers: 0 };
    }

    if (orderData.customerType === 'guest') {
      // Cliente invitado - no contamos en métricas de clientes registrados
      // pero SÍ se procesa para otras métricas (conversión, ingresos, etc.)
      return { newCustomers: 0, returningCustomers: 0, totalCustomers: 0 };
    }

    try {
      const isNewCustomer = await this.isNewCustomer(orderData.customerId, storeId);

      const currentNewCustomers = currentAnalytics.newCustomers || 0;
      const currentReturningCustomers = currentAnalytics.returningCustomers || 0;
      const currentTotalCustomers = currentAnalytics.totalCustomers || 0;

      if (isNewCustomer) {
        const newMetrics = {
          newCustomers: currentNewCustomers + 1,
          returningCustomers: currentReturningCustomers,
          totalCustomers: currentTotalCustomers + 1,
        };
        return newMetrics;
      } else {
        // Cliente recurrente - solo incrementar si es la primera compra del día
        // Verificar si ya se contó como recurrente hoy
        const hasReturnedToday = await this.hasCustomerReturnedToday(orderData.customerId, storeId);

        const returningMetrics = {
          newCustomers: currentNewCustomers,
          returningCustomers: hasReturnedToday ? currentReturningCustomers : currentReturningCustomers + 1,
          totalCustomers: currentTotalCustomers,
        };

        return returningMetrics;
      }
    } catch (error) {
      logger.error(`[CustomerMetricsService] Error calculating order customer metrics:`, error);
      return {
        newCustomers: (currentAnalytics.newCustomers || 0) + 1,
        returningCustomers: currentAnalytics.returningCustomers || 0,
        totalCustomers: (currentAnalytics.totalCustomers || 0) + 1,
      };
    }
  }

  /**
   * Calcula métricas de clientes nuevos
   */
  async calculateNewCustomerMetrics(customerData: NewCustomerData, currentAnalytics: any) {
    if (customerData.customerType !== 'registered') {
      return {
        newCustomers: 0,
        totalCustomers: 0,
      };
    }

    const currentNewCustomers = currentAnalytics.newCustomers || 0;
    const currentTotalCustomers = currentAnalytics.totalCustomers || 0;

    const newMetrics = {
      newCustomers: currentNewCustomers + 1,
      totalCustomers: currentTotalCustomers + 1,
    };

    return newMetrics;
  }

  /**
   * Calcula métricas de login de clientes
   */
  async calculateCustomerLoginMetrics(customerData: CustomerLoginData, currentAnalytics: any) {
    const currentReturningCustomers = currentAnalytics.returningCustomers || 0;
    const loginMetrics = {
      returningCustomers: currentReturningCustomers + 1,
    };

    return loginMetrics;
  }

  /**
   * Valida que las métricas de clientes sean correctas
   */
  validateCustomerMetrics(metrics: any): boolean {
    // Validaciones básicas
    if (metrics.newCustomers < 0) {
      logger.warn(`[CustomerMetricsService] Invalid newCustomers: ${metrics.newCustomers}`);
      return false;
    }
    if (metrics.returningCustomers < 0) {
      logger.warn(`[CustomerMetricsService] Invalid returningCustomers: ${metrics.returningCustomers}`);
      return false;
    }
    if (metrics.totalCustomers < 0) {
      logger.warn(`[CustomerMetricsService] Invalid totalCustomers: ${metrics.totalCustomers}`);
      return false;
    }

    // Validación lógica: totalCustomers no puede ser menor que newCustomers
    if (metrics.totalCustomers < metrics.newCustomers) {
      logger.warn(
        `[CustomerMetricsService] totalCustomers (${metrics.totalCustomers}) cannot be less than newCustomers (${metrics.newCustomers})`
      );
      return false;
    }

    // Validación adicional: totalCustomers debe ser al menos newCustomers
    // (returningCustomers no necesariamente incrementan totalCustomers ya que fueron contados antes)
    if (metrics.totalCustomers < (metrics.newCustomers || 0)) {
      logger.warn(
        `[CustomerMetricsService] totalCustomers (${metrics.totalCustomers}) should be at least newCustomers (${metrics.newCustomers})`
      );
      return false;
    }

    return true;
  }

  /**
   * Determina si un cliente es nuevo basado en su historial de órdenes en la tienda específica
   */
  async isNewCustomer(customerEmail: string, storeId: string): Promise<boolean> {
    try {
      const previousOrders = await cookiesClient.models.Order.listOrderByCustomerEmail(
        {
          customerEmail,
        },
        {
          limit: 1,
          filter: {
            storeId: { eq: storeId },
          },
        }
      );

      const isNew = !previousOrders.data || previousOrders.data.length === 0;
      return isNew;
    } catch (error) {
      logger.error(`[CustomerMetricsService] Error checking if customer is new:`, error);
      // En caso de error, asumir que es cliente nuevo para no bloquear el proceso
      return true;
    }
  }

  /**
   * Verifica si un cliente recurrente ya fue contado hoy
   */
  async hasCustomerReturnedToday(customerEmail: string, storeId: string): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Buscar órdenes del cliente en esta tienda hoy
      const todayOrders = await cookiesClient.models.Order.listOrderByCustomerEmail(
        {
          customerEmail,
        },
        {
          filter: {
            storeId: { eq: storeId },
            createdAt: {
              beginsWith: today,
            },
          },
          limit: 2, // Necesitamos al menos 2 para saber si ya compró hoy
        }
      );

      // Si hay más de 1 orden hoy, ya fue contado como recurrente
      const hasMultipleOrdersToday = (todayOrders.data?.length || 0) > 1;

      return hasMultipleOrdersToday;
    } catch (error) {
      logger.error(`[CustomerMetricsService] Error checking if customer returned today:`, error);
      return false; // En caso de error, asumir que no fue contado
    }
  }

  /**
   * Calcula métricas de retención de clientes
   */
  calculateCustomerRetentionMetrics(analytics: any): {
    retentionRate: number;
    newCustomerRate: number;
    returningCustomerRate: number;
  } {
    const totalCustomers = analytics.totalCustomers || 0;
    const newCustomers = analytics.newCustomers || 0;
    const returningCustomers = analytics.returningCustomers || 0;

    if (totalCustomers === 0) {
      return {
        retentionRate: 0,
        newCustomerRate: 0,
        returningCustomerRate: 0,
      };
    }

    const retentionRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;
    const newCustomerRate = (newCustomers / totalCustomers) * 100;
    const returningCustomerRate = (returningCustomers / totalCustomers) * 100;

    return {
      retentionRate: Math.round(retentionRate * 100) / 100,
      newCustomerRate: Math.round(newCustomerRate * 100) / 100,
      returningCustomerRate: Math.round(returningCustomerRate * 100) / 100,
    };
  }
}

export const customerMetricsService = new CustomerMetricsService();
