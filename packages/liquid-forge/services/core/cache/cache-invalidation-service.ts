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
import {
  cacheManager,
  getCollectionPrefix,
  getCollectionsPrefix,
  getFeaturedProductsPrefix,
  getProductHandleMapCacheKey,
  getDomainCacheKey,
  getPageCacheKey,
  getPagesCacheKey,
  getPagesPrefix,
  getProductCacheKey,
  getProductsPrefix,
  getNavigationPrefix,
  getNavigationMenuPrefix,
} from './';

/**
 * Tipos de cambios que pueden ocurrir en una tienda
 */
export type ChangeType =
  | 'product_created'
  | 'product_updated'
  | 'product_deleted'
  | 'collection_created'
  | 'collection_updated'
  | 'collection_deleted'
  | 'page_created'
  | 'page_updated'
  | 'page_deleted'
  | 'navigation_updated'
  | 'template_updated'
  | 'store_settings_updated'
  | 'domain_updated'
  | 'template_store_updated';

/**
 * Configuración de invalidación por tipo de cambio
 */
interface InvalidationConfig {
  cacheKeys: string[];
  patterns: string[];
  description: string;
}

/**
 * Servicio de invalidación inteligente de caché
 * Detecta cambios en la tienda y limpia automáticamente la caché relevante
 */
export class CacheInvalidationService {
  private static instance: CacheInvalidationService;
  private invalidationCount: number = 0;
  private lastInvalidationTime?: Date;

  private readonly invalidationConfig: Record<ChangeType, InvalidationConfig> = {
    product_created: {
      cacheKeys: [],
      patterns: ['products_', 'featured_products_', 'search_products_', 'collection_'],
      description: 'Producto creado - invalidar listas y búsquedas',
    },
    product_updated: {
      cacheKeys: [],
      patterns: ['product_', 'products_', 'featured_products_', 'search_products_', 'collection_'],
      description: 'Producto actualizado - invalidar producto y listas',
    },
    product_deleted: {
      cacheKeys: [],
      patterns: ['product_', 'products_', 'featured_products_', 'search_products_', 'collection_'],
      description: 'Producto eliminado - invalidar producto y listas',
    },

    collection_created: {
      cacheKeys: [],
      patterns: ['collections_', 'navigation_'],
      description: 'Colección creada - invalidar listas y navegación',
    },
    collection_updated: {
      cacheKeys: [],
      patterns: ['collection_', 'collections_', 'navigation_'],
      description: 'Colección actualizada - invalidar colección y listas',
    },
    collection_deleted: {
      cacheKeys: [],
      patterns: ['collection_', 'collections_', 'navigation_'],
      description: 'Colección eliminada - invalidar colección y listas',
    },

    page_created: {
      cacheKeys: [],
      patterns: ['pages_', 'navigation_'],
      description: 'Página creada - invalidar listas y navegación',
    },
    page_updated: {
      cacheKeys: [],
      patterns: ['page_', 'pages_', 'navigation_'],
      description: 'Página actualizada - invalidar página y listas',
    },
    page_deleted: {
      cacheKeys: [],
      patterns: ['page_', 'pages_', 'navigation_'],
      description: 'Página eliminada - invalidar página y listas',
    },

    navigation_updated: {
      cacheKeys: [],
      patterns: ['navigation_'],
      description: 'Navegación actualizada - invalidar menús',
    },

    template_updated: {
      cacheKeys: [],
      patterns: ['template_', 'compiled_template_', 'page_'],
      description: 'Template actualizado - invalidar templates y HTML renderizado',
    },

    store_settings_updated: {
      cacheKeys: [],
      patterns: ['domain_', 'navigation_'],
      description: 'Configuración de tienda actualizada - invalidar dominios y navegación',
    },

    domain_updated: {
      cacheKeys: [],
      patterns: ['domain_'],
      description: 'Dominio actualizado - invalidar resolución de dominios',
    },
    template_store_updated: {
      cacheKeys: [],
      patterns: ['template_', 'compiled_template_', 'page_'],
      description: 'Plantilla de tienda actualizada - invalidar plantillas, compiladas y HTML renderizado',
    },
  };

  private constructor() {}

  public static getInstance(): CacheInvalidationService {
    if (!CacheInvalidationService.instance) {
      CacheInvalidationService.instance = new CacheInvalidationService();
    }
    return CacheInvalidationService.instance;
  }

