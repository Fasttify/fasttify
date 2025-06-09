import { cookiesClient } from '@/utils/AmplifyServer'
import { cacheManager } from '@/lib/store-renderer/services/core/cache-manager'
import { dataTransformer } from '@/lib/store-renderer/services/core/data-transformer'
import type { CollectionContext, ProductContext, TemplateError } from '@/lib/store-renderer/types'

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
  ): Promise<CollectionsResponse> {
    try {
      const { limit = 10, nextToken } = options
      const cacheKey = `collections_${storeId}_${limit}_${nextToken || 'first'}`

      // Verificar caché
      const cached = cacheManager.getCached(cacheKey)
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
        cacheManager.setCached(cacheKey, result, cacheManager.COLLECTION_CACHE_TTL)
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
      cacheManager.setCached(cacheKey, result, cacheManager.COLLECTION_CACHE_TTL)

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
   */
  public async getCollection(
    storeId: string,
    collectionId: string
  ): Promise<CollectionContext | null> {
    try {
      const cacheKey = `collection_${storeId}_${collectionId}`

      // Verificar caché
      const cached = cacheManager.getCached(cacheKey)
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
      cacheManager.setCached(cacheKey, transformedCollection, cacheManager.COLLECTION_CACHE_TTL)

      return transformedCollection
    } catch (error) {
      console.error(`Error fetching collection ${collectionId} for store ${storeId}:`, error)
      return null
    }
  }

  /**
   * Transforma una colección de Amplify al formato Liquid
   */
  private async transformCollection(collection: any, storeId: string): Promise<CollectionContext> {
    const handle = dataTransformer.createHandle(
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
}

export const collectionFetcher = new CollectionFetcher()
