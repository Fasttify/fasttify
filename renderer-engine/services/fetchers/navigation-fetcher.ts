import { logger } from '@/renderer-engine/lib/logger';
import { cacheManager, getNavigationCacheKey, getNavigationMenuCacheKey } from '@/renderer-engine/services/core/cache';
import type {
  NavigationMenuItem,
  ProcessedNavigationMenu,
  ProcessedNavigationMenuItem,
} from '@/renderer-engine/types/store';
import { cookiesClient } from '@/utils/server/AmplifyServer';

interface NavigationMenusResponse {
  menus: ProcessedNavigationMenu[];
  mainMenu?: ProcessedNavigationMenu;
  footerMenu?: ProcessedNavigationMenu;
}

export class NavigationFetcher {
  private static instance: NavigationFetcher;

  private constructor() {}

  public static getInstance(): NavigationFetcher {
    if (!NavigationFetcher.instance) {
      NavigationFetcher.instance = new NavigationFetcher();
    }
    return NavigationFetcher.instance;
  }

  /**
   * Obtiene todos los menús de navegación activos de una tienda
   * @param storeId - ID de la tienda
   * @returns Menús de navegación procesados
   */
  public async getStoreNavigationMenus(storeId: string): Promise<NavigationMenusResponse> {
    try {
      const cacheKey = getNavigationCacheKey(storeId);

      // Verificar caché
      const cached = cacheManager.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      // Obtener menús activos de la tienda
      const { data: rawMenus } = await cookiesClient.models.NavigationMenu.listNavigationMenuByStoreId(
        {
          storeId: storeId,
        },
        {
          filter: {
            isActive: {
              eq: true,
            },
          },
        }
      );

      if (!rawMenus || rawMenus.length === 0) {
        logger.warn(`No navigation menus found for store: ${storeId}`, undefined, 'NavigationFetcher');
        const emptyResponse = { menus: [] };
        // Cachear respuesta vacía usando el sistema híbrido
        cacheManager.setCached(cacheKey, emptyResponse, cacheManager.getDataTTL('navigation'));
        return emptyResponse;
      }

      // Filtrar solo menús activos y procesar
      const activeMenus = rawMenus.filter((menu) => menu.isActive);
      const processedMenus = await Promise.all(activeMenus.map((menu) => this.processNavigationMenu(menu, storeId)));

      // Encontrar el menú principal
      const mainMenu = processedMenus.find((menu) => menu.isMain || menu.handle === 'main-menu');
      const footerMenu = processedMenus.find((menu) => menu.handle === 'footer-menu');

      const response: NavigationMenusResponse = {
        menus: processedMenus,
        mainMenu,
        footerMenu,
      };

      // Guardar en caché usando el sistema híbrido
      cacheManager.setCached(cacheKey, response, cacheManager.getDataTTL('navigation'));

      return response;
    } catch (error) {
      logger.error(`Error fetching navigation menus for store ${storeId}`, error, 'NavigationFetcher');
      return { menus: [] };
    }
  }

  /**
   * Obtiene un menú específico por su handle
   * @param storeId - ID de la tienda
   * @param handle - Handle del menú (ej: 'main-menu', 'footer-menu')
   * @returns Menú de navegación procesado o null si no se encuentra
   */
  public async getNavigationMenuByHandle(storeId: string, handle: string): Promise<ProcessedNavigationMenu | null> {
    try {
      const cacheKey = getNavigationMenuCacheKey(storeId, handle);

      // Verificar caché
      const cached = cacheManager.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      // Obtener menú específico por handle y storeId
      const { data: rawMenus } = await cookiesClient.models.NavigationMenu.listNavigationMenuByStoreId({
        storeId: storeId,
      });

      if (!rawMenus || rawMenus.length === 0) {
        return null;
      }

      // Buscar el menú por handle y que esté activo
      const targetMenu = rawMenus.find((menu) => menu.handle === handle && menu.isActive);

      if (!targetMenu) {
        return null;
      }

      const processedMenu = await this.processNavigationMenu(targetMenu, storeId);

      // Guardar en caché usando el sistema híbrido
      cacheManager.setCached(cacheKey, processedMenu, cacheManager.getDataTTL('navigation'));

      return processedMenu;
    } catch (error) {
      logger.error(`Error fetching navigation menu ${handle} for store ${storeId}`, error, 'NavigationFetcher');
      return null;
    }
  }