  /**
   * Invalida caché basado en el tipo de cambio y el storeId
   */
  public invalidateCache(changeType: ChangeType, storeId: string, entityId?: string, path?: string): void {
    const config = this.invalidationConfig[changeType];
    if (!config) {
      logger.warn(`Unknown change type: ${changeType}`, undefined, 'CacheInvalidationService');
      return;
    }

    logger.info(
      `Invalidating cache for ${changeType} - Store: ${storeId}, Entity: ${entityId || 'N/A'}, Path: ${path || 'N/A'}`,
      undefined,
      'CacheInvalidationService'
    );

    // Detectar si es cambio en layout o sección compartida para invalidación agresiva
    const isLayoutOrSharedSection = path && (path.includes('layout/') || path.includes('sections/'));

    if (isLayoutOrSharedSection) {
      logger.info(
        `Layout/shared section detected: ${path} - Invalidating all pages for store ${storeId}`,
        undefined,
        'CacheInvalidationService'
      );
      // Invalidar TODAS las páginas cuando cambia layout o sección compartida
      cacheManager.deleteByPrefix(getPagesPrefix(storeId));
    }

    this.invalidateByPatterns(config.patterns, storeId, entityId, path);

    if (entityId) {
      this.invalidateSpecificKeys(changeType, storeId, entityId);
    }

    // Invalidación adicional basada en path
    if (path) {
      this.invalidateByPath(changeType, storeId, path);
    }

    // Registrar invalidación para estadísticas
    this.recordInvalidation();
  }

  /**
   * Invalida caché basado en el path del template
   */
  private invalidateByPath(changeType: ChangeType, storeId: string, templatePath: string): void {
    // Detectar tipo de template por path
    if (templatePath.includes('layout/')) {
      // Layout cambia → Invalidar TODAS las páginas (todas usan layout)
      logger.info(
        `Layout template changed: ${templatePath} - Invalidating all pages`,
        undefined,
        'CacheInvalidationService'
      );
      cacheManager.deleteByPrefix(getPagesPrefix(storeId));
    } else if (templatePath.includes('sections/')) {
      // Sección cambia → Invalidar todas las páginas (las secciones se usan en múltiples lugares)
      logger.info(
        `Section template changed: ${templatePath} - Invalidating all pages`,
        undefined,
        'CacheInvalidationService'
      );
      cacheManager.deleteByPrefix(getPagesPrefix(storeId));
    } else if (templatePath.includes('snippets/')) {
      // Snippet cambia → Invalidar páginas que lo usan (más complejo, por ahora invalidar todas)
      logger.info(
        `Snippet template changed: ${templatePath} - Invalidating all pages`,
        undefined,
        'CacheInvalidationService'
      );
      cacheManager.deleteByPrefix(getPagesPrefix(storeId));
    } else if (templatePath.includes('templates/')) {
      // Template específico cambia → Invalidar ese tipo de página
      const pageType = this.extractPageTypeFromTemplatePath(templatePath);
      if (pageType) {
        logger.info(
          `Page template changed: ${templatePath} - Invalidating ${pageType} pages`,
          undefined,
          'CacheInvalidationService'
        );
        // Invalidar páginas de ese tipo específico
        cacheManager.deleteByPrefix(`page_${storeId}_${pageType}|`);
      } else {
        // Si no se puede determinar, invalidar todas
        cacheManager.deleteByPrefix(getPagesPrefix(storeId));
      }
    }
  }

  /**
   * Extrae el tipo de página desde el path del template
   */
  private extractPageTypeFromTemplatePath(templatePath: string): string | null {
    const match = templatePath.match(/templates\/([^\/]+)\.(json|liquid)/);
    return match ? match[1] : null;
  }

