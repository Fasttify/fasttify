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

import { logger } from '@/liquid-forge';

export interface DetailedMetricsUpdate {
  sessionsByCountry?: Record<string, number>;
  sessionsByDevice?: Record<string, number>;
  sessionsByBrowser?: Record<string, number>;
  sessionsByReferrer?: Record<string, number>;
  uniqueVisitors?: number;
  totalSessions?: number;
}

export class DetailedMetricsService {
  /**
   * Helper para parsear datos JSON de la base de datos
   */
  private parseJsonField(field: any): Record<string, number> {
    if (!field || field === null) return {};
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch (error) {
        logger.error('[DetailedMetrics] Error parsing JSON field:', error, 'DetailedMetrics');
        return {};
      }
    }
    if (typeof field === 'object') {
      return field;
    }
    return {};
  }

  /**
   * Calcula métricas detalladas para una vista de tienda
   */
  async calculateDetailedStoreViewMetrics(viewData: any, currentAnalytics: any): Promise<DetailedMetricsUpdate> {
    try {
      const updates: DetailedMetricsUpdate = {};

      // 1. Actualizar sesiones por país
      if (viewData.country) {
        updates.sessionsByCountry = this.updateCountryMetrics(
          this.parseJsonField(currentAnalytics.sessionsByCountry),
          viewData.country
        );
      }

      // 2. Actualizar sesiones por dispositivo
      if (viewData.deviceType) {
        updates.sessionsByDevice = this.updateDeviceMetrics(
          this.parseJsonField(currentAnalytics.sessionsByDevice),
          viewData.deviceType
        );
      }

      // 3. Actualizar sesiones por navegador
      if (viewData.browser) {
        updates.sessionsByBrowser = this.updateBrowserMetrics(
          this.parseJsonField(currentAnalytics.sessionsByBrowser),
          viewData.browser
        );
      }

      // 4. Actualizar sesiones por referrer
      if (viewData.referrerCategory) {
        updates.sessionsByReferrer = this.updateReferrerMetrics(
          this.parseJsonField(currentAnalytics.sessionsByReferrer),
          viewData.referrerCategory
        );
      }

      // 5. Incrementar contadores generales
      updates.totalSessions = (currentAnalytics.totalSessions || 0) + 1;

      // Para uniqueVisitors, por ahora incrementamos (más adelante podemos usar cookies/session storage)
      updates.uniqueVisitors = (currentAnalytics.uniqueVisitors || 0) + 1;

      return updates;
    } catch (error) {
      logger.error('[DetailedMetrics] Error calculating detailed metrics:', error, 'DetailedMetrics');
      throw error;
    }
  }

  /**
   * Actualiza métricas por país
   */
  private updateCountryMetrics(current: Record<string, number>, country: string): Record<string, number> {
    const updated = { ...current };
    updated[country] = (updated[country] || 0) + 1;
    return updated;
  }

  /**
   * Actualiza métricas por dispositivo
   */
  private updateDeviceMetrics(current: Record<string, number>, deviceType: string): Record<string, number> {
    const updated = { ...current };
    updated[deviceType] = (updated[deviceType] || 0) + 1;
    return updated;
  }

  /**
   * Actualiza métricas por navegador
   */
  private updateBrowserMetrics(current: Record<string, number>, browser: string): Record<string, number> {
    const updated = { ...current };
    updated[browser] = (updated[browser] || 0) + 1;
    return updated;
  }

  /**
   * Actualiza métricas por referrer
   */
  private updateReferrerMetrics(current: Record<string, number>, referrerCategory: string): Record<string, number> {
    const updated = { ...current };
    updated[referrerCategory] = (updated[referrerCategory] || 0) + 1;
    return updated;
  }

  /**
   * Valida que las métricas detalladas sean correctas
   */
  validateDetailedMetrics(metrics: DetailedMetricsUpdate): boolean {
    try {
      // Validar que los valores sean números positivos
      const validateRecord = (record: Record<string, number> | undefined) => {
        if (!record) return true;
        return Object.values(record).every((value) => typeof value === 'number' && value >= 0);
      };

      if (!validateRecord(metrics.sessionsByCountry)) return false;
      if (!validateRecord(metrics.sessionsByDevice)) return false;
      if (!validateRecord(metrics.sessionsByBrowser)) return false;
      if (!validateRecord(metrics.sessionsByReferrer)) return false;

      // Validar contadores generales
      if (
        metrics.uniqueVisitors !== undefined &&
        (typeof metrics.uniqueVisitors !== 'number' || metrics.uniqueVisitors < 0)
      ) {
        return false;
      }
      if (
        metrics.totalSessions !== undefined &&
        (typeof metrics.totalSessions !== 'number' || metrics.totalSessions < 0)
      ) {
        return false;
      }

      return true;
    } catch (error) {
      logger.error('[DetailedMetrics] Error validating detailed metrics:', error, 'DetailedMetrics');
      return false;
    }
  }
}

export const detailedMetricsService = new DetailedMetricsService();
