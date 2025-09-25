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

export interface DeviceInfo {
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
}

export class DeviceDetectionService {
  /**
   * Detecta el tipo de dispositivo basado en User-Agent
   */
  detectDeviceType(userAgent: string): 'mobile' | 'desktop' | 'tablet' {
    const ua = userAgent.toLowerCase();

    // Detectar tablets primero (antes que mobile)
    if (
      ua.includes('ipad') ||
      (ua.includes('tablet') && !ua.includes('mobile')) ||
      ua.includes('kindle') ||
      (ua.includes('android') && !ua.includes('mobile'))
    ) {
      return 'tablet';
    }

    // Detectar mobile
    if (
      ua.includes('mobile') ||
      ua.includes('android') ||
      ua.includes('iphone') ||
      ua.includes('ipod') ||
      ua.includes('blackberry') ||
      ua.includes('windows phone')
    ) {
      return 'mobile';
    }

    // Por defecto desktop
    return 'desktop';
  }

  /**
   * Detecta el navegador basado en User-Agent
   */
  detectBrowser(userAgent: string): string {
    const ua = userAgent.toLowerCase();

    if (ua.includes('chrome') && !ua.includes('edg')) {
      return 'chrome';
    }
    if (ua.includes('firefox')) {
      return 'firefox';
    }
    if (ua.includes('safari') && !ua.includes('chrome')) {
      return 'safari';
    }
    if (ua.includes('edg')) {
      return 'edge';
    }
    if (ua.includes('opera') || ua.includes('opr')) {
      return 'opera';
    }
    if (ua.includes('msie') || ua.includes('trident')) {
      return 'ie';
    }

    return 'unknown';
  }

  /**
   * Detecta el sistema operativo basado en User-Agent
   */
  detectOperatingSystem(userAgent: string): string {
    const ua = userAgent.toLowerCase();

    if (ua.includes('windows')) {
      return 'windows';
    }
    if (ua.includes('mac')) {
      return 'macos';
    }
    if (ua.includes('linux')) {
      return 'linux';
    }
    if (ua.includes('android')) {
      return 'android';
    }
    if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
      return 'ios';
    }

    return 'unknown';
  }

  /**
   * Extrae información completa del dispositivo
   */
  extractDeviceInfo(userAgent: string): DeviceInfo {
    try {
      const deviceType = this.detectDeviceType(userAgent);
      const browser = this.detectBrowser(userAgent);
      const os = this.detectOperatingSystem(userAgent);

      return { deviceType, browser, os };
    } catch (error) {
      logger.error('[DeviceDetection] Error extracting device info:', error, 'DeviceDetection');
      return { deviceType: 'desktop', browser: 'unknown', os: 'unknown' };
    }
  }

  /**
   * Detecta el referrer y lo categoriza
   */
  categorizeReferrer(referrer?: string): string {
    if (!referrer) {
      return 'direct';
    }

    try {
      const url = new URL(referrer);
      const hostname = url.hostname.toLowerCase();

      // Redes sociales
      if (hostname.includes('facebook.com') || hostname.includes('fb.com')) {
        return 'facebook';
      }
      if (hostname.includes('instagram.com')) {
        return 'instagram';
      }
      if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
        return 'twitter';
      }
      if (hostname.includes('linkedin.com')) {
        return 'linkedin';
      }
      if (hostname.includes('youtube.com')) {
        return 'youtube';
      }
      if (hostname.includes('tiktok.com')) {
        return 'tiktok';
      }

      // Motores de búsqueda
      if (hostname.includes('google.com') || hostname.includes('google.')) {
        return 'google';
      }
      if (hostname.includes('bing.com')) {
        return 'bing';
      }
      if (hostname.includes('yahoo.com')) {
        return 'yahoo';
      }
      if (hostname.includes('duckduckgo.com')) {
        return 'duckduckgo';
      }

      // Otros dominios conocidos
      if (hostname.includes('fasttify.com')) {
        return 'fasttify';
      }

      // Dominio externo genérico
      return 'external';
    } catch (error) {
      logger.error('[DeviceDetection] Error categorizing referrer:', error, 'DeviceDetection');
      return 'unknown';
    }
  }
}

export const deviceDetectionService = new DeviceDetectionService();
