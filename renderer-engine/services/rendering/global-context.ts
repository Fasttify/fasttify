import { logger } from '@/renderer-engine/lib/logger';
import { flexibleLinkListService, linkListService } from '@/renderer-engine/services/core/navigation-service';
import type { CartContext, PageContext, RenderContext, ShopContext } from '@/renderer-engine/types';

/**
 * Formatos de moneda soportados
 */
const CURRENCY_FORMATS: Record<string, string> = {
  COP: '${{amount}}',
  USD: '${{amount}}',
  EUR: '€{{amount}}',
  GBP: '£{{amount}}',
  CAD: '${{amount}} CAD',
  MXN: '${{amount}} MXN',
  BRL: 'R${{amount}}',
};

export class ContextBuilder {
  /**
   * Crea el contexto completo para el renderizado de Liquid
   */
  public async createRenderContext(
    store: any,
    products: any[],
    storeTemplate?: any,
    cartData?: CartContext
  ): Promise<RenderContext> {
    // Construir las partes del contexto
    const shop = this.createShopContext(store);
    const page = this.createPageContext(store);
    const cart = cartData || this.createEmptyCart();
    const linklists = await this.createLinkLists(store.storeId, storeTemplate);

    return {
      storeId: store.storeId,
      shop,
      store: shop, // Alias para compatibilidad
      page,
      page_title: store.storeName,
      page_description: store.storeDescription || `Tienda online ${store.storeName}`,
      products,
      linklists,
      cart,
    };
  }

  /**
   * Crea el contexto de manera síncrona para compatibilidad hacia atrás
   * @deprecated Usar createRenderContext() (async) en su lugar
   */
  public async createRenderContextSync(store: any, products: any[]): Promise<RenderContext> {
    return this.createRenderContext(store, products);
  }

  /**
   * Crea el contexto de la tienda
   */
  private createShopContext(store: any): ShopContext {
    const currency = store.storeCurrency || 'COP';
    const moneyFormat = CURRENCY_FORMATS[currency] || '${{amount}}';

    return {
      name: store.storeName,
      description: store.storeDescription || `Tienda online de ${store.storeName}`,
      domain: store.customDomain,
      url: `https://${store.customDomain}`,
      currency,
      money_format: moneyFormat,
      email: store.contactEmail,
      phone: store.contactPhone?.toString(),
      address: store.storeAdress,
      logo: store.storeLogo,
      banner: store.storeBanner,
      theme: store.storeTheme || 'modern',
      favicon: store.storeFavicon,
      storeId: store.storeId,
    };
  }

  /**
   * Crea el contexto de la página
   */
  private createPageContext(store: any): PageContext {
    return {
      title: store.storeName,
      url: '/',
      template: 'index',
      handle: 'homepage',
      metafields: {
        pagefly: {
          html_meta: '',
        },
      },
    };
  }

  /**
   * Crea un carrito vacío
   */
  private createEmptyCart(): CartContext {
    return {
      id: '',
      item_count: 0,
      total_price: 0,
      items: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Crea linklists con fallback simple
   */
  private async createLinkLists(storeId: string, storeTemplate?: any): Promise<any> {
    // Intentar cargar desde base de datos
    try {
      const linklists = await linkListService.createLinkListsFromDatabase(storeId);
      if (linklists && Object.keys(linklists).length > 0) {
        return linklists;
      }
    } catch (error) {
      logger.warn('Failed to load navigation menus from database:', error);
    }

    // Fallback a template si está disponible
    if (storeTemplate) {
      try {
        const linklists = flexibleLinkListService.createLinkListsFromTemplate(storeTemplate);
        if (linklists && Object.keys(linklists).length > 0) {
          return linklists;
        }
      } catch (error) {
        logger.warn('Failed to load navigation menus from template:', error);
      }
    }

    // Último fallback: menús vacíos
    return flexibleLinkListService.createEmptyLinkLists();
  }
}

export const contextBuilder = new ContextBuilder();
