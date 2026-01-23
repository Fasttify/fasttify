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

/**
 * Servicio especializado para métricas de conversión
 * Utiliza datos reales de tracking para cálculos precisos
 */
export class ConversionMetricsService {
  /**
   * Calcula el conversion rate basado en órdenes y visitas reales
   * @param orders - Número total de órdenes
   * @param storeViews - Número de visitas a la tienda (datos reales)
   * @returns Conversion rate como porcentaje
   */
  calculateConversionRate(orders: number, storeViews: number): number {
    if (storeViews === 0) {
      // Si no hay vistas registradas, no podemos calcular conversión real
      return 0;
    }

    const conversionRate = (orders / storeViews) * 100;

    // Limitar el conversion rate a un máximo realista del 25%
    // Esto evita valores irreales cuando hay pocas vistas pero muchas órdenes
    return Math.min(conversionRate, 25);
  }

  /**
   * Calcula el conversion rate optimizado usando datos históricos
   */
  calculateOptimizedConversionRate(orders: number, storeViews: number, historicalData?: any): number {
    const currentConversion = this.calculateConversionRate(orders, storeViews);

    // Si no hay datos históricos, usar solo datos actuales
    if (!historicalData || !historicalData.avgConversionRate) {
      return currentConversion;
    }

    const avgHistoricalConversion = historicalData.avgConversionRate;

    // Promedio ponderado: 80% datos actuales, 20% históricos
    // Esto da más peso a los datos actuales pero suaviza fluctuaciones
    return currentConversion * 0.8 + avgHistoricalConversion * 0.2;
  }

  /**
   * Calcula métricas de conversión para una nueva orden
   */
  async calculateOrderConversionMetrics(orderData: any, currentAnalytics: any) {
    const newTotalOrders = currentAnalytics.totalOrders + 1;
    const newConversionRate = this.calculateConversionRate(newTotalOrders, currentAnalytics.storeViews);

    return {
      conversionRate: newConversionRate,
    };
  }

  /**
   * Calcula métricas de conversión cuando se cancela una orden
   */
  async calculateOrderCancelledConversionMetrics(orderData: any, currentAnalytics: any) {
    const newTotalOrders = Math.max(0, currentAnalytics.totalOrders - 1);
    const newConversionRate = this.calculateConversionRate(newTotalOrders, currentAnalytics.storeViews);

    return {
      conversionRate: newConversionRate,
    };
  }

  /**
   * Actualiza las métricas de visitas a la tienda
   */
  calculateStoreViewsMetrics(currentAnalytics: any, additionalViews: number = 1) {
    return {
      storeViews: currentAnalytics.storeViews + additionalViews,
    };
  }

  /**
   * Calcula métricas para una vista de tienda usando datos reales
   */
  async calculateStoreViewMetrics(viewData: any, currentAnalytics: any) {
    // Asegurar que storeViews no sea null/undefined
    const currentStoreViews = currentAnalytics.storeViews || 0;
    const totalOrders = currentAnalytics.totalOrders || 0;

    const newStoreViews = currentStoreViews + 1;

    // Calcular conversión basada en vistas totales
    const conversionRate = this.calculateConversionRate(totalOrders, newStoreViews);

    return {
      storeViews: newStoreViews,
      conversionRate: conversionRate,
    };
  }

  /**
   * Valida que las métricas de conversión sean correctas
   */
  validateConversionMetrics(metrics: any): boolean {
    // Validaciones básicas
    if (metrics.conversionRate < 0 || metrics.conversionRate > 100) {
      return false;
    }
    if (metrics.storeViews < 0) {
      return false;
    }

    return true;
  }

  /**
   * Determina el nivel de conversión basado en estándares reales de e-commerce
   */
  getConversionLevel(conversionRate: number): 'low' | 'medium' | 'high' {
    // Estándares reales de e-commerce:
    // Bajo: < 1% (típico para la mayoría de sitios)
    // Medio: 1-3% (bueno para e-commerce)
    // Alto: > 3% (excelente, top performers)
    if (conversionRate < 1) return 'low';
    if (conversionRate < 3) return 'medium';
    return 'high';
  }

  /**
   * Calcula el conversion rate promedio por período
   */
  calculateAverageConversionRate(conversionRates: number[]): number {
    if (conversionRates.length === 0) return 0;

    const sum = conversionRates.reduce((acc, rate) => acc + rate, 0);
    return sum / conversionRates.length;
  }

  /**
   * Obtiene recomendaciones básicas basadas en el nivel de conversión
   */
  getConversionRecommendations(conversionRate: number): string[] {
    const level = this.getConversionLevel(conversionRate);
    const recommendations: string[] = [];

    switch (level) {
      case 'low':
        recommendations.push(
          'Mejorar la experiencia de usuario en móviles',
          'Optimizar la velocidad de carga',
          'Simplificar el proceso de checkout',
          'Añadir testimonios y reseñas'
        );
        break;
      case 'medium':
        recommendations.push(
          'Implementar A/B testing',
          'Optimizar la página de producto',
          'Mejorar el diseño del carrito',
          'Añadir chat en vivo'
        );
        break;
      case 'high':
        recommendations.push(
          'Mantener las estrategias actuales',
          'Expandir a nuevos canales',
          'Optimizar para clientes de mayor valor',
          'Implementar programas de fidelización'
        );
        break;
    }

    return recommendations;
  }

  /**
   * Calcula la conversión por dispositivo (función simple)
   */
  calculateDeviceConversion(
    deviceSessions: Record<string, number>,
    deviceOrders: Record<string, number>
  ): Record<string, number> {
    const deviceConversion: Record<string, number> = {};

    for (const device in deviceSessions) {
      const sessions = deviceSessions[device] || 0;
      const orders = deviceOrders[device] || 0;
      deviceConversion[device] = this.calculateConversionRate(orders, sessions);
    }

    return deviceConversion;
  }
}

export const conversionMetricsService = new ConversionMetricsService();