  /**
   * Procesa un menú crudo de la base de datos
   * @param rawMenu - Menú crudo de la base de datos
   * @param storeId - ID de la tienda para resolver URLs
   * @returns Menú procesado
   */
  private async processNavigationMenu(rawMenu: any, storeId: string): Promise<ProcessedNavigationMenu> {
    try {
      // Parsear menuData si es string
      let menuItems: NavigationMenuItem[] = [];
      if (rawMenu.menuData) {
        if (typeof rawMenu.menuData === 'string') {
          menuItems = JSON.parse(rawMenu.menuData);
        } else if (Array.isArray(rawMenu.menuData)) {
          menuItems = rawMenu.menuData;
        }
      }

      // Procesar items del menú
      const processedItems = await Promise.all(
        menuItems
          .filter((item) => item.isVisible)
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .map((item) => this.processMenuItem(item, storeId))
      );

      return {
        id: rawMenu.id,
        storeId: rawMenu.storeId,
        domain: rawMenu.domain,
        name: rawMenu.name,
        handle: rawMenu.handle,
        isMain: rawMenu.isMain,
        isActive: rawMenu.isActive,
        items: processedItems,
        owner: rawMenu.owner,
      };
    } catch (error) {
      logger.error(`Error processing navigation menu ${rawMenu.handle}`, error, 'NavigationFetcher');
      return {
        id: rawMenu.id,
        storeId: rawMenu.storeId,
        domain: rawMenu.domain,
        name: rawMenu.name,
        handle: rawMenu.handle,
        isMain: rawMenu.isMain,
        isActive: rawMenu.isActive,
        items: [],
        owner: rawMenu.owner,
      };
    }
  }

  /**
   * Procesa un item individual del menú y genera su URL
   * @param item - Item del menú
   * @param storeId - ID de la tienda
   * @returns Item procesado con URL generada
   */
  private async processMenuItem(item: NavigationMenuItem, storeId: string): Promise<ProcessedNavigationMenuItem> {
    let url = item.url || '';

    // Generar URL basada en el tipo de item
    switch (item.type) {
      case 'internal':
        url = item.url || '/';
        break;

      case 'external':
        url = item.url || '#';
        break;

      case 'page':
        if (item.pageHandle) {
          url = `/pages/${item.pageHandle}`;
        } else {
          url = await this.resolvePageUrl(storeId, item.pageHandle);
        }
        break;

      case 'collection':
        if (item.collectionHandle) {
          url = `/collections/${item.collectionHandle}`;
        } else {
          url = await this.resolveCollectionUrl(storeId, item.collectionHandle);
        }
        break;

      case 'product':
        if (item.productHandle) {
          url = `/products/${item.productHandle}`;
        } else {
          url = '/products';
        }
        break;

      default:
        url = item.url || '#';
    }

    return {
      title: item.label,
      url: url,
      active: item.isVisible,
      type: item.type,
      target: item.target,
    };
  }

  /**
   * Resuelve la URL de una página por su handle
   */
  private async resolvePageUrl(storeId: string, pageHandle?: string): Promise<string> {
    if (!pageHandle) return '/';

    try {
      const { data: pages } = await cookiesClient.models.Page.listPageByStoreId({
        storeId: storeId,
      });

      if (pages && pages.length > 0) {
        const targetPage = pages.find((page) => page.slug === pageHandle && page.isVisible);
        if (targetPage) {
          return `/${targetPage.slug}`;
        }
      }
    } catch (error) {
      logger.warn(`Error resolving page URL for handle ${pageHandle}`, error, 'NavigationFetcher');
    }

    return `/${pageHandle}`;
  }

  /**
   * Resuelve la URL de una colección por su handle
   */
  private async resolveCollectionUrl(storeId: string, collectionHandle?: string): Promise<string> {
    if (!collectionHandle) return '/collections';

    try {
      const { data: collections } = await cookiesClient.models.Collection.listCollectionByStoreId({
        storeId: storeId,
      });

      if (collections && collections.length > 0) {
        const targetCollection = collections.find(
          (collection) => collection.slug === collectionHandle && collection.isActive
        );
        if (targetCollection) {
          return `/collections/${targetCollection.slug}`;
        }
      }
    } catch (error) {
      logger.warn(`Error resolving collection URL for handle ${collectionHandle}`, error, 'NavigationFetcher');
    }

    return `/collections/${collectionHandle}`;
  }

  /**
   * Invalida el caché de menús de navegación para una tienda
   * @param storeId - ID de la tienda
   */
  public invalidateStoreCache(storeId: string): void {
    cacheManager.invalidateStoreCache(storeId);
  }

  /**
   * Invalida el caché de un menú específico
   * @param storeId - ID de la tienda
   * @param handle - Handle del menú
   */
  public invalidateMenuCache(storeId: string, handle: string): void {
    const cacheKey = getNavigationMenuCacheKey(storeId, handle);
    cacheManager.invalidateTemplateCache(cacheKey);
  }
}

export const navigationFetcher = NavigationFetcher.getInstance();
