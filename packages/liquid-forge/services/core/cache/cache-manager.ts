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

interface DataCache {
  [key: string]: {
    data: any;
    timestamp: number;
    ttl: number;
  };
}

// Configuración de TTLs por categoría
interface TTLConfig {
  default: number;
  overrides?: Record<string, number>;
}

export class CacheManager {
  private static instance: CacheManager;
  private cache: DataCache = {};
  private isDevelopment: boolean;

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
  private readonly DEV_CACHE_TTL = 1000; // 1 segundo

  private constructor() {
    this.isDevelopment = process.env.APP_ENV === 'development';
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
    const entry = this.cache[key];
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now > entry.timestamp + entry.ttl) {
      delete this.cache[key];
      return null;
    }

    return entry.data;
  }

  /**
   * Guarda una entrada en el caché
   */
  public setCached(key: string, data: any, ttl: number): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      ttl,
    };
  }

  /**
   * Invalida el caché para una tienda específica
   */
  public invalidateStoreCache(storeId: string): void {
    Object.keys(this.cache).forEach((key) => {
      if (key.includes(`_${storeId}_`)) {
        delete this.cache[key];
      }
    });
  }

  /**
   * Invalida el caché para un producto específico
   */
  public invalidateProductCache(storeId: string, productId: string): void {
    const keys = [`product_${storeId}_${productId}`, `products_${storeId}`, `featured_products_${storeId}`];

    keys.forEach((key) => {
      Object.keys(this.cache).forEach((cacheKey) => {
        if (cacheKey.startsWith(key)) {
          delete this.cache[cacheKey];
        }
      });
    });
  }

  /**
   * Invalida el caché para un dominio específico
   */
  public invalidateDomainCache(domain: string): void {
    const key = `domain_${domain}`;
    delete this.cache[key];
  }

  /**
   * Invalida el caché para un template específico
   */
  public invalidateTemplateCache(templatePath: string): void {
    const key = `template_${templatePath}`;
    delete this.cache[key];
  }

  /**
   * Limpia todo el caché
   */
  public clearCache(): void {
    this.cache = {};
  }

  /**
   * Limpia entradas expiradas del caché
   */
  public cleanExpiredCache(): void {
    const now = Date.now();
    Object.keys(this.cache).forEach((key) => {
      const entry = this.cache[key];
      if (now > entry.timestamp + entry.ttl) {
        delete this.cache[key];
      }
    });
  }

  /**
   * Obtiene estadísticas del caché para debugging
   */
  public getCacheStats(): { total: number; expired: number; active: number } {
    const now = Date.now();
    let total = 0;
    let expired = 0;
    let active = 0;

    Object.values(this.cache).forEach((entry) => {
      total++;
      if (now > entry.timestamp + entry.ttl) {
        expired++;
      } else {
        active++;
      }
    });

    return { total, expired, active };
  }

  /**
   * Elimina todas las claves que comiencen con un prefijo dado
   */
  public deleteByPrefix(prefix: string): number {
    let count = 0;
    Object.keys(this.cache).forEach((key) => {
      if (key.startsWith(prefix)) {
        delete this.cache[key];
        count++;
      }
    });
    return count;
  }
}

export const cacheManager = CacheManager.getInstance();
