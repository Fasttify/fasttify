import type { RenderContext, ShopContext, PageContext } from '@/renderer-engine/types'
import { linkListService } from '@/renderer-engine/services/core/linkList-service'

export class ContextBuilder {
  /**
   * Crea el contexto completo para el renderizado de Liquid
   */
  public async createRenderContext(
    store: any,
    featuredProducts: any[],
    collections: any[],
    storeTemplate?: any
  ): Promise<RenderContext> {
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

    // Crear linklists para navegación usando el nuevo sistema
    let linklists
    try {
      // Usar el nuevo sistema de NavigationMenu
      linklists = await linkListService.createLinkListsFromDatabase(store.storeId)
    } catch (error) {
      console.warn(
        `Failed to load navigation menus from database, falling back to template or default:`,
        error
      )

      // Fallback a storeTemplate si está disponible
      if (storeTemplate) {
        linklists = linkListService.createEmptyLinkLists()
      } else {
        // Último fallback a menús vacíos
        linklists = linkListService.createEmptyLinkLists()
      }
    }

    // Crear contexto que incluye tanto 'shop' como 'store' para compatibilidad
    // y variables de página al nivel raíz como espera el template
    return {
      storeId: store.storeId,
      shop,
      store: shop,
      page,
      page_title: store.storeName,
      page_description: store.storeDescription || `Tienda online ${store.storeName}`,
      products: featuredProducts,
      collections,
      linklists,
    }
  }

  /**
   * Crea el contexto de manera síncrona para compatibilidad hacia atrás
   * @deprecated Usar createRenderContext() (async) en su lugar
   */
  public async createRenderContextSync(
    store: any,
    featuredProducts: any[],
    collections: any[],
    storeTemplate?: any
  ): Promise<RenderContext> {
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
    const linklists = await linkListService.createLinkListsFromDatabase(store.storeId)

    // Crear contexto que incluye tanto 'shop' como 'store' para compatibilidad
    // y variables de página al nivel raíz como espera el template
    return {
      storeId: store.storeId,
      shop,
      store: shop,
      page,
      page_title: store.storeName,
      page_description: store.storeDescription || `Tienda online ${store.storeName}`,
      products: featuredProducts,
      collections,
      linklists,
    }
  }
}

export const contextBuilder = new ContextBuilder()
