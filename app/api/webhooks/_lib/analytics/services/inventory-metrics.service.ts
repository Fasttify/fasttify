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
  InventoryLowData,
  InventoryOutData,
} from '@/app/api/webhooks/_lib/analytics/types/analytics-webhook.types';

/**
 * Servicio especializado para métricas de inventario
 */
export class InventoryMetricsService {
  /**
   * Calcula métricas de inventario bajo
   */
  async calculateInventoryLowMetrics(inventoryData: InventoryLowData, currentAnalytics: any) {
    return {
      lowStockAlerts: currentAnalytics.lowStockAlerts + 1,
    };
  }

  /**
   * Calcula métricas de inventario agotado
   */
  async calculateInventoryOutMetrics(inventoryData: InventoryOutData, currentAnalytics: any) {
    return {
      outOfStockProducts: currentAnalytics.outOfStockProducts + 1,
    };
  }

  /**
   * Valida que las métricas de inventario sean correctas
   */
  validateInventoryMetrics(metrics: any): boolean {
    // Validaciones básicas
    if (metrics.lowStockAlerts < 0) return false;
    if (metrics.outOfStockProducts < 0) return false;

    return true;
  }

  /**
   * Calcula el porcentaje de productos con inventario bajo
   */
  calculateLowStockPercentage(lowStockAlerts: number, totalProducts: number): number {
    if (totalProducts === 0) return 0;
    return (lowStockAlerts / totalProducts) * 100;
  }

  /**
   * Calcula el porcentaje de productos agotados
   */
  calculateOutOfStockPercentage(outOfStockProducts: number, totalProducts: number): number {
    if (totalProducts === 0) return 0;
    return (outOfStockProducts / totalProducts) * 100;
  }

  /**
   * Determina si el inventario está en estado crítico
   */
  isInventoryCritical(lowStockPercentage: number, outOfStockPercentage: number): boolean {
    const CRITICAL_LOW_STOCK_THRESHOLD = 20; // 20% de productos con inventario bajo
    const CRITICAL_OUT_OF_STOCK_THRESHOLD = 10; // 10% de productos agotados

    return (
      lowStockPercentage >= CRITICAL_LOW_STOCK_THRESHOLD || outOfStockPercentage >= CRITICAL_OUT_OF_STOCK_THRESHOLD
    );
  }
}

export const inventoryMetricsService = new InventoryMetricsService();
