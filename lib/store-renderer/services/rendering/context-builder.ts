import type { RenderContext, ShopContext, PageContext } from '../../types'
import { linkListService } from '../core/linkList-service'

export class ContextBuilder {
  /**
   * Crea el contexto completo para el renderizado de Liquid
   */
  public createRenderContext(
    store: any,
    featuredProducts: any[],
    collections: any[],
    storeTemplate?: any
  ): RenderContext {
    // Crear contexto de la tienda (como 'shop' para compatibilidad)
    const shop: ShopContext = {
      name: store.storeName,
      description: store.storeDescription || `Tienda online de ${store.storeName}`,
      domain: store.customDomain,
      url: `https://${store.customDomain}`,
      currency: store.storeCurrency || 'COP',
      money_format: store.storeCurrency === 'USD' ? '${{amount}}' : '${{amount}}',
      email: store.contactEmail,
      phone: store.contactPhone?.toString(),
      address: store.storeAdress,
      logo: store.storeLogo,
      banner: store.storeBanner,
      theme: store.storeTheme || 'modern',
      favicon: store.storeFavicon,
      storeId: store.storeId,
    }

    // Crear contexto de la página con metafields para PageFly
    const page: PageContext = {
      title: store.storeName,
      url: '/',
      template: 'index',
      handle: 'homepage',
      metafields: {
        pagefly: {
          html_meta: '',
        },
      },
    }

    // Crear linklists para navegación
    const linklists = storeTemplate
      ? linkListService.createLinkListsFromStoreTemplate(storeTemplate)
      : linkListService.createEmptyLinkLists()

    // Crear contexto que incluye tanto 'shop' como 'store' para compatibilidad
    // y variables de página al nivel raíz como espera el template
    return {
      storeId: store.storeId,
      shop,
      store: shop,
      page,
      page_title: store.storeName,
      page_description: store.storeDescription || `Tienda online de ${store.storeName}`,
      products: featuredProducts,
      collections,
      linklists,
    }
  }
}

export const contextBuilder = new ContextBuilder()
