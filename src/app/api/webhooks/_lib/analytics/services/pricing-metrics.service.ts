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

import type {
  OrderCreatedData,
  OrderCancelledData,
  OrderRefundedData,
} from '@/api/webhooks/_lib/analytics/types/analytics-webhook.types';

/**
 * Servicio especializado para métricas de precios y revenue
 */
export class PricingMetricsService {
  /**
   * Calcula métricas de precios para una nueva orden
   */
  async calculateOrderPricingMetrics(orderData: OrderCreatedData, currentAnalytics: any) {
    const totalProductsSold = orderData.items.reduce((sum, item) => sum + item.quantity, 0);

    // Calcular valores finales
    const newTotalRevenue = currentAnalytics.totalRevenue + orderData.totalAmount;
    const newTotalOrders = currentAnalytics.totalOrders + 1;
    const newAverageOrderValue = newTotalRevenue / newTotalOrders;

    // Calcular métricas de descuentos
    const newTotalDiscounts = currentAnalytics.totalDiscounts + (orderData.discountAmount || 0);
    const newDiscountPercentage = newTotalRevenue > 0 ? (newTotalDiscounts / newTotalRevenue) * 100 : 0;

    return {
      totalRevenue: newTotalRevenue,
      totalOrders: newTotalOrders,
      averageOrderValue: newAverageOrderValue,
      totalProductsSold: currentAnalytics.totalProductsSold + totalProductsSold,
      uniqueProductsSold:
        currentAnalytics.uniqueProductsSold + new Set(orderData.items.map((item) => item.productId)).size,
      totalDiscounts: newTotalDiscounts,
      discountPercentage: newDiscountPercentage,
    };
  }

  /**
   * Calcula métricas de precios cuando se cancela una orden
   */
  async calculateOrderCancelledMetrics(orderData: OrderCancelledData, currentAnalytics: any) {
    const newTotalRevenue = Math.max(0, currentAnalytics.totalRevenue - orderData.totalAmount);
    const newTotalOrders = Math.max(0, currentAnalytics.totalOrders - 1);
    const newAverageOrderValue = newTotalOrders > 0 ? newTotalRevenue / newTotalOrders : 0;

    return {
      totalRevenue: newTotalRevenue,
      totalOrders: newTotalOrders,
      averageOrderValue: newAverageOrderValue,
    };
  }

  /**
   * Calcula métricas de precios cuando se procesa un reembolso
   */
  async calculateOrderRefundedMetrics(orderData: OrderRefundedData, currentAnalytics: any) {
    const newTotalRevenue = Math.max(0, currentAnalytics.totalRevenue - orderData.refundAmount);

    return {
      totalRevenue: newTotalRevenue,
    };
  }

  /**
   * Valida que los cálculos de precios sean correctos
   */
  validatePricingCalculations(metrics: any): boolean {
    // Validaciones básicas
    if (metrics.totalRevenue < 0) return false;
    if (metrics.totalOrders < 0) return false;
    if (metrics.averageOrderValue < 0) return false;
    if (metrics.totalProductsSold < 0) return false;
    if (metrics.uniqueProductsSold < 0) return false;
    if (metrics.totalDiscounts < 0) return false;
    if (metrics.discountPercentage < 0 || metrics.discountPercentage > 100) return false;

    // Validación de AOV
    if (metrics.totalOrders > 0 && metrics.totalRevenue > 0) {
      const expectedAOV = metrics.totalRevenue / metrics.totalOrders;
      const tolerance = 0.01; // 1 centavo de tolerancia
      if (Math.abs(metrics.averageOrderValue - expectedAOV) > tolerance) {
        return false;
      }
    }

    return true;
  }
}

export const pricingMetricsService = new PricingMetricsService();
