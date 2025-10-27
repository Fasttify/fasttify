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

import { logger } from '../../../lib/logger';
import NodeCache from 'node-cache';

// Configuración de TTLs por categoría
interface TTLConfig {
  default: number;
  overrides?: Record<string, number>;
}

export class CacheManager {
  private static instance: CacheManager;
  private cache: NodeCache;
  private isDevelopment: boolean;
  private devCacheEnabled: boolean;

  // Configuración de TTLs por categoría principal
  private readonly TTL_CONFIG: Record<string, TTLConfig> = {
    // Datos de API - contenido dinámico que cambia frecuentemente
    data: {
      default: 15 * 60 * 1000, // 15 minutos por defecto
      overrides: {
        search: 10 * 60 * 1000, // Búsquedas más cortas
        cart: 5 * 60 * 1000, // Carrito muy corto
        navigation: 30 * 60 * 1000, // Navegación más estable
      },
    },

    // Templates - contenido estático que cambia poco
    template: {
      default: 60 * 60 * 1000, // 1 hora por defecto
    },

    // Páginas renderizadas - contenido procesado
    page: {
      default: 30 * 60 * 1000, // 30 minutos por defecto
      overrides: {
        index: 15 * 60 * 1000, // Homepage más frecuente
        product: 60 * 60 * 1000, // Productos más estables
        collection: 45 * 60 * 1000, // Colecciones intermedias
        policies: 24 * 60 * 60 * 1000, // Políticas muy estables
        cart: 0, // Sin caché para carrito
        '404': 24 * 60 * 60 * 1000, // 404 muy estable
      },
    },

    // Dominios - resolución de tiendas
    domain: {
      default: 30 * 60 * 1000, // 30 minutos
    },
  };

  // TTL para desarrollo (muy corto para testing)
  private readonly DEV_CACHE_TTL = 30 * 60 * 1000;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    // Permitir desactivar el caché en desarrollo para pruebas: DEV_CACHE_ENABLED=false
    // Por defecto en desarrollo: habilitado (true)
    const envFlag = process.env.DEV_CACHE_ENABLED;
    this.devCacheEnabled = envFlag === undefined ? true : envFlag !== 'false';
    // Usamos stdTTL 0 para definir TTL por entrada; limpieza automática cada 60s
    this.cache = new NodeCache({ stdTTL: 0, checkperiod: 60, useClones: false });
  }

  private shouldUseCache(): boolean {
    if (!this.isDevelopment) return true;
    return this.devCacheEnabled;
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Obtiene el TTL adecuado según la categoría y el tipo específico
   * Sistema híbrido: configuración por defecto + overrides específicos
   */
  public getAppropiateTTL(category: string, type?: string): number {
    // En desarrollo, usar TTL reducido para todos
    if (this.isDevelopment) {
      return this.DEV_CACHE_TTL;
    }

    const config = this.TTL_CONFIG[category];
    if (!config) {
      logger.warn(`Unknown cache category: ${category}, using default`, undefined, 'CacheManager');
      return this.TTL_CONFIG.data.default;
    }

    // Si hay override específico, usarlo
    if (type && config.overrides && config.overrides[type]) {
      return config.overrides[type];
    }

    // Usar TTL por defecto de la categoría
    return config.default;
  }

  /**
   * Métodos de conveniencia para casos comunes
   */
  public getDataTTL(type?: string): number {
    return this.getAppropiateTTL('data', type);
  }

  public getTemplateTTL(): number {
    return this.getAppropiateTTL('template');
  }

  public getPageTTL(type?: string): number {
    return this.getAppropiateTTL('page', type);
  }

  public getDomainTTL(): number {
    return this.getAppropiateTTL('domain');
  }

  /**
   * Obtiene una entrada del caché si existe y no ha expirado
   */
  public getCached(key: string): any | null {
    if (!this.shouldUseCache()) return null;
    const value = this.cache.get<any>(key);
    return value === undefined ? null : value;
  }

  /**
   * Guarda una entrada en el caché
   */
  public setCached(key: string, data: any, ttl: number): void {
    if (!this.shouldUseCache()) return;
    // No cachear si el TTL es 0 o negativo (p. ej., carrito)
    if (ttl <= 0) return;
    this.cache.set(key, data, Math.max(1, Math.floor(ttl / 1000)));
  }

  /**
   * Invalida el caché para una tienda específica
   */
  public invalidateStoreCache(storeId: string): void {
    const pattern = `_${storeId}_`;
    const keys = this.cache.keys();
    const toDelete = keys.filter((k: string) => k.includes(pattern));
    if (toDelete.length) this.cache.del(toDelete);
  }

  /**
   * Invalida el caché para un producto específico
   */
  public invalidateProductCache(storeId: string, productId: string): void {
    const prefixes = [`product_${storeId}_${productId}`, `products_${storeId}`, `featured_products_${storeId}`];
    const keys = this.cache.keys();
    const toDelete = keys.filter((k: string) => prefixes.some((p) => k.startsWith(p)));
    if (toDelete.length) this.cache.del(toDelete);
  }

  /**
   * Invalida el caché para un dominio específico
   */
  public invalidateDomainCache(domain: string): void {
    const key = `domain_${domain}`;
    this.cache.del(key);
  }

  /**
   * Invalida el caché para un template específico
   */
  public invalidateTemplateCache(templatePath: string): void {
    const key = `template_${templatePath}`;
    this.cache.del(key);
  }

  /**
   * Limpia todo el caché
   */
  public clearCache(): void {
    this.cache.flushAll();
  }

  /**
   * Limpia entradas expiradas del caché
   */
  public cleanExpiredCache(): void {
    // Forzar chequeo de expiración accediendo a las claves; node-cache limpia con checkperiod
    this.cache.keys().forEach((key: string) => {
      void this.cache.get(key);
    });
  }

  /**
   * Obtiene estadísticas del caché para debugging
   */
  public getCacheStats(): { total: number; expired: number; active: number } {
    if (!this.shouldUseCache()) {
      return { total: 0, expired: 0, active: 0 };
    }
    const now = Date.now();
    const keys = this.cache.keys();
    let expired = 0;
    for (const key of keys as string[]) {
      const ttl = this.cache.getTtl(key);
      if (typeof ttl === 'number' && ttl <= now) expired++;
    }
    const total = keys.length;
    const active = Math.max(0, total - expired);
    return { total, expired, active };
  }

  /**
   * Elimina todas las claves que comiencen con un prefijo dado
   */
  public deleteByPrefix(prefix: string): number {
    const keys = this.cache.keys();
    const toDelete = keys.filter((k: string) => k.startsWith(prefix));
    if (!toDelete.length) return 0;
    const deleted = this.cache.del(toDelete);
    return Array.isArray(deleted) ? deleted.length : Number(deleted);
  }

  /**
   * Elimina una clave específica (compatibilidad con servicios existentes)
   */
  public deleteKey(key: string): void {
    this.cache.del(key);
  }

  /**
   * Controles de caché en desarrollo
   */
  public setDevCacheEnabled(enabled: boolean): void {
    this.devCacheEnabled = enabled;
  }

  public enableDevCache(): void {
    this.setDevCacheEnabled(true);
  }

  public disableDevCache(): void {
    this.setDevCacheEnabled(false);
  }

  public isDevCacheEnabled(): boolean {
    return this.devCacheEnabled;
  }
}

export const cacheManager = CacheManager.getInstance();
