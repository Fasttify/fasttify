import { cookiesClient } from '@/utils/AmplifyServer'
import type { ProductContext, CollectionContext, TemplateError } from '../types'

interface DataCache {
  [key: string]: {
    data: any
    timestamp: number
    ttl: number
  }
}

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

class DataFetcher {
  private static instance: DataFetcher
  private cache: DataCache = {}
  private readonly PRODUCT_CACHE_TTL = 15 * 60 * 1000 // 15 minutos
  private readonly COLLECTION_CACHE_TTL = 30 * 60 * 1000 // 30 minutos
  private readonly STORE_CACHE_TTL = 30 * 60 * 1000 // 30 minutos

  private constructor() {}

  public static getInstance(): DataFetcher {
    if (!DataFetcher.instance) {
      DataFetcher.instance = new DataFetcher()
    }
    return DataFetcher.instance
  }

  /**
   * Obtiene productos de una tienda con paginación
   * @param storeId - ID de la tienda
   * @param options - Opciones de paginación
   * @returns Lista de productos transformados para Liquid
   */
  public async getStoreProducts(
    storeId: string,
    options: PaginationOptions = {}
  ): Promise<ProductsResponse> {
    try {
      const { limit = 20, nextToken } = options
      const cacheKey = `products_${storeId}_${limit}_${nextToken || 'first'}`

      // Verificar caché
      const cached = this.getCached(cacheKey)
      if (cached) {
        return cached as ProductsResponse
      }

      // Obtener productos desde Amplify
      const response = await cookiesClient.models.Product.listProductByStoreId(
        { storeId },
        {
          limit,
          nextToken,
        }
      )

      if (!response.data) {
        throw new Error(`No products found for store: ${storeId}`)
      }

      // Transformar productos al formato Liquid
      const products: ProductContext[] = response.data.map(product =>
        this.transformProduct(product)
      )

      const result: ProductsResponse = {
        products,
        nextToken: response.nextToken || undefined,
        totalCount: products.length,
      }

      // Guardar en caché
      this.setCached(cacheKey, result, this.PRODUCT_CACHE_TTL)

      return result
    } catch (error) {
      console.error(`Error fetching products for store ${storeId}:`, error)

      const templateError: TemplateError = {
        type: 'DATA_ERROR',
        message: `Failed to fetch products for store: ${storeId}`,
        details: error,
        statusCode: 500,
      }

      throw templateError
    }
  }

  /**
   * Obtiene un producto específico por ID
   * @param storeId - ID de la tienda
   * @param productId - ID del producto
   * @returns Producto transformado para Liquid
   */
  public async getProduct(storeId: string, productId: string): Promise<ProductContext | null> {
    try {
      const cacheKey = `product_${storeId}_${productId}`

      // Verificar caché
      const cached = this.getCached(cacheKey)
      if (cached) {
        return cached as ProductContext
      }

      // Obtener producto desde Amplify
      const { data: product } = await cookiesClient.models.Product.get({
        id: productId,
      })

      if (!product || product.storeId !== storeId) {
        return null
      }

      // Transformar producto
      const transformedProduct = this.transformProduct(product)

      // Guardar en caché
      this.setCached(cacheKey, transformedProduct, this.PRODUCT_CACHE_TTL)

      return transformedProduct
    } catch (error) {
      console.error(`Error fetching product ${productId} for store ${storeId}:`, error)
      return null
    }
  }

  /**
   * Obtiene colecciones de una tienda
   * @param storeId - ID de la tienda
   * @param options - Opciones de paginación
   * @returns Lista de colecciones transformadas para Liquid
   */
  public async getStoreCollections(
    storeId: string,
    options: PaginationOptions = {}
  ): Promise<CollectionsResponse> {
    try {
      const { limit = 10, nextToken } = options
      const cacheKey = `collections_${storeId}_${limit}_${nextToken || 'first'}`

      // Verificar caché
      const cached = this.getCached(cacheKey)
      if (cached) {
        return cached as CollectionsResponse
      }

      // Obtener colecciones desde Amplify
      const response = await cookiesClient.models.Collection.listCollectionByStoreId(
        { storeId },
        {
          limit,
          nextToken,
        }
      )

      if (!response.data || response.data.length === 0) {
        // Retornar resultado vacío en lugar de error
        const result: CollectionsResponse = {
          collections: [],
          nextToken: undefined,
          totalCount: 0,
        }
        this.setCached(cacheKey, result, this.COLLECTION_CACHE_TTL)
        return result
      }

      // Transformar colecciones al formato Liquid
      const collections: CollectionContext[] = []

      for (const collection of response.data) {
        const transformedCollection = await this.transformCollection(collection, storeId)
        collections.push(transformedCollection)
      }

      const result: CollectionsResponse = {
        collections,
        nextToken: response.nextToken || undefined,
        totalCount: collections.length,
      }

      // Guardar en caché
      this.setCached(cacheKey, result, this.COLLECTION_CACHE_TTL)

      return result
    } catch (error) {
      console.error(`Error fetching collections for store ${storeId}:`, error)

      const templateError: TemplateError = {
        type: 'DATA_ERROR',
        message: `Failed to fetch collections for store: ${storeId}`,
        details: error,
        statusCode: 500,
      }

      throw templateError
    }
  }

