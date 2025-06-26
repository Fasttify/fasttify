import { dataFetcher } from '@/renderer-engine/services/fetchers/data-fetcher'
import type { PageRenderOptions } from '@/renderer-engine/types/template'

class PageDataLoader {
  public async load(storeId: string, options: PageRenderOptions) {
    // =============================================
    // DATOS GLOBALES (necesarios en todas las páginas)
    // =============================================

    // Carrito - siempre necesario para header/contador
    const cart = await dataFetcher.getCart(storeId)
    const cartContext = dataFetcher.transformCartToContext(cart)

    // Base de datos para todas las páginas
    const baseData = {
      featuredProducts: [],
      collections: [],
      contextData: {},
      metaData: {},
      cartData: cartContext, // Dato global
    }

    // =============================================
    // DATOS ESPECÍFICOS POR TIPO DE PÁGINA
    // =============================================

    switch (options.pageType) {
      case 'index':
        const [featuredProducts, collections] = await Promise.all([
          dataFetcher.getFeaturedProducts(storeId, 8),
          dataFetcher.getStoreCollections(storeId, { limit: 6 }),
        ])
        return {
          ...baseData,
          featuredProducts,
          collections: collections.collections,
          contextData: {
            template: 'index',
            page_title: 'Inicio',
          },
        }

      case 'product':
        if (options.productId || options.handle) {
          const productId = options.productId || options.handle!
          const product = await dataFetcher.getProduct(storeId, productId)
          if (product) {
            return {
              ...baseData,
              contextData: {
                template: 'product',
                product,
                page_title: product.name,
              },
            }
          }
        }
        return {
          ...baseData,
          contextData: {
            template: 'product',
            page_title: 'Producto',
          },
        }

      case 'collection':
        if (options.collectionId) {
          const collection = options.sortBy
            ? await dataFetcher.getCollectionWithSorting(
                storeId,
                options.collectionId,
                options.sortBy
              )
            : await dataFetcher.getCollection(storeId, options.collectionId)
          if (collection) {
            return {
              ...baseData,
              contextData: {
                template: 'collection',
                collection,
                page_title: collection.title,
                current_page: options.pageNumber || 1,
                page: options.pageNumber || 1,
              },
            }
          }
        }

        if (options.handle) {
          const collectionWithProducts = options.sortBy
            ? await dataFetcher.getCollectionWithSortingByHandle(
                storeId,
                options.handle,
                options.sortBy
              )
            : await dataFetcher.getCollectionByHandle(storeId, options.handle)

          if (collectionWithProducts) {
            const contextData = {
              template: 'collection',
              collection: collectionWithProducts,
              page_title: collectionWithProducts.title,
              current_page: options.pageNumber || 1,
              page: options.pageNumber || 1,
            }

            return {
              ...baseData,
              contextData,
            }
          }
        }

        return {
          ...baseData,
          contextData: {
            template: 'collection',
            page_title: 'Colección',
            current_page: options.pageNumber || 1,
            page: options.pageNumber || 1,
          },
        }

      case 'cart':
        return {
          ...baseData,
          contextData: {
            template: 'cart',
            page_title: 'Carrito de Compras',
            cart: cartContext,
          },
        }

      case '404':
        return {
          ...baseData,
          contextData: {
            template: '404',
            page_title: 'Página No Encontrada',
            error_message: 'La página que buscas no existe',
          },
        }

      default:
        return {
          ...baseData,
          contextData: {
            template: options.pageType,
            page_title: options.pageType.charAt(0).toUpperCase() + options.pageType.slice(1),
          },
        }
    }
  }
}

export const pageDataLoader = new PageDataLoader()
