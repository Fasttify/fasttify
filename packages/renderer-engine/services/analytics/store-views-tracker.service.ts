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

import { logger } from '@/renderer-engine/lib/logger';
import { randomUUID } from 'crypto';
import { AnalyticsWebhookJWTAuth } from '@/api/webhooks/_lib/middleware/jwt-auth.middleware';

export interface ServerViewData {
  storeId: string;
  sessionId: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  referrer?: string;
  country?: string;
  url: string;
  path: string;
}

/**
 * Servicio para trackear vistas de tiendas de forma asíncrona
 */
export class StoreViewsTracker {
  /**
   * Genera un ID único para la sesión
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${randomUUID()}`;
  }

  /**
   * Extrae la IP del usuario de los headers (priorizando Cloudflare)
   */
  private getClientIP(headers: Record<string, string | string[] | undefined>): string {
    // Prioridad: Cloudflare primero, luego otros headers
    const ipHeaders = [
      'cf-connecting-ip', // Cloudflare - IP real del usuario
      'x-forwarded-for',
      'x-real-ip',
      'x-client-ip',
      'remote-addr',
    ];

    for (const header of ipHeaders) {
      const ip = headers[header];
      if (ip && typeof ip === 'string') {
        // x-forwarded-for puede contener múltiples IPs, tomar la primera
        return ip.split(',')[0].trim();
      }
    }

    return 'unknown';
  }

  /**
   * Obtiene el país usando headers de Cloudflare
   */
  private getCountryFromCloudflare(headers: Record<string, string | string[] | undefined>): string | undefined {
    const cfCountry = headers['cf-ipcountry'] as string;

    if (cfCountry && cfCountry.length === 2 && /^[A-Z]{2}$/.test(cfCountry)) {
      return cfCountry;
    }

    return undefined;
  }

  /**
   * Captura los datos básicos de una vista de tienda
   */
  captureStoreView(
    storeId: string,
    path: string,
    headers: Record<string, string | string[] | undefined>,
    url: string
  ): ServerViewData {
    const sessionId = this.generateSessionId();
    const timestamp = new Date().toISOString();
    const ip = this.getClientIP(headers);
    const userAgent = (headers['user-agent'] as string) || 'unknown';
    const referrer = (headers['referer'] as string) || undefined;
    const country = this.getCountryFromCloudflare(headers);

    const viewData: ServerViewData = {
      storeId,
      sessionId,
      timestamp,
      ip,
      userAgent,
      referrer,
      country,
      url,
      path,
    };

    return viewData;
  }

  /**
   * Envía los datos de vista de forma asíncrona (no bloquea)
   */
  async trackStoreView(viewData: ServerViewData): Promise<void> {
    try {
      // Enviar de forma asíncrona para no bloquear el rendering
      this.sendViewData(viewData).catch((error) => {
        logger.error(
          `[StoreViewsTracker] Error sending view data for store ${viewData.storeId}`,
          error,
          'StoreViewsTracker'
        );
      });
    } catch (error) {
      logger.error(
        `[StoreViewsTracker] Error initiating view tracking for store ${viewData.storeId}`,
        error,
        'StoreViewsTracker'
      );
    }
  }

  /**
   * Envía los datos de vista a la API
   */
  private async sendViewData(viewData: ServerViewData): Promise<void> {
    const baseUrl = this.getBaseUrl();
    const apiUrl = `${baseUrl}/api/webhooks/track-visit`;

    // Generar JWT token para autenticación
    const jwtToken = AnalyticsWebhookJWTAuth.generateToken(viewData.storeId, 'STORE_VIEW');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(viewData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`[StoreViewsTracker] HTTP ${response.status}: ${errorText}`, 'StoreViewsTracker');
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Obtiene la URL base según el entorno
   */
  private getBaseUrl(): string {
    if (process.env.APP_ENV === 'production') {
      return process.env.APP_URL || 'https://fasttify.com';
    }
    return 'http://localhost:3000';
  }
}

export const storeViewsTracker = new StoreViewsTracker();
