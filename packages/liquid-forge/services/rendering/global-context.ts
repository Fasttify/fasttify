/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { logger } from '@/liquid-forge/lib/logger';
import { flexibleLinkListService, linkListService } from '@/liquid-forge/services/core/navigation-service';
import type { CartContext, PageContext, RenderContext, ShopContext } from '@/liquid-forge/types';

export class ContextBuilder {
  /**
   * Crea el contexto completo para el renderizado de Liquid
   */
  public async createRenderContext(
    store: any,
    products: any[],
    storeTemplate?: any,
    cartData?: CartContext,
    navigationMenus?: any,
    checkoutData?: any
  ): Promise<RenderContext> {
    // Construir las partes del contexto
    const shop = this.createShopContext(store);
    const page = this.createPageContext(store);
    const cart = cartData || this.createEmptyCart();
    const linklists = await this.createLinkLists(store.storeId, storeTemplate, navigationMenus);

    // Variables globales para configuración de moneda
    const currencyConfig = {
      currency: store.storeCurrency || 'COP',
      format: store.currencyFormat || '${{amount}}',
      locale: store.currencyLocale || 'es-CO',
      decimalPlaces:
        store.currencyDecimalPlaces !== undefined && store.currencyDecimalPlaces !== null
          ? store.currencyDecimalPlaces
          : 2,
    };

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
      checkout: checkoutData, // Agregar datos de checkout al contexto
      _currency_config: currencyConfig,
      _store_template: storeTemplate, // Agregar acceso al storeTemplate
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
    // Usar la configuración de moneda del backend
    const currency = store.storeCurrency || 'COP';
    const moneyFormat = store.currencyFormat || '${{amount}}';
    const currencyLocale = store.currencyLocale || 'es-CO';
    const currencyDecimalPlaces =
      store.currencyDecimalPlaces !== undefined && store.currencyDecimalPlaces !== null
        ? store.currencyDecimalPlaces
        : 2;

    return {
      name: store.storeName,
      description: store.storeDescription || `Tienda online de ${store.storeName}`,
      domain: store.customDomain,
      url: `https://${store.customDomain}`,
      currency,
      money_format: moneyFormat,
      currency_format: moneyFormat, // Alias para compatibilidad
      currency_locale: currencyLocale,
      currency_decimal_places: currencyDecimalPlaces,
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
  private async createLinkLists(storeId: string, storeTemplate?: any, navigationMenus?: any): Promise<any> {
    // Usar navigationMenus si están disponibles
    if (navigationMenus) {
      try {
        // Convertir navigationMenus a linklists directamente
        const linklists: any = {};
        if (navigationMenus.menus) {
          navigationMenus.menus.forEach((menu: any) => {
            linklists[menu.handle] = {
              title: menu.name,
              handle: menu.handle,
              links: menu.items || [],
            };
          });
        }
        if (Object.keys(linklists).length > 0) {
          return linklists;
        }
      } catch (error) {
        logger.warn('Failed to load navigation menus from provided data:', error);
      }
    }

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