  /**
   * Obtiene una colección específica con sus productos
   * @param storeId - ID de la tienda
   * @param collectionId - ID de la colección
   * @returns Colección transformada para Liquid con productos
   */
  public async getCollection(
    storeId: string,
    collectionId: string
  ): Promise<CollectionContext | null> {
    try {
      const cacheKey = `collection_${storeId}_${collectionId}`

      // Verificar caché
      const cached = this.getCached(cacheKey)
      if (cached) {
        return cached as CollectionContext
      }

      // Obtener colección desde Amplify
      const { data: collection } = await cookiesClient.models.Collection.get({
        id: collectionId,
      })

      if (!collection || collection.storeId !== storeId) {
        return null
      }

      // Transformar colección con productos
      const transformedCollection = await this.transformCollection(collection, storeId)

      // Guardar en caché
      this.setCached(cacheKey, transformedCollection, this.COLLECTION_CACHE_TTL)

      return transformedCollection
    } catch (error) {
      console.error(`Error fetching collection ${collectionId} for store ${storeId}:`, error)
      return null
    }
  }

  /**
   * Obtiene productos destacados de una tienda
   * @param storeId - ID de la tienda
   * @param limit - Número máximo de productos
   * @returns Lista de productos destacados
   */
  public async getFeaturedProducts(storeId: string, limit: number = 8): Promise<ProductContext[]> {
    try {
      const cacheKey = `featured_products_${storeId}_${limit}`

      // Verificar caché
      const cached = this.getCached(cacheKey)
      if (cached) {
        return cached as ProductContext[]
      }

      // Obtener productos destacados desde Amplify
      // TODO: Implementar sistema de productos destacados real
      // Por ahora, obtener los productos más recientes
      const response = await cookiesClient.models.Product.listProductByStoreId(
        { storeId },
        {
          limit,
        }
      )

      if (!response.data) {
        return []
      }

      const products = response.data.map(product => this.transformProduct(product))

      // Guardar en caché
      this.setCached(cacheKey, products, this.PRODUCT_CACHE_TTL)

      return products
    } catch (error) {
      console.error(`Error fetching featured products for store ${storeId}:`, error)
      return []
    }
  }

  /**
   * Transforma un producto de Amplify al formato Liquid
   */
  private transformProduct(product: any): ProductContext {
    // Crear handle SEO-friendly
    const handle = this.createHandle(product.name || product.title || `product-${product.id}`)

    // Formatear precio
    const price = this.formatPrice(product.price || 0)
    const compareAtPrice = product.compareAtPrice
      ? this.formatPrice(product.compareAtPrice)
      : undefined

    // Transformar imágenes - pueden venir como string JSON o array
    let imagesArray = []
    if (product.images) {
      if (typeof product.images === 'string') {
        try {
          imagesArray = JSON.parse(product.images)
        } catch (error) {
          console.warn('Error parsing product images JSON:', error)
          imagesArray = []
        }
      } else if (Array.isArray(product.images)) {
        imagesArray = product.images
      }
    }

    const images = Array.isArray(imagesArray)
      ? imagesArray.map((img: any, index: number) => ({
          url: img.url || img.src || '',
          alt: img.altText || img.alt || product.name || '',
        }))
      : []

    // Transformar variantes - pueden venir como string JSON o array
    let variantsArray = []
    if (product.variants) {
      if (typeof product.variants === 'string') {
        try {
          variantsArray = JSON.parse(product.variants)
        } catch (error) {
          console.warn('Error parsing product variants JSON:', error)
          variantsArray = []
        }
      } else if (Array.isArray(product.variants)) {
        variantsArray = product.variants
      }
    }

    const variants = Array.isArray(variantsArray)
      ? variantsArray.map((variant: any) => ({
          id: variant.id,
          title: variant.title || variant.name || 'Default',
          price: this.formatPrice(variant.price || product.price || 0),
          available: (variant.quantity || variant.stock || 0) > 0,
          sku: variant.sku,
        }))
      : []

    const attributes = Array.isArray(product.attributes)
      ? product.attributes.map((attribute: any) => ({
          name: attribute.name,
          values: attribute.values,
        }))
      : []

    return {
      id: product.id,
      storeId: product.storeId,
      name: product.name,
      slug: product.slug,
      attributes: attributes,
      quantity: product.quantity,
      description: product.description,
      price: price,
      compare_at_price: compareAtPrice,
      url: `/products/${handle}`,
      images: images,
      variants: variants,
      status: product.status,
      category: product.category,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }
  }

  /**
   * Transforma una colección de Amplify al formato Liquid
   */
  private async transformCollection(collection: any, storeId: string): Promise<CollectionContext> {
    const handle = this.createHandle(
      collection.name || collection.title || `collection-${collection.id}`
    )

    // Obtener productos de la colección si existe relación
    const products: ProductContext[] = []
    // TODO: Implementar obtención de productos de colección si existe la relación

    // Transformar imagen de colección
    const image = collection.image || 'collection-img'

    return {
      id: collection.id,
      storeId: collection.storeId,
      title: collection.name || collection.title || '',
      description: collection.description || '',
      slug: handle,
      url: `/collections/${handle}`,
      image,
      isActive: collection.isActive,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      owner: collection.owner,
      sortOrder: collection.sortOrder,
      products,
    }
  }

  /**
   * Crea un handle SEO-friendly a partir de un texto
   */
  private createHandle(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[áàäâã]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöôõ]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  /**
   * Formatea un precio para mostrar en pesos colombianos
   */
  private formatPrice(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  /**
   * Obtiene una entrada del caché si existe y no ha expirado
   */
  private getCached(key: string): any | null {
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
  private setCached(key: string, data: any, ttl: number): void {
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

// Export singleton instance
export const dataFetcher = DataFetcher.getInstance()

// Export class for testing
export { DataFetcher }
