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

import { logger } from '@/liquid-forge/lib/logger';
import { geolocationService } from '@/api/webhooks/_lib/track-visit/services/geolocation.service';
import { deviceDetectionService } from '@/api/webhooks/_lib/track-visit/services/device-detection.service';
import { AnalyticsWebhookJWTAuth } from '@/app/api/webhooks/_lib/middleware/jwt-auth.middleware';
import type { ServerViewData } from '@/api/webhooks/_lib/track-visit/types/track-visit.types';
import { ServerViewDataSchema } from '@/app/api/webhooks/_lib/track-visit/types/track-visit.types';

/**
 * Servicio para procesar y trackear visitas de tiendas
 */
export class TrackVisitService {
  /**
   * Procesa una visita de tienda con headers de Cloudflare
   */
  async processStoreVisitWithCloudflare(
    viewData: ServerViewData,
    headers: Record<string, string | string[] | undefined>
  ): Promise<void> {
    try {
      // 1. Obtener información de Cloudflare
      const cloudflareInfo = geolocationService.getCloudflareInfo(headers);

      // 2. Extraer información del dispositivo y navegador
      const deviceInfo = deviceDetectionService.extractDeviceInfo(viewData.userAgent);
      const referrerCategory = deviceDetectionService.categorizeReferrer(viewData.referrer);

      // 3. Actualizar viewData con toda la información
      if (cloudflareInfo.ip) {
        viewData.ip = cloudflareInfo.ip;
      }
      if (cloudflareInfo.country) {
        viewData.country = cloudflareInfo.country;
      }

      // 4. Crear objeto con datos completos para analytics
      const enrichedViewData = {
        ...viewData,
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        referrerCategory,
      };

      // 5. Enviar webhook a analytics para actualizar métricas
      await this.sendStoreViewWebhook(enrichedViewData);
    } catch (error) {
      logger.error(
        `[TrackVisitService] Error processing store visit with Cloudflare for store ${viewData.storeId}`,
        error,
        'TrackVisitService'
      );
      throw error;
    }
  }

  /**
   * Envía webhook de vista de tienda a analytics
   */
  private async sendStoreViewWebhook(enrichedViewData: any): Promise<void> {
    try {
      // Crear evento de vista de tienda con datos completos
      const storeViewEvent = {
        type: 'STORE_VIEW' as const,
        storeId: enrichedViewData.storeId,
        timestamp: enrichedViewData.timestamp,
        data: {
          sessionId: enrichedViewData.sessionId,
          ip: enrichedViewData.ip,
          userAgent: enrichedViewData.userAgent,
          referrer: enrichedViewData.referrer,
          country: enrichedViewData.country,
          url: enrichedViewData.url,
          path: enrichedViewData.path,
          deviceType: enrichedViewData.deviceType,
          browser: enrichedViewData.browser,
          os: enrichedViewData.os,
          referrerCategory: enrichedViewData.referrerCategory,
        },
      };

      // Generar JWT token para el webhook
      const jwtToken = AnalyticsWebhookJWTAuth.generateToken(enrichedViewData.storeId, 'STORE_VIEW');

      const baseUrl = process.env.APP_URL || 'http://localhost:3000';
      const analyticsWebhookUrl = `${baseUrl}/api/webhooks/analytics`;

      const response = await fetch(analyticsWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(storeViewEvent),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`HTTP ${response.status}: ${errorBody.message || response.statusText}`);
      }
    } catch (error) {
      logger.error(
        `[TrackVisitService] Error sending store view webhook for store ${enrichedViewData.storeId}`,
        error,
        'TrackVisitService'
      );
      throw error;
    }
  }

  /**
   * Valida los datos de vista usando Zod
   */
  validateViewData(data: unknown): { isValid: boolean; errors: string[]; data?: ServerViewData } {
    const result = ServerViewDataSchema.safeParse(data);

    if (result.success) {
      return {
        isValid: true,
        errors: [],
        data: result.data,
      };
    }

    return {
      isValid: false,
      errors: result.error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`),
    };
  }
}

export const trackVisitService = new TrackVisitService();
