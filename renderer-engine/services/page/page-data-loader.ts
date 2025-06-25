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
          const collection = await dataFetcher.getCollection(storeId, options.collectionId)
          if (collection) {
            return {
              ...baseData,
              contextData: {
                template: 'collection',
                collection,
                page_title: collection.title,
              },
            }
          }
        }

        if (options.handle) {
          const collectionsResponse = await dataFetcher.getStoreCollections(storeId, { limit: 200 })
          const collectionRef = collectionsResponse.collections.find(
            c =>
              c.slug === options.handle ||
              c.title.toLowerCase().replace(/\s+/g, '-') === options.handle
          )

          if (collectionRef) {
            const collectionWithProducts = await dataFetcher.getCollection(
              storeId,
              collectionRef.id
            )

            if (collectionWithProducts) {
              return {
                ...baseData,
                contextData: {
                  template: 'collection',
                  collection: collectionWithProducts,
                  page_title: collectionWithProducts.title,
                },
              }
            }
          }
        }

        return {
          ...baseData,
          contextData: {
            template: 'collection',
            page_title: 'Colección',
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
