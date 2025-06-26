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
        const transformedCollection = await this.transformCollection(collection, storeId, {
          withProducts: false,
        })
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
      const transformedCollection = await this.transformCollection(collection, storeId, {
        withProducts: true,
      })

      // Guardar en caché
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
   * Transforma una colección de Amplify al formato Liquid
   */
  public async transformCollection(
    collection: any,
    storeId: string,
    options: { withProducts?: boolean; sortBy?: string } = {}
  ): Promise<CollectionContext> {
    const handle = dataTransformer.createHandle(
      collection.name || collection.title || `collection-${collection.id}`
    )

    // Obtener productos de la colección usando la relación hasMany
    let products: ProductContext[] = []
    if (options.withProducts) {
      try {
        let allProducts: any[] = []
        let nextToken: string | null | undefined = undefined

        do {
          const productResult: { data: any[]; nextToken?: string | null } =
            await collection.products({ nextToken })
          if (productResult.data) {
            allProducts = allProducts.concat(productResult.data)
          }
          nextToken = productResult.nextToken
        } while (nextToken)

        if (allProducts.length > 0) {
          products = allProducts.map((p: any) => productFetcher.transformProduct(p))
        }
      } catch (error) {
        logger.warn(
          `Could not fetch products for collection ${collection.id}`,
          error,
          'CollectionFetcher'
        )
      }
    }

    // Transformar imagen de colección
    const image = collection.image || 'collection-img'

    // Definir opciones de sorting estándar (compatibles con Shopify)
    const sortOptions = [
      { name: 'Mejor resultado', value: 'manual' },
      { name: 'Más vendidos', value: 'best-selling' },
      { name: 'Alfabéticamente, A-Z', value: 'title-ascending' },
      { name: 'Alfabéticamente, Z-A', value: 'title-descending' },
      { name: 'Precio, menor a mayor', value: 'price-ascending' },
      { name: 'Precio, mayor a menor', value: 'price-descending' },
      { name: 'Fecha, nuevo a antiguo', value: 'created-descending' },
      { name: 'Fecha, antiguo a nuevo', value: 'created-ascending' },
    ]

    return {
      id: collection.id,
      storeId: collection.storeId,
      title: collection.name || collection.title || '',
      description: collection.description || '',
      slug: handle,
      url: `/collections/${handle}`,
      image,
      sort_by: options.sortBy || 'manual', // Sorting actual aplicado
      default_sort_by: 'manual', // Sorting por defecto
      sort_options: sortOptions, // Opciones disponibles para el selector
      isActive: collection.isActive,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      owner: collection.owner,
      sortOrder: collection.sortOrder,
      products,
    }
  }

  /**
   * Obtiene una colección específica por handle (slug) sin cargar todas las colecciones
   */
  public async getCollectionByHandle(
    storeId: string,
    handle: string
  ): Promise<CollectionContext | null> {
    try {
      const cacheKey = `collection_handle_${storeId}_${handle}`

      // Verificar caché
      const cached = cacheManager.getCached(cacheKey)
      if (cached) {
        return cached as CollectionContext
      }

      // Buscar colección por handle/slug directamente en la base de datos
      // Nota: Amplify no tiene filtro directo por handle, así que necesitamos una consulta custom
      // Por ahora, usamos la búsqueda optimizada

      // Obtener todas las colecciones (solo metadatos, sin productos)
      const collections = await this.getStoreCollections(storeId, { limit: 100 })

      // Buscar por handle o título transformado
      const collectionRef = collections.collections.find(
        c => c.slug === handle || c.title.toLowerCase().replace(/\s+/g, '-') === handle
      )

      if (!collectionRef) {
        return null
      }

      // Ahora obtener la colección completa con productos
      const fullCollection = await this.getCollection(storeId, collectionRef.id)

      if (fullCollection) {
        // Guardar en caché con la clave del handle
        cacheManager.setCached(cacheKey, fullCollection, cacheManager.COLLECTION_CACHE_TTL)
      }

      return fullCollection
    } catch (error) {
      logger.error(
        `Error fetching collection by handle ${handle} for store ${storeId}`,
        error,
        'CollectionFetcher'
      )
      return null
    }
  }

  /**
   * Obtiene una colección específica por handle con sus productos y parámetros de sorting
   */
  public async getCollectionByHandleWithSorting(
    storeId: string,
    handle: string,
    sortBy?: string
  ): Promise<CollectionContext | null> {
    const collection = await this.getCollectionByHandle(storeId, handle)

    if (collection && sortBy) {
      // Re-transformar la colección con el sortBy especificado
      const collectionData = {
        id: collection.id,
        storeId,
        name: collection.title,
        title: collection.title,
        description: collection.description,
        image: collection.image,
        isActive: collection.isActive,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
        owner: collection.owner,
        sortOrder: collection.sortOrder,
        products: () => Promise.resolve({ data: collection.products }),
      }

      return this.transformCollection(collectionData, storeId, {
        withProducts: true,
        sortBy,
      })
    }
    return collection
  }

  /**
   * Obtiene una colección específica con sus productos y parámetros de sorting
   */
  public async getCollectionWithSorting(
    storeId: string,
    collectionId: string,
    sortBy?: string
  ): Promise<CollectionContext | null> {
    const collection = await this.getCollection(storeId, collectionId)

    if (collection && sortBy) {
      // Re-transformar la colección con el sortBy especificado
      const collectionData = {
        id: collectionId,
        storeId,
        name: collection.title,
        title: collection.title,
        description: collection.description,
        image: collection.image,
        isActive: collection.isActive,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
        owner: collection.owner,
        sortOrder: collection.sortOrder,
        products: () => Promise.resolve({ data: collection.products }),
      }

      return this.transformCollection(collectionData, storeId, {
        withProducts: true,
        sortBy,
      })
    }
    return collection
  }
}

export const collectionFetcher = new CollectionFetcher()
