import type {
  InventoryLowData,
  InventoryOutData,
} from '@/app/api/webhooks/_lib/analytics/types/analytics-webhook.types';
import { analyticsRepository } from '@/app/api/webhooks/_lib/analytics/repositories/analytics.repository';
import { inventoryMetricsService } from '@/app/api/webhooks/_lib/analytics/services/inventory-metrics.service';

export class InventoryAnalyticsService {
  /**
   * Registra eventos de stock bajo y actualiza métricas relacionadas.
   */
  async onInventoryLow(storeId: string, inventoryData: InventoryLowData): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const analytics = await analyticsRepository.getOrCreateAnalytics(storeId, today);
    const inventoryMetrics = await inventoryMetricsService.calculateInventoryLowMetrics(inventoryData, analytics);
    if (!inventoryMetricsService.validateInventoryMetrics(inventoryMetrics))
      throw new Error('Invalid inventory metrics detected for low stock');
    await analyticsRepository.updateAnalytics(analytics.id, inventoryMetrics);
  }

  /**
   * Registra eventos de stock agotado y actualiza métricas relacionadas.
   */
  async onInventoryOut(storeId: string, inventoryData: InventoryOutData): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const analytics = await analyticsRepository.getOrCreateAnalytics(storeId, today);
    const inventoryMetrics = await inventoryMetricsService.calculateInventoryOutMetrics(inventoryData, analytics);
    if (!inventoryMetricsService.validateInventoryMetrics(inventoryMetrics))
      throw new Error('Invalid inventory metrics detected for out of stock');
    await analyticsRepository.updateAnalytics(analytics.id, inventoryMetrics);
  }
}

export const inventoryAnalyticsService = new InventoryAnalyticsService();