  /**
   * Invalida caché por patrones de claves
   */
  private invalidateByPatterns(patterns: string[], storeId: string, entityId?: string, path?: string): void {
    for (const pattern of patterns) {
      // Mapear patrones a prefijos concretos usando helpers
      switch (pattern) {
        case 'products_':
          cacheManager.deleteByPrefix(getProductsPrefix(storeId));
          break;
        case 'featured_products_':
          cacheManager.deleteByPrefix(getFeaturedProductsPrefix(storeId));
          break;
        case 'collections_':
          cacheManager.deleteByPrefix(getCollectionsPrefix(storeId));
          break;
        case 'collection_':
          if (entityId) {
            cacheManager.deleteByPrefix(getCollectionPrefix(storeId, entityId));
          } else {
            // Si no hay entityId, limpiar todas las colecciones de la tienda
            cacheManager.deleteByPrefix(`collection_${storeId}_`);
          }
          break;
        case 'pages_':
          cacheManager.deleteKey(getPagesCacheKey(storeId));
          break;
        case 'page_':
          if (entityId) {
            cacheManager.deleteKey(getPageCacheKey(storeId, entityId));
          } else {
            cacheManager.deleteByPrefix(getPagesPrefix(storeId));
          }
          break;
        case 'navigation_':
          // Invalidar claves de navegación usando helpers
          cacheManager.deleteByPrefix(getNavigationPrefix(storeId));
          cacheManager.deleteByPrefix(getNavigationMenuPrefix(storeId));
          // Cambios en navegación impactan páginas renderizadas
          cacheManager.deleteByPrefix(getPagesPrefix(storeId));
          break;
        case 'template_':
          cacheManager.deleteByPrefix(`template_${storeId}_`);
          // Templates actualizados impactan páginas renderizadas
          // CRÍTICO: Invalidar HTML renderizado cuando cambian templates
          cacheManager.deleteByPrefix(getPagesPrefix(storeId));
          logger.debug(
            `Invalidated template_ prefix and all pages for store ${storeId}`,
            undefined,
            'CacheInvalidationService'
          );
          break;
        case 'compiled_template_':
          cacheManager.deleteByPrefix(`compiled_template_${storeId}_`);
          // Templates compilados también deben invalidar HTML
          // CRÍTICO: Invalidar HTML renderizado cuando cambian templates compilados
          cacheManager.deleteByPrefix(getPagesPrefix(storeId));
          logger.debug(
            `Invalidated compiled_template_ prefix and all pages for store ${storeId}`,
            undefined,
            'CacheInvalidationService'
          );
          break;
        case 'page_':
          // Invalidar todas las páginas HTML renderizadas
          cacheManager.deleteByPrefix(getPagesPrefix(storeId));
          logger.debug(`Invalidated all page HTML cache for store ${storeId}`, undefined, 'CacheInvalidationService');
          break;
        case 'search_products_':
          // Búsquedas por tienda con prefijo conocido
          cacheManager.deleteByPrefix(`search_products_${storeId}_`);
          break;
        case 'domain_':
          // No borrar por prefijo global; la invalidación específica se maneja abajo
          break;
        default:
          // Prefijo literal como fallback
          cacheManager.deleteByPrefix(pattern);
      }
    }
  }

  /**
   * Invalida claves específicas basadas en el tipo de cambio
   */
  private invalidateSpecificKeys(changeType: ChangeType, storeId: string, entityId: string): void {
    switch (changeType) {
      case 'product_updated':
      case 'product_deleted':
        cacheManager.deleteKey(getProductCacheKey(storeId, entityId));
        cacheManager.deleteByPrefix(getProductsPrefix(storeId));
        cacheManager.deleteByPrefix(getFeaturedProductsPrefix(storeId));
        // Invalidar HTML de páginas de producto
        cacheManager.deleteByPrefix(`page_${storeId}_product|`);
        // Invalidar HandleMap para forzar recálculo en próxima lectura
        cacheManager.deleteKey(getProductHandleMapCacheKey(storeId));
        break;

      case 'collection_updated':
      case 'collection_deleted':
        cacheManager.deleteByPrefix(getCollectionPrefix(storeId, entityId));
        cacheManager.deleteByPrefix(getCollectionsPrefix(storeId));
        // Invalidar HTML de páginas de colección
        cacheManager.deleteByPrefix(`page_${storeId}_collection|`);
        break;

      case 'page_updated':
      case 'page_deleted':
        cacheManager.deleteKey(getPageCacheKey(storeId, entityId));
        cacheManager.deleteKey(getPagesCacheKey(storeId));
        break;

      case 'domain_updated':
        // entityId puede no ser un dominio; si se provee dominio concreto, eliminar esa clave
        if (entityId) {
          cacheManager.deleteKey(getDomainCacheKey(entityId));
        }
        break;
    }
  }

  /**
   * Invalida toda la caché de una tienda
   */
  public invalidateStoreCache(storeId: string): void {
    cacheManager.invalidateStoreCache(storeId);
  }

  /**
   * Invalida caché de productos específicos
   */
  public invalidateProductCache(storeId: string, productId: string): void {
    cacheManager.invalidateProductCache(storeId, productId);
  }

  /**
   * Registra una invalidación para estadísticas
   */
  private recordInvalidation(): void {
    this.invalidationCount++;
    this.lastInvalidationTime = new Date();
  }

  /**
   * Obtiene estadísticas de invalidación
   */
  public getInvalidationStats(): { totalInvalidations: number; lastInvalidation?: Date } {
    return {
      totalInvalidations: this.invalidationCount,
      lastInvalidation: this.lastInvalidationTime,
    };
  }
}

export const cacheInvalidationService = CacheInvalidationService.getInstance();
