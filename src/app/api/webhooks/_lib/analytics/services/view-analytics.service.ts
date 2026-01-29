import { analyticsRepository } from '@/api/webhooks/_lib/analytics/repositories/analytics.repository';
import { conversionMetricsService } from '@/api/webhooks/_lib/analytics/services/conversion-metrics.service';
import { detailedMetricsService } from '@/api/webhooks/_lib/analytics/services/detailed-metrics.service';

export class ViewAnalyticsService {
  /**
   * Registra una vista de tienda:
   * - Calcula métricas de conversión y de detalle (dispositivo, país, navegador...).
   * - Valida ambas y actualiza el registro diario.
   */
  async onStoreView(storeId: string, viewData: any): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const analytics = await analyticsRepository.getOrCreateAnalytics(storeId, today);
    const conversionMetrics = await conversionMetricsService.calculateStoreViewMetrics(viewData, analytics);
    const detailedMetrics = await detailedMetricsService.calculateDetailedStoreViewMetrics(viewData, analytics);
    const allMetrics = { ...conversionMetrics, ...detailedMetrics };
    if (!conversionMetricsService.validateConversionMetrics(conversionMetrics))
      throw new Error('Invalid conversion metrics detected for store view');
    if (!detailedMetricsService.validateDetailedMetrics(detailedMetrics))
      throw new Error('Invalid detailed metrics detected for store view');
    await analyticsRepository.updateAnalytics(analytics.id, allMetrics);
  }
}

export const viewAnalyticsService = new ViewAnalyticsService();
