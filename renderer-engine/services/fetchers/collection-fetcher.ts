import { cookiesClient } from '@/utils/AmplifyServer'
import { cacheManager } from '@/renderer-engine/services/core/cache-manager'
import { dataTransformer } from '@/renderer-engine/services/core/data-transformer'
import { productFetcher } from '@/renderer-engine/services/fetchers/product-fetcher'
import { logger } from '@/renderer-engine/lib/logger'
import type { CollectionContext, ProductContext, TemplateError } from '@/renderer-engine/types'

interface PaginationOptions {
  limit?: number
  offset?: number
  nextToken?: string
}

interface CollectionsResponse {
  collections: CollectionContext[]
  nextToken?: string
  totalCount?: number
}

export class CollectionFetcher {
  /**
   * Obtiene colecciones de una tienda
   */
  public async getStoreCollections(
    storeId: string,
    options: PaginationOptions = {}
  ): Promise<CollectionContext[]> {
    try {
      const { limit = 10, nextToken } = options
      const cacheKey = `collections_${storeId}_${limit}_${nextToken || 'first'}`

      const cached = cacheManager.getCached(cacheKey)
      if (cached) {
        return cached as CollectionContext[]
      }

      // Obtener colecciones desde Amplify
      const response = await cookiesClient.models.Collection.listCollectionByStoreId(
        { storeId },
        {
          limit,
          nextToken,
        }
      )

      if (!response.data) {
        return []
      }
      const collections: CollectionContext[] = []
      for (const collection of response.data) {
        const transformedCollection = this.transformCollection(collection, [], null)
        collections.push(transformedCollection)
      }

      cacheManager.setCached(cacheKey, collections, cacheManager.COLLECTION_CACHE_TTL)
      return collections
    } catch (error) {
      logger.error(`Error fetching collections for store ${storeId}`, error, 'CollectionFetcher')

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
   * Obtiene una colección específica con sus productos paginados.
   */
  public async getCollection(
    storeId: string,
    collectionId: string,
    options: PaginationOptions = {}
  ): Promise<CollectionContext | null> {
    try {
      const cacheKey = `collection_${storeId}_${collectionId}_${options.limit || 'def'}_${
        options.nextToken || 'first'
      }`
      const cached = cacheManager.getCached(cacheKey)
      if (cached) {
        return cached as CollectionContext
      }

      const { data: collection } = await cookiesClient.models.Collection.get({
        id: collectionId,
      })
      if (!collection || collection.storeId !== storeId) {
        return null
      }

      const { products, nextToken } = await productFetcher.getProductsByCollection(
        storeId,
        collectionId,
        options
      )

      const transformedCollection = this.transformCollection(collection, products, nextToken)

      cacheManager.setCached(cacheKey, transformedCollection, cacheManager.COLLECTION_CACHE_TTL)
      return transformedCollection
    } catch (error) {
      logger.error(
        `Error fetching collection ${collectionId} for store ${storeId}`,
        error,
        'CollectionFetcher'
      )
      return null
    }
  }

  /**
   * Transforma una colección de Amplify al formato Liquid, inyectando productos paginados.
   */
  private transformCollection(
    collection: any,
    products: ProductContext[],
    nextToken: string | null | undefined
  ): CollectionContext {
    const handle = dataTransformer.createHandle(
      collection.name || collection.title || `collection-${collection.id}`
    )

    return {
      id: collection.id,
      storeId: collection.storeId,
      title: collection.title,
      description: collection.description,
      slug: handle,
      url: `/collections/${handle}`,
      image: collection.image || 'collection-img',
      products,
      nextToken,
      owner: collection.owner,
      sortOrder: collection.sortOrder,
      isActive: collection.isActive,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    }
  }
}

export const collectionFetcher = new CollectionFetcher()
