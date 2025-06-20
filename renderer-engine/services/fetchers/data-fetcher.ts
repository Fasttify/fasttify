import { cacheManager } from '@/renderer-engine/services/core/cache-manager'
import { productFetcher } from '@/renderer-engine/services/fetchers/product-fetcher'
import { collectionFetcher } from '@/renderer-engine/services/fetchers/collection-fetcher'
import { navigationFetcher } from '@/renderer-engine/services/fetchers/navigation-fetcher'
import type { ProductContext, CollectionContext } from '@/renderer-engine/types'

interface PaginationOptions {
  limit?: number
  offset?: number
  nextToken?: string
}

interface ProductsResponse {
  products: ProductContext[]
  nextToken?: string
  totalCount?: number
}

interface CollectionsResponse {
  collections: CollectionContext[]
  nextToken?: string
  totalCount?: number
}

interface NavigationMenusResponse {
  menus: any[]
  mainMenu?: any
  footerMenu?: any
}

/**
 * DataFetcher refactorizado que orquesta todos los servicios especializados
 */
class DataFetcher {
  private static instance: DataFetcher

  private constructor() {}

  public static getInstance(): DataFetcher {
    if (!DataFetcher.instance) {
      DataFetcher.instance = new DataFetcher()
    }
    return DataFetcher.instance
  }

  // === PRODUCTOS ===

  /**
   * Obtiene productos de una tienda con paginación
   */
  public async getStoreProducts(
    storeId: string,
    options: PaginationOptions = {}
  ): Promise<ProductsResponse> {
    return productFetcher.getStoreProducts(storeId, options)
  }

  /**
   * Obtiene un producto específico por ID
   */
  public async getProduct(storeId: string, productId: string): Promise<ProductContext | null> {
    return productFetcher.getProduct(storeId, productId)
  }

  /**
   * Obtiene productos destacados de una tienda
   */
  public async getFeaturedProducts(storeId: string, limit: number = 8): Promise<ProductContext[]> {
    return productFetcher.getFeaturedProducts(storeId, limit)
  }

  // === COLECCIONES ===

  /**
   * Obtiene colecciones de una tienda
   */
  public async getStoreCollections(
    storeId: string,
    options: PaginationOptions = {}
  ): Promise<CollectionsResponse> {
    return collectionFetcher.getStoreCollections(storeId, options)
  }

  /**
   * Obtiene una colección específica con sus productos
   */
  public async getCollection(
    storeId: string,
    collectionId: string
  ): Promise<CollectionContext | null> {
    return collectionFetcher.getCollection(storeId, collectionId)
  }

  // === NAVEGACIÓN ===

  /**
   * Obtiene todos los menús de navegación de una tienda
   */
  public async getStoreNavigationMenus(storeId: string): Promise<NavigationMenusResponse> {
    return navigationFetcher.getStoreNavigationMenus(storeId)
  }

  // === GESTIÓN DE CACHÉ ===

  /**
   * Invalida el caché para una tienda específica
   */
  public invalidateStoreCache(storeId: string): void {
    cacheManager.invalidateStoreCache(storeId)
  }

  /**
   * Invalida el caché para un producto específico
   */
  public invalidateProductCache(storeId: string, productId: string): void {
    cacheManager.invalidateProductCache(storeId, productId)
  }

  /**
   * Limpia todo el caché
   */
  public clearCache(): void {
    cacheManager.clearCache()
  }

  /**
   * Limpia entradas expiradas del caché
   */
  public cleanExpiredCache(): void {
    cacheManager.cleanExpiredCache()
  }

  /**
   * Obtiene estadísticas del caché para debugging
   */
  public getCacheStats(): { total: number; expired: number; active: number } {
    return cacheManager.getCacheStats()
  }
}

// Export singleton instance
export const dataFetcher = DataFetcher.getInstance()

// Export class for testing
export { DataFetcher }
