import { dataFetcher } from '@/renderer-engine/services/fetchers/data-fetcher'
import { logger } from '@/renderer-engine/lib/logger'
import type { PageRenderOptions } from '@/renderer-engine/types/template'
import type {
  DataRequirement,
  DataLoadOptions,
  TemplateAnalysis,
} from '@/renderer-engine/services/templates/template-analyzer'

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
          if (dataType === 'products' && typeof data === 'object' && 'products' in data) {
            loadedData[dataType] = data.products
            if (data.nextToken) paginationInfo.nextToken = data.nextToken
            if (data.totalCount) paginationInfo.totalCount = data.totalCount
          } else if (
            dataType === 'collections' &&
            typeof data === 'object' &&
            'collections' in data
          ) {
            loadedData[dataType] = data.collections
            if (data.nextToken) paginationInfo.nextToken = data.nextToken
            if (data.totalCount) paginationInfo.totalCount = data.totalCount
          } else if (
            dataType === 'collection' &&
            typeof data === 'object' &&
            'nextToken' in data
          ) {
            loadedData.collection = data
            if (data.nextToken) {
              paginationInfo.nextToken = data.nextToken
            }
          } else {
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
 * Carga un tipo específico de datos (el gran switch).
 */
async function loadSpecificData(
  storeId: string,
  dataType: DataRequirement,
  options: DataLoadOptions,
  pageOptions: PageRenderOptions
): Promise<any> {
  switch (dataType) {
    case 'products':
      return await dataFetcher.getStoreProducts(storeId, {
        limit: options.limit || 20,
        nextToken: options.nextToken,
      })
    case 'collection_products':
      return await dataFetcher.getFeaturedProducts(storeId, options.limit || 8)
    case 'collections':
      const collectionsResult = await dataFetcher.getStoreCollections(storeId, {
        limit: options.limit || 10,
        nextToken: options.nextToken,
      })
      return collectionsResult.collections
    case 'product':
      if (pageOptions.productId || pageOptions.handle) {
        const productId = pageOptions.productId || pageOptions.handle!
        return await dataFetcher.getProduct(storeId, productId)
      }
      return null
    case 'collection':
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
    case 'cart':
      const cart = await dataFetcher.getCart(storeId)
      return dataFetcher.transformCartToContext(cart)
    case 'linklists':
      return await dataFetcher.getStoreNavigationMenus(storeId)
    case 'shop':
      return null
    default:
      logger.warn(`Unknown data type: ${dataType}`, undefined, 'DynamicDataLoader')
      return null
  }
}
