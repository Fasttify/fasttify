import type { InventoryLowData, InventoryOutData } from '@/api/webhooks/_lib/analytics/types/analytics-webhook.types';
import { analyticsRepository } from '@/api/webhooks/_lib/analytics/repositories/analytics.repository';

export class InventoryAnalyticsService {
  /**
   * Registra eventos de stock bajo y actualiza métricas relacionadas.
   */
  async onInventoryLow(storeId: string, _inventoryData: InventoryLowData): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const analytics = await analyticsRepository.getOrCreateAnalytics(storeId, today);

    const updates = {
      lowStockAlerts: (analytics.lowStockAlerts || 0) + 1,
    };

    await analyticsRepository.updateAnalytics(analytics.id, updates);
  }

  /**
   * Registra eventos de stock agotado y actualiza métricas relacionadas.
   */
  async onInventoryOut(storeId: string, _inventoryData: InventoryOutData): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const analytics = await analyticsRepository.getOrCreateAnalytics(storeId, today);

    const updates = {
      outOfStockProducts: (analytics.outOfStockProducts || 0) + 1,
    };

    await analyticsRepository.updateAnalytics(analytics.id, updates);
  }
}

export const inventoryAnalyticsService = new InventoryAnalyticsService();
