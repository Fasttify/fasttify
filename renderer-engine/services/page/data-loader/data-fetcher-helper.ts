import { dataFetcher } from '@/renderer-engine/services/fetchers/data-fetcher'
import { logger } from '@/renderer-engine/lib/logger'
import type { PageRenderOptions } from '@/renderer-engine/types/template'
import type {
  DataRequirement,
  DataLoadOptions,
  TemplateAnalysis,
} from '@/renderer-engine/services/templates/template-analyzer'

/**
 * Tipo para las funciones handlers de datos
 */
type DataHandler = (
  storeId: string,
  options: DataLoadOptions,
  pageOptions: PageRenderOptions
) => Promise<any>

/**
 * Tipo para procesadores de respuesta de datos
 */
type ResponseProcessor = (
  data: any,
  dataType: DataRequirement,
  loadedData: Record<string, any>,
  paginationInfo: { nextToken?: string; totalCount?: number }
) => void

/**
 * Handlers declarativos para cada tipo de datos
 */
const dataHandlers: Record<DataRequirement, DataHandler> = {
  products: async (storeId, options) => {
    return await dataFetcher.getStoreProducts(storeId, {
      limit: options.limit || 20,
      nextToken: options.nextToken,
    })
  },

  collection_products: async (storeId, options) => {
    return await dataFetcher.getFeaturedProducts(storeId, options.limit || 8)
  },

  collections: async (storeId, options) => {
    const collectionsResult = await dataFetcher.getStoreCollections(storeId, {
      limit: options.limit || 10,
      nextToken: options.nextToken,
    })
    return collectionsResult.collections
  },

  product: async (storeId, options, pageOptions) => {
    if (pageOptions.productId || pageOptions.handle) {
      const productId = pageOptions.productId || pageOptions.handle!
      return await dataFetcher.getProduct(storeId, productId)
    }
    return null
  },

  collection: async (storeId, options, pageOptions) => {
    if (pageOptions.collectionId) {
      return await dataFetcher.getCollection(storeId, pageOptions.collectionId, options)
    } else if (pageOptions.handle) {
      const collectionsResult = await dataFetcher.getStoreCollections(storeId)
      const collectionRef = collectionsResult.collections.find(
        c =>
          c.slug === pageOptions.handle ||
          c.title.toLowerCase().replace(/\s+/g, '-') === pageOptions.handle
      )
      if (collectionRef) {
        return await dataFetcher.getCollection(storeId, collectionRef.id, options)
      }
    }
    return null
  },

  cart: async storeId => {
    const cart = await dataFetcher.getCart(storeId)
    return dataFetcher.transformCartToContext(cart)
  },

  linklists: async storeId => {
    return await dataFetcher.getStoreNavigationMenus(storeId)
  },

  shop: async () => {
    return null
  },

  page: async (storeId, options, pageOptions) => {
    // Handler para páginas estáticas, podría implementarse según necesidades
    return null
  },

  blog: async (storeId, options) => {
    // Handler para blog, podría implementarse según necesidades
    return null
  },

  pagination: async () => {
    // Pagination se maneja a nivel de template/request, no es un dato per se
    return null
  },
}

/**
 * Procesadores declarativos para respuestas de datos
 */
const responseProcessors: Record<DataRequirement, ResponseProcessor> = {
  products: (data, dataType, loadedData, paginationInfo) => {
    if (typeof data === 'object' && 'products' in data) {
      loadedData[dataType] = data.products
      if (data.nextToken) paginationInfo.nextToken = data.nextToken
      if (data.totalCount) paginationInfo.totalCount = data.totalCount
    } else {
      loadedData[dataType] = data
    }
  },

  collections: (data, dataType, loadedData, paginationInfo) => {
    if (typeof data === 'object' && 'collections' in data) {
      loadedData[dataType] = data.collections
      if (data.nextToken) paginationInfo.nextToken = data.nextToken
      if (data.totalCount) paginationInfo.totalCount = data.totalCount
    } else {
      loadedData[dataType] = data
    }
  },

  collection: (data, dataType, loadedData, paginationInfo) => {
    if (typeof data === 'object' && 'nextToken' in data) {
      loadedData.collection = data
      if (data.nextToken) paginationInfo.nextToken = data.nextToken
    } else {
      loadedData[dataType] = data
    }
  },

  // Para estos tipos, simplemente asignar directamente
  collection_products: (data, dataType, loadedData) => {
    loadedData[dataType] = data
  },

  product: (data, dataType, loadedData) => {
    loadedData[dataType] = data
  },

  cart: (data, dataType, loadedData) => {
    loadedData[dataType] = data
  },

  linklists: (data, dataType, loadedData) => {
    loadedData[dataType] = data
  },

  shop: (data, dataType, loadedData) => {
    loadedData[dataType] = data
  },

  page: (data, dataType, loadedData) => {
    loadedData[dataType] = data
  },

  blog: (data, dataType, loadedData) => {
    loadedData[dataType] = data
  },

  pagination: (data, dataType, loadedData) => {
    loadedData[dataType] = data
  },
}

/**
 * Carga datos basándose en el análisis de plantillas.
 */
export async function loadDataFromAnalysis(
  storeId: string,
  analysis: TemplateAnalysis,
  options: PageRenderOptions,
  searchParams: Record<string, string> = {}
): Promise<{
  loadedData: Record<string, any>
  paginationInfo: { nextToken?: string; totalCount?: number }
}> {
  const loadedData: Record<string, any> = {}
  const paginationInfo: { nextToken?: string; totalCount?: number } = {}
  const loadPromises: Promise<void>[] = []

  for (const [dataType, loadOptions] of analysis.requiredData) {
    const enhancedLoadOptions = {
      ...loadOptions,
      nextToken: searchParams.token || loadOptions.nextToken,
    }

    const promise = loadSpecificData(storeId, dataType, enhancedLoadOptions, options)
      .then(data => {
        if (data) {
          const processor = responseProcessors[dataType]
          if (processor) {
            processor(data, dataType, loadedData, paginationInfo)
          } else {
            // Fallback para tipos no procesados
            loadedData[dataType] = data
          }
        }
      })
      .catch(error => {
        logger.warn(`Failed to load ${dataType}`, error, 'DynamicDataLoader')
      })

    loadPromises.push(promise)
  }

  await Promise.all(loadPromises)
  return { loadedData, paginationInfo }
}

/**
 * Carga un tipo específico de datos usando handlers declarativos.
 */
async function loadSpecificData(
  storeId: string,
  dataType: DataRequirement,
  options: DataLoadOptions,
  pageOptions: PageRenderOptions
): Promise<any> {
  const handler = dataHandlers[dataType]

  if (!handler) {
    logger.warn(`Unknown data type: ${dataType}`, undefined, 'DynamicDataLoader')
    return null
  }

  return await handler(storeId, options, pageOptions)
}
