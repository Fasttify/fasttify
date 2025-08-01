import { logger } from '@/renderer-engine/lib/logger';
import {
  cacheManager,
  getCollectionCacheKey,
  getCollectionsCacheKey,
  getFeaturedProductsCacheKey,
  getPageCacheKey,
  getPagesCacheKey,
  getProductCacheKey,
  getProductsCacheKey,
} from '@/renderer-engine/services/core/cache';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';

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

  // Configuración de invalidación por tipo de cambio
  private readonly invalidationConfig: Record<ChangeType, InvalidationConfig> = {
    // Cambios en productos
    product_created: {
      cacheKeys: [],
      patterns: [
        'products_', // Lista de productos
        'featured_products_', // Productos destacados
        'search_products_', // Búsquedas
        'collection_', // Colecciones (pueden incluir el nuevo producto)
      ],
      description: 'Producto creado - invalidar listas y búsquedas',
    },
    product_updated: {
      cacheKeys: [],
      patterns: [
        'product_', // Producto específico
        'products_', // Lista de productos
        'featured_products_', // Productos destacados
        'search_products_', // Búsquedas
        'collection_', // Colecciones que contengan el producto
      ],
      description: 'Producto actualizado - invalidar producto y listas',
    },
    product_deleted: {
      cacheKeys: [],
      patterns: [
        'product_', // Producto específico
        'products_', // Lista de productos
        'featured_products_', // Productos destacados
        'search_products_', // Búsquedas
        'collection_', // Colecciones que contuvieran el producto
      ],
      description: 'Producto eliminado - invalidar producto y listas',
    },

    // Cambios en colecciones
    collection_created: {
      cacheKeys: [],
      patterns: [
        'collections_', // Lista de colecciones
        'navigation_', // Menús de navegación
      ],
      description: 'Colección creada - invalidar listas y navegación',
    },
    collection_updated: {
      cacheKeys: [],
      patterns: [
        'collection_', // Colección específica
        'collections_', // Lista de colecciones
        'navigation_', // Menús de navegación
      ],
      description: 'Colección actualizada - invalidar colección y listas',
    },
    collection_deleted: {
      cacheKeys: [],
      patterns: [
        'collection_', // Colección específica
        'collections_', // Lista de colecciones
        'navigation_', // Menús de navegación
      ],
      description: 'Colección eliminada - invalidar colección y listas',
    },

    // Cambios en páginas
    page_created: {
      cacheKeys: [],
      patterns: [
        'pages_', // Lista de páginas
        'navigation_', // Menús de navegación
      ],
      description: 'Página creada - invalidar listas y navegación',
    },
    page_updated: {
      cacheKeys: [],
      patterns: [
        'page_', // Página específica
        'pages_', // Lista de páginas
        'navigation_', // Menús de navegación
      ],
      description: 'Página actualizada - invalidar página y listas',
    },
    page_deleted: {
      cacheKeys: [],
      patterns: [
        'page_', // Página específica
        'pages_', // Lista de páginas
        'navigation_', // Menús de navegación
      ],
      description: 'Página eliminada - invalidar página y listas',
    },

    // Cambios en navegación
    navigation_updated: {
      cacheKeys: [],
      patterns: [
        'navigation_', // Menús de navegación
      ],
      description: 'Navegación actualizada - invalidar menús',
    },

    // Cambios en templates
    template_updated: {
      cacheKeys: [],
      patterns: [
        'template_', // Templates
        'compiled_template_', // Templates compilados
      ],
      description: 'Template actualizado - invalidar templates',
    },

    // Cambios en configuración de tienda
    store_settings_updated: {
      cacheKeys: [],
      patterns: [
        'domain_', // Dominios
        'navigation_', // Navegación (puede cambiar con config)
      ],
      description: 'Configuración de tienda actualizada - invalidar dominios y navegación',
    },

    // Cambios en dominios
    domain_updated: {
      cacheKeys: [],
      patterns: [
        'domain_', // Dominios
      ],
      description: 'Dominio actualizado - invalidar resolución de dominios',
    },
    // Cambios en plantillas de tienda
    template_store_updated: {
      cacheKeys: [],
      patterns: [
        'template_', // Plantillas de tienda
        'compiled_template_', // Plantillas compiladas de tienda
      ],
      description: 'Plantilla de tienda actualizada - invalidar plantillas de tienda y compiladas',
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
      `Invalidating cache for ${changeType} in store ${storeId}`,
      {
        entityId,
        description: config.description,
      },
      'CacheInvalidationService'
    );

    // Invalidar por patrones
    this.invalidateByPatterns(config.patterns, storeId, entityId);

    // Invalidar claves específicas si se proporciona entityId
    if (entityId) {
      this.invalidateSpecificKeys(changeType, storeId, entityId);
    }

    // Invalidar caché de CloudFront si se trata de actualización de plantilla de tienda
    if (changeType === 'template_store_updated') {
      this.invalidateCloudFrontCache(storeId, path);
    } else if (
      [
        'product_created',
        'product_updated',
        'product_deleted',
        'collection_created',
        'collection_updated',
        'collection_deleted',
        'page_created',
        'page_updated',
        'page_deleted',
        'navigation_updated',
        'template_updated',
        'store_settings_updated',
        'domain_updated',
        'template_store_updated',
      ].includes(changeType)
    ) {
      // Para estos tipos de cambio, invalidar todas las plantillas de la tienda en CloudFront
      this.invalidateCloudFrontCache(storeId);
    }
  }

  /**
   * Invalida caché por patrones de claves
   */
  private invalidateByPatterns(patterns: string[], storeId: string, entityId?: string): void {
    let totalInvalidated = 0;
    const usedPrefixes: string[] = [];

    for (const pattern of patterns) {
      let prefix = pattern;
      if (pattern.includes('*')) {
        const wildcardValues = [storeId, entityId || ''];
        let wildcardIndex = 0;
        prefix = pattern.replace(/\*/g, () => {
          const val = wildcardValues[wildcardIndex] !== undefined ? wildcardValues[wildcardIndex] : '';
          wildcardIndex++;
          return val + '_';
        });
        prefix = prefix.replace(/__+/g, '_');
        prefix = prefix.replace(/_+$/, '_');
      }
      const deleted = cacheManager.deleteByPrefix(prefix);
      totalInvalidated += deleted;
      usedPrefixes.push(prefix);
    }
  }

  /**
   * Invalida claves específicas basadas en el tipo de cambio
   */
  private invalidateSpecificKeys(changeType: ChangeType, storeId: string, entityId: string): void {
    const specificKeys: string[] = [];

    switch (changeType) {
      case 'product_updated':
      case 'product_deleted':
        specificKeys.push(
          getProductCacheKey(storeId, entityId),
          getProductsCacheKey(storeId, undefined as any, undefined), // Pasa limit y nextToken si es necesario
          getFeaturedProductsCacheKey(storeId, undefined as any)
        );
        break;

      case 'collection_updated':
      case 'collection_deleted':
        specificKeys.push(
          getCollectionCacheKey(storeId, entityId),
          getCollectionsCacheKey(storeId, undefined as any, undefined)
        );
        break;

      case 'page_updated':
      case 'page_deleted':
        specificKeys.push(getPageCacheKey(storeId, entityId), getPagesCacheKey(storeId));
        break;
    }

    // Eliminar claves específicas
    specificKeys.forEach((key) => {
      if (cacheManager['cache'][key]) {
        delete cacheManager['cache'][key];
      }
    });
  }

  /**
   * Invalida toda la caché de una tienda
   */
  public invalidateStoreCache(storeId: string): void {
    logger.info(`Invalidating all cache for store ${storeId}`, undefined, 'CacheInvalidationService');
    cacheManager.invalidateStoreCache(storeId);
  }

  /**
   * Invalida caché de productos específicos
   */
  public invalidateProductCache(storeId: string, productId: string): void {
    logger.info(
      `Invalidating product cache for ${productId} in store ${storeId}`,
      undefined,
      'CacheInvalidationService'
    );
    cacheManager.invalidateProductCache(storeId, productId);
  }

  /**
   * Invalida caché de CloudFront para una tienda o path específico
   */
  private async invalidateCloudFrontCache(storeId: string, path?: string): Promise<void> {
    if (!process.env.CLOUDFRONT_DISTRIBUTION_ID) {
      logger.warn(
        'CLOUDFRONT_DISTRIBUTION_ID not configured, skipping CloudFront invalidation',
        undefined,
        'CacheInvalidationService'
      );
      return;
    }
    const REGION = process.env.REGION_BUCKET || 'us-east-2';
    const cloudFrontClient = new CloudFrontClient({
      region: REGION,
    });

    const invalidationPath = path ? `/templates/${storeId}/${path}` : `/templates/${storeId}/*`;

    try {
      const command = new CreateInvalidationCommand({
        DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
        InvalidationBatch: {
          Paths: {
            Quantity: 1,
            Items: [invalidationPath],
          },
          CallerReference: `template-invalidation-${Date.now()}-${storeId}`,
        },
      });

      await cloudFrontClient.send(command);
      logger.info(`CloudFront cache invalidated for: ${invalidationPath}`, undefined, 'CacheInvalidationService');
    } catch (error: any) {
      logger.error(
        `Error invalidating CloudFront cache for ${invalidationPath}: ${error.message}`,
        error,
        'CacheInvalidationService'
      );
    }
  }

  /**
   * Obtiene estadísticas de invalidación
   */
  public getInvalidationStats(): { totalInvalidations: number; lastInvalidation?: Date } {
    return {
      totalInvalidations: 0,
      lastInvalidation: undefined,
    };
  }
}

export const cacheInvalidationService = CacheInvalidationService.getInstance();
