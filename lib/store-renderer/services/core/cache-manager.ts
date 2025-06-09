interface DataCache {
  [key: string]: {
    data: any
    timestamp: number
    ttl: number
  }
}

export class CacheManager {
  private static instance: CacheManager
  private cache: DataCache = {}

  // TTL constants
  public readonly PRODUCT_CACHE_TTL = 15 * 60 * 1000 // 15 minutos
  public readonly COLLECTION_CACHE_TTL = 30 * 60 * 1000 // 30 minutos
  public readonly STORE_CACHE_TTL = 30 * 60 * 1000 // 30 minutos
  public readonly DOMAIN_CACHE_TTL = 30 * 60 * 1000 // 30 minutos
  public readonly TEMPLATE_CACHE_TTL = 60 * 60 * 1000 // 1 hora

  private constructor() {}

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  /**
   * Obtiene una entrada del caché si existe y no ha expirado
   */
  public getCached(key: string): any | null {
    const entry = this.cache[key]
    if (!entry) {
      return null
    }

    const now = Date.now()
    if (now > entry.timestamp + entry.ttl) {
      delete this.cache[key]
      return null
    }

    return entry.data
  }

  /**
   * Guarda una entrada en el caché
   */
  public setCached(key: string, data: any, ttl: number): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      ttl,
    }
  }

  /**
   * Invalida el caché para una tienda específica
   */
  public invalidateStoreCache(storeId: string): void {
    Object.keys(this.cache).forEach(key => {
      if (key.includes(`_${storeId}_`)) {
        delete this.cache[key]
      }
    })
  }

  /**
   * Invalida el caché para un producto específico
   */
  public invalidateProductCache(storeId: string, productId: string): void {
    const keys = [
      `product_${storeId}_${productId}`,
      `products_${storeId}`,
      `featured_products_${storeId}`,
    ]

    keys.forEach(key => {
      Object.keys(this.cache).forEach(cacheKey => {
        if (cacheKey.startsWith(key)) {
          delete this.cache[cacheKey]
        }
      })
    })
  }

  /**
   * Invalida el caché para un dominio específico
   */
  public invalidateDomainCache(domain: string): void {
    const key = `domain_${domain}`
    delete this.cache[key]
  }

  /**
   * Invalida el caché para un template específico
   */
  public invalidateTemplateCache(templatePath: string): void {
    const key = `template_${templatePath}`
    delete this.cache[key]
  }

  /**
   * Limpia todo el caché
   */
  public clearCache(): void {
    this.cache = {}
  }

  /**
   * Limpia entradas expiradas del caché
   */
  public cleanExpiredCache(): void {
    const now = Date.now()
    Object.keys(this.cache).forEach(key => {
      const entry = this.cache[key]
      if (now > entry.timestamp + entry.ttl) {
        delete this.cache[key]
      }
    })
  }

  /**
   * Obtiene estadísticas del caché para debugging
   */
  public getCacheStats(): { total: number; expired: number; active: number } {
    const now = Date.now()
    let total = 0
    let expired = 0
    let active = 0

    Object.values(this.cache).forEach(entry => {
      total++
      if (now > entry.timestamp + entry.ttl) {
        expired++
      } else {
        active++
      }
    })

    return { total, expired, active }
  }
}

export const cacheManager = CacheManager.getInstance()
