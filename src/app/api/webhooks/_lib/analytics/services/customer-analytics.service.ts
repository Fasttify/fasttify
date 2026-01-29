import type { CustomerLoginData, NewCustomerData } from '@/api/webhooks/_lib/analytics/types/analytics-webhook.types';
import { analyticsRepository } from '@/api/webhooks/_lib/analytics/repositories/analytics.repository';
import { customerMetricsService } from '@/api/webhooks/_lib/analytics/services/customer-metrics.service';

export class CustomerAnalyticsService {
  /**
   * Registra un cliente nuevo y actualiza métricas de cohortes y totales.
   */
  async onNewCustomer(storeId: string, customerData: NewCustomerData): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const analytics = await analyticsRepository.getOrCreateAnalytics(storeId, today);
    const customerMetrics = await customerMetricsService.calculateNewCustomerMetrics(customerData, analytics);
    if (!customerMetricsService.validateCustomerMetrics(customerMetrics))
      throw new Error('Invalid customer metrics detected for new customer');
    await analyticsRepository.updateAnalytics(analytics.id, customerMetrics);
  }

  /**
   * Registra un login de cliente y actualiza métricas de actividad.
   */
  async onCustomerLogin(storeId: string, customerData: CustomerLoginData): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const analytics = await analyticsRepository.getOrCreateAnalytics(storeId, today);
    const customerMetrics = await customerMetricsService.calculateCustomerLoginMetrics(customerData, analytics);
    if (!customerMetricsService.validateCustomerMetrics(customerMetrics))
      throw new Error('Invalid customer metrics detected for customer login');
    await analyticsRepository.updateAnalytics(analytics.id, customerMetrics);
  }
}

export const customerAnalyticsService = new CustomerAnalyticsService();
