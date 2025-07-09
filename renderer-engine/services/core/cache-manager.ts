import { logger } from '@/renderer-engine/lib/logger';

interface DataCache {
  [key: string]: {
    data: any;
    timestamp: number;
    ttl: number;
  };
}

export class CacheManager {
  private static instance: CacheManager;
  private cache: DataCache = {};
  private isDevelopment: boolean;

  // TTL constants
  public readonly PRODUCT_CACHE_TTL = 15 * 60 * 1000; // 15 minutos
  public readonly COLLECTION_CACHE_TTL = 30 * 60 * 1000; // 30 minutos
  public readonly STORE_CACHE_TTL = 30 * 60 * 1000; // 30 minutos
  public readonly DOMAIN_CACHE_TTL = 30 * 60 * 1000; // 30 minutos
  public readonly TEMPLATE_CACHE_TTL = 60 * 60 * 1000; // 1 hora

  // TTL reducidos para desarrollo
  private readonly DEV_TEMPLATE_CACHE_TTL = 1000; // 1 segundo en desarrollo

  private constructor() {
    // Determinar si estamos en modo desarrollo
    this.isDevelopment = process.env.APP_ENV === 'development';
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Obtiene el TTL adecuado según el tipo de caché y el entorno
   */
  public getAppropiateTTL(cacheType: 'template' | 'product' | 'collection' | 'store' | 'domain'): number {
    // En desarrollo, usar TTL reducidos para templates
    if (this.isDevelopment && cacheType === 'template') {
      return this.DEV_TEMPLATE_CACHE_TTL;
    }

    // En producción o para otros tipos, usar los TTL normales
    switch (cacheType) {
      case 'template':
        return this.TEMPLATE_CACHE_TTL;
      case 'product':
        return this.PRODUCT_CACHE_TTL;
      case 'collection':
        return this.COLLECTION_CACHE_TTL;
      case 'store':
        return this.STORE_CACHE_TTL;
      case 'domain':
        return this.DOMAIN_CACHE_TTL;
      default:
        return this.STORE_CACHE_TTL;
    }
  }

  /**
   * Obtiene una entrada del caché si existe y no ha expirado
   */
  public getCached(key: string): any | null {
    const entry = this.cache[key];
    if (!entry) {
      logger.debug(`[CACHE MISS] Key: ${key}`);
      return null;
    }

    const now = Date.now();
    if (now > entry.timestamp + entry.ttl) {
      logger.debug(`[CACHE EXPIRED] Key: ${key}`);
      delete this.cache[key];
      return null;
    }

    logger.debug(`[CACHE HIT] Key: ${key}`);
    return entry.data;
  }

  /**
   * Guarda una entrada en el caché
   */
  public setCached(key: string, data: any, ttl: number): void {
    // Si la clave comienza con 'template_' y estamos en desarrollo, usar TTL corto
    if (key.startsWith('template_') && this.isDevelopment) {
      ttl = this.DEV_TEMPLATE_CACHE_TTL;
    }

    logger.debug(`[CACHE SET] Key: ${key}, TTL: ${ttl}ms`);
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
}

export const cacheManager = CacheManager.getInstance();
