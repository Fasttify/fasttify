import type {
  OrderCancelledData,
  OrderCreatedData,
  OrderRefundedData,
} from '@/app/api/webhooks/_lib/analytics/types/analytics-webhook.types';
import { analyticsRepository } from '@/app/api/webhooks/_lib/analytics/repositories/analytics.repository';
import { pricingMetricsService } from '@/app/api/webhooks/_lib/analytics/services/pricing-metrics.service';
import { customerMetricsService } from '@/app/api/webhooks/_lib/analytics/services/customer-metrics.service';
import { conversionMetricsService } from '@/app/api/webhooks/_lib/analytics/services/conversion-metrics.service';
import { inventoryStockService } from '@/app/api/webhooks/_lib/inventory/services/inventory-stock.service';

export class OrderAnalyticsService {
  /**
   * Maneja ORDER_CREATED:
   * - Descuenta inventario (efecto secundario).
   * - Calcula métricas de precio, cliente y conversión.
   * - Valida resultados y actualiza el registro diario.
   */
  async onOrderCreated(storeId: string, orderData: OrderCreatedData): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const analytics = await analyticsRepository.getOrCreateAnalytics(storeId, today);
    try {
      await inventoryStockService.decrementOnOrderCreated(storeId, orderData);
    } catch (error) {
      console.warn('[OrderAnalyticsService] Inventory decrement failed (ORDER_CREATED)', error);
    }
    const pricingMetrics = await pricingMetricsService.calculateOrderPricingMetrics(orderData, analytics);
    const customerMetrics = await customerMetricsService.calculateOrderCustomerMetrics(orderData, analytics, storeId);
    const conversionMetrics = await conversionMetricsService.calculateOrderConversionMetrics(orderData, analytics);
    if (!pricingMetricsService.validatePricingCalculations(pricingMetrics))
      throw new Error('Invalid pricing calculations detected');
    if (!customerMetricsService.validateCustomerMetrics(customerMetrics))
      throw new Error('Invalid customer metrics detected');
    if (!conversionMetricsService.validateConversionMetrics(conversionMetrics))
      throw new Error('Invalid conversion metrics detected');
    await analyticsRepository.updateAnalytics(analytics.id, {
      ...pricingMetrics,
      newCustomers: (analytics.newCustomers || 0) + customerMetrics.newCustomers,
      returningCustomers: (analytics.returningCustomers || 0) + customerMetrics.returningCustomers,
      totalCustomers: (analytics.totalCustomers || 0) + customerMetrics.totalCustomers,
      conversionRate: conversionMetrics.conversionRate,
    });
  }

  /**
   * Maneja ORDER_CANCELLED:
   * - Repone inventario cuando aplica.
   * - Recalcula impacto en pricing y conversión y actualiza el registro.
   */
  async onOrderCancelled(storeId: string, orderData: OrderCancelledData): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const analytics = await analyticsRepository.getOrCreateAnalytics(storeId, today);
    try {
      await inventoryStockService.incrementOnOrderCancelled(storeId, orderData as any);
    } catch (error) {
      console.warn('[OrderAnalyticsService] Inventory increment failed (ORDER_CANCELLED)', error);
    }
    const pricingMetrics = await pricingMetricsService.calculateOrderCancelledMetrics(orderData, analytics);
    const conversionMetrics = await conversionMetricsService.calculateOrderCancelledConversionMetrics(
      orderData,
      analytics
    );
    if (!pricingMetricsService.validatePricingCalculations(pricingMetrics))
      throw new Error('Invalid pricing calculations detected for cancelled order');
    if (!conversionMetricsService.validateConversionMetrics(conversionMetrics))
      throw new Error('Invalid conversion metrics detected for cancelled order');
    await analyticsRepository.updateAnalytics(analytics.id, {
      ...pricingMetrics,
      conversionRate: conversionMetrics.conversionRate,
    });
  }

  /**
   * Maneja ORDER_REFUNDED:
   * - Recalcula pricing y actualiza el registro.
   */
  async onOrderRefunded(storeId: string, orderData: OrderRefundedData): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const analytics = await analyticsRepository.getOrCreateAnalytics(storeId, today);
    const pricingMetrics = await pricingMetricsService.calculateOrderRefundedMetrics(orderData, analytics);
    if (!pricingMetricsService.validatePricingCalculations(pricingMetrics))
      throw new Error('Invalid pricing calculations detected for refunded order');
    await analyticsRepository.updateAnalytics(analytics.id, pricingMetrics);
  }
}

export const orderAnalyticsService = new OrderAnalyticsService();
