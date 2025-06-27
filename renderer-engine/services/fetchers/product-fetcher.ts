import { cookiesClient } from '@/utils/AmplifyServer'
import { cacheManager } from '@/renderer-engine/services/core/cache-manager'
import { logger } from '@/renderer-engine/lib/logger'
import { dataTransformer } from '@/renderer-engine/services/core/data-transformer'
import type { ProductContext, TemplateError } from '@/renderer-engine/types'

interface PaginationOptions {
  limit?: number
  nextToken?: string
}

interface ProductsResponse {
  products: ProductContext[]
  nextToken?: string | null
  totalCount?: number
}

export class ProductFetcher {
  /**
   * Obtiene productos de una tienda con paginación
   */
  public async getStoreProducts(
    storeId: string,
    options: PaginationOptions = {}
  ): Promise<ProductsResponse> {
    try {
      const { limit = 20, nextToken } = options
      const cacheKey = `products_${storeId}_${limit}_${nextToken || 'first'}`

      // Verificar caché
      const cached = cacheManager.getCached(cacheKey)
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
        nextToken: response.nextToken,
        totalCount: products.length,
      }

      // Guardar en caché
      cacheManager.setCached(cacheKey, result, cacheManager.PRODUCT_CACHE_TTL)

      return result
    } catch (error) {
      logger.error(
        `Error fetching products for store ${storeId}`,
        error,
        'ProductFetcher'
      )

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
   */
  public async getProduct(
    storeId: string,
    productId: string
  ): Promise<ProductContext | null> {
    try {
      const cacheKey = `product_${storeId}_${productId}`

      // Verificar caché
      const cached = cacheManager.getCached(cacheKey)
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
      cacheManager.setCached(cacheKey, transformedProduct, cacheManager.PRODUCT_CACHE_TTL)

      return transformedProduct
    } catch (error) {
      logger.error(
        `Error fetching product ${productId} for store ${storeId}`,
        error,
        'ProductFetcher'
      )
      return null
    }
  }

  /**
   * Obtiene productos destacados de una tienda
   */
  public async getFeaturedProducts(
    storeId: string,
    limit: number = 8
  ): Promise<ProductContext[]> {
    try {
      const cacheKey = `featured_products_${storeId}_${limit}`

      // Verificar caché
      const cached = cacheManager.getCached(cacheKey)
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
      cacheManager.setCached(cacheKey, products, cacheManager.PRODUCT_CACHE_TTL)

      return products
    } catch (error) {
      logger.error(
        `Error fetching featured products for store ${storeId}`,
        error,
        'ProductFetcher'
      )
      return []
    }
  }

  /**
   * Obtiene productos de una colección específica con paginación usando el índice secundario.
   */
  public async getProductsByCollection(
    storeId: string,
    collectionId: string,
    options: PaginationOptions = {}
  ): Promise<ProductsResponse> {
    try {
      const { limit = 20, nextToken } = options

      // Usar el índice secundario para una consulta eficiente.
      const response = await cookiesClient.models.Product.listProductByCollectionId(
        {
          collectionId: collectionId,
        },
        {
          limit,
          nextToken: nextToken,
        }
      )

      const products = response.data.map(p => this.transformProduct(p))

      return {
        products,
        nextToken: response.nextToken,
      }
    } catch (error) {
      logger.error(
        `Error fetching products for collection ${collectionId}`,
        error,
        'ProductFetcher'
      )
      return { products: [], totalCount: 0 }
    }
  }

  /**
   * Transforma un producto de Amplify al formato Liquid
   */
  public transformProduct(product: any): ProductContext {
    // Crear handle SEO-friendly
    const handle = dataTransformer.createHandle(product.name)

    // Formatear precio
    const price = dataTransformer.formatPrice(product.price || 0)
    const compareAtPrice = product.compareAtPrice
      ? dataTransformer.formatPrice(product.compareAtPrice)
      : undefined

    // Transformar imágenes, variantes y atributos usando DataTransformer
    const images = dataTransformer.transformImages(product.images, product.name)
    const variants = dataTransformer.transformVariants(product.variants, product.price)
    const attributes = dataTransformer.transformAttributes(product.attributes)
    const featured_image = images.length > 0 ? images[0].url : undefined

    return {
      id: product.id,
      storeId: product.storeId,
      name: product.name,
      title: product.name,
      slug: handle,
      attributes: attributes,
      featured_image: featured_image,
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
}

export const productFetcher = new ProductFetcher()
