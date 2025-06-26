import { cacheManager } from '@/renderer-engine/services/core/cache-manager'
import { productFetcher } from '@/renderer-engine/services/fetchers/product-fetcher'
import { collectionFetcher } from '@/renderer-engine/services/fetchers/collection-fetcher'
import { navigationFetcher } from '@/renderer-engine/services/fetchers/navigation-fetcher'
import { cartFetcher } from '@/renderer-engine/services/fetchers/cart-fetcher'
import type {
  ProductContext,
  CollectionContext,
  Cart,
  CartContext,
  AddToCartRequest,
  UpdateCartRequest,
  CartResponse,
} from '@/renderer-engine/types'

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
export class DataFetcher {
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

  /**
   * Obtiene una colección específica por handle (slug) con sus productos
   */
  public async getCollectionByHandle(
    storeId: string,
    handle: string
  ): Promise<CollectionContext | null> {
    return collectionFetcher.getCollectionByHandle(storeId, handle)
  }

  /**
   * Obtiene una colección específica con sus productos y parámetros de sorting
   */
  public async getCollectionWithSorting(
    storeId: string,
    collectionId: string,
    sortBy?: string
  ): Promise<CollectionContext | null> {
    return collectionFetcher.getCollectionWithSorting(storeId, collectionId, sortBy)
  }

  /**
   * Obtiene una colección específica por handle con sus productos y parámetros de sorting
   */
  public async getCollectionWithSortingByHandle(
    storeId: string,
    handle: string,
    sortBy?: string
  ): Promise<CollectionContext | null> {
    return collectionFetcher.getCollectionByHandleWithSorting(storeId, handle, sortBy)
  }

  // === NAVEGACIÓN ===

  /**
   * Obtiene todos los menús de navegación de una tienda
   */
  public async getStoreNavigationMenus(storeId: string): Promise<NavigationMenusResponse> {
    return navigationFetcher.getStoreNavigationMenus(storeId)
  }

  // === CARRITO ===

  /**
   * Obtiene el carrito para una sesión específica
   */
  public async getCart(storeId: string): Promise<Cart> {
    return cartFetcher.getCart(storeId)
  }

  /**
   * Agrega un producto al carrito
   */
  public async addToCart(request: AddToCartRequest): Promise<CartResponse> {
    return cartFetcher.addToCart(request)
  }

  /**
   * Actualiza la cantidad de un item en el carrito
   */
  public async updateCartItem(request: UpdateCartRequest): Promise<CartResponse> {
    return cartFetcher.updateCartItem(request)
  }

  /**
   * Remueve un item del carrito
   */
  public async removeFromCart(storeId: string, itemId: string): Promise<CartResponse> {
    return cartFetcher.removeFromCart(storeId, itemId)
  }

  /**
   * Limpia todos los items del carrito
   */
  public async clearCart(storeId: string): Promise<CartResponse> {
    return cartFetcher.clearCart(storeId)
  }

  /**
   * Convierte un carrito a contexto Liquid
   */
  public transformCartToContext(cart: Cart): CartContext {
    return cartFetcher.transformCartToContext(cart)
  }

  /**
   * Limpia carritos expirados
   */
  public cleanupExpiredCarts(): void {
    return cartFetcher.cleanupExpiredCarts()
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
export const dataFetcher = new DataFetcher()

// Class ya está exportada arriba
