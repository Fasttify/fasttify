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

/**
 * Servicio para obtener geolocalización usando Cloudflare headers
 */
export class GeolocationService {
  /**
   * Obtiene el país usando headers de Cloudflare (más eficiente)
   */
  getCountryFromCloudflare(headers: Record<string, string | string[] | undefined>): string | undefined {
    try {
      // Obtener país de Cloudflare
      const cfCountry = headers['cf-ipcountry'] as string;

      if (cfCountry && cfCountry.length === 2 && /^[A-Z]{2}$/.test(cfCountry)) {
        return cfCountry;
      }

      // Fallback para IPs locales o desarrollo
      const cfIP = headers['cf-connecting-ip'] as string;
      if (this.isLocalIP(cfIP)) {
        return 'LOCAL';
      }

      logger.warn(`[GeolocationService] No valid country from Cloudflare headers`, 'GeolocationService');
      return undefined;
    } catch (error) {
      logger.error(`[GeolocationService] Error getting country from Cloudflare headers`, error, 'GeolocationService');
      return undefined;
    }
  }

  /**
   * Obtiene información completa de Cloudflare headers
   */
  getCloudflareInfo(headers: Record<string, string | string[] | undefined>): {
    ip?: string;
    country?: string;
    rayId?: string;
    requestId?: string;
    cacheStatus?: string;
    protocol?: string;
  } {
    try {
      return {
        ip: headers['cf-connecting-ip'] as string,
        country: headers['cf-ipcountry'] as string,
        rayId: headers['cf-ray'] as string,
        requestId: headers['cf-request-id'] as string,
        cacheStatus: headers['cf-cache-status'] as string,
        protocol: headers['cf-visitor'] as string,
      };
    } catch (error) {
      logger.error(`[GeolocationService] Error parsing Cloudflare headers`, error, 'GeolocationService');
      return {};
    }
  }

  /**
   * Verifica si una IP es local o de desarrollo
   */
  private isLocalIP(ip: string): boolean {
    const localIPs = ['127.0.0.1', '::1', 'localhost', 'unknown'];

    // Verificar IPs locales
    if (localIPs.includes(ip)) {
      return true;
    }

    // Verificar rangos privados
    const privateRanges = [
      /^10\./, // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[01])\./, // 172.16.0.0/12
      /^192\.168\./, // 192.168.0.0/16
    ];

    return privateRanges.some((range) => range.test(ip));
  }
}

export const geolocationService = new GeolocationService();
