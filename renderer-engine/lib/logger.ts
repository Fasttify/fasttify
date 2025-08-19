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

import { SecureLogger } from '@/lib/utils/secure-logger';

/**
 * Logger centralizado para el motor de renderizado
 * Usa SecureLogger como base y agrega contexto específico del motor
 */
export class RendererLogger {
  private static isDevelopment = process.env.APP_ENV === 'development';

  /**
   * Agrega prefijo con contexto del motor
   */
  private static addPrefix(message: string, component?: string): string {
    const prefix = component ? `[Renderer:${component}]` : '[Renderer]';
    return `${prefix} ${message}`;
  }

  /**
   * Log de debug - solo en desarrollo
   */
  static debug(message: string, meta?: any, component?: string): void {
    if (!this.isDevelopment) return;

    const prefixedMessage = this.addPrefix(message, component);
    if (meta) {
      SecureLogger.debug(prefixedMessage, meta);
    } else {
      SecureLogger.debug(prefixedMessage);
    }
  }

  /**
   * Log de información - siempre se muestra
   */
  static info(message: string, meta?: any, component?: string): void {
    const prefixedMessage = this.addPrefix(message, component);
    if (meta) {
      SecureLogger.info(prefixedMessage, meta);
    } else {
      SecureLogger.info(prefixedMessage);
    }
  }

  /**
   * Log de warning - siempre se muestra
   */
  static warn(message: string, meta?: any, component?: string): void {
    const prefixedMessage = this.addPrefix(message, component);
    if (meta) {
      SecureLogger.warn(prefixedMessage, meta);
    } else {
      SecureLogger.warn(prefixedMessage);
    }
  }

  /**
   * Log de error - siempre se muestra
   */
  static error(message: string, error?: Error | any, component?: string): void {
    const prefixedMessage = this.addPrefix(message, component);

    if (error) {
      // Si es un Error, extraer información útil
      if (error instanceof Error) {
        SecureLogger.error(prefixedMessage, {
          name: error.name,
          message: error.message,
          stack: this.isDevelopment ? error.stack : undefined,
        });
      } else {
        SecureLogger.error(prefixedMessage, error);
      }
    } else {
      SecureLogger.error(prefixedMessage);
    }
  }

  /**
   * Log de performance - para medir tiempos de operaciones
   */
  static performance(operation: string, timeMs: number, component?: string): void {
    if (!this.isDevelopment) return;

    const prefixedMessage = this.addPrefix(`${operation} completed in ${timeMs}ms`, component);
    SecureLogger.debug(prefixedMessage);
  }

  /**
   * Log de cache - para operaciones de caché
   */
  static cache(operation: 'hit' | 'miss' | 'set' | 'invalidate', key: string, component?: string): void {
    if (!this.isDevelopment) return;

    const prefixedMessage = this.addPrefix(`Cache ${operation}: ${key}`, component);
    SecureLogger.debug(prefixedMessage);
  }

  /**
   * Log de template - para operaciones de templates
   */
  static template(operation: string, templatePath: string, storeId?: string, component?: string): void {
    const prefixedMessage = this.addPrefix(
      `${operation}: ${templatePath}${storeId ? ` (store: ${storeId})` : ''}`,
      component || 'Template'
    );

    if (this.isDevelopment) {
      SecureLogger.debug(prefixedMessage);
    }
  }

  /**
   * Log de render - para operaciones de renderizado
   */
  static render(operation: string, pageType: string, domain: string, timeMs?: number, component?: string): void {
    const timePart = timeMs ? ` in ${timeMs}ms` : '';
    const prefixedMessage = this.addPrefix(`${operation} ${pageType} for ${domain}${timePart}`, component || 'Render');

    if (this.isDevelopment || operation.includes('error')) {
      if (operation.includes('error')) {
        SecureLogger.error(prefixedMessage);
      } else {
        SecureLogger.debug(prefixedMessage);
      }
    }
  }
}

// Alias más corto para uso frecuente
export const logger = RendererLogger;
