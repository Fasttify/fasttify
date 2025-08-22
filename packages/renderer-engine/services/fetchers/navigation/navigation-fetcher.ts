/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { logger } from '@/renderer-engine/lib/logger';
import type { ProcessedNavigationMenu } from '@/renderer-engine/types/store';
import { cookiesClient } from '@/utils/server/AmplifyServer';
import { navigationCacheManager } from './navigation-cache-manager';
import { navigationMenuProcessor } from './navigation-menu-processor';
import type { NavigationMenusResponse } from './types/navigation-types';

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
   */
  public async getStoreNavigationMenus(storeId: string): Promise<NavigationMenusResponse> {
    try {
      // Verificar caché
      const cached = navigationCacheManager.getCachedMenus(storeId);
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
        navigationCacheManager.setCachedMenus(storeId, emptyResponse);
        return emptyResponse;
      }

      // Filtrar solo menús activos y procesar
      const activeMenus = rawMenus.filter((menu) => menu.isActive);
      const processedMenus = await Promise.all(
        activeMenus.map((menu) => navigationMenuProcessor.processNavigationMenu(menu))
      );

      // Encontrar el menú principal
      const mainMenu = processedMenus.find((menu) => menu.isMain || menu.handle === 'main-menu');
      const footerMenu = processedMenus.find((menu) => menu.handle === 'footer-menu');

      const response: NavigationMenusResponse = {
        menus: processedMenus,
        mainMenu,
        footerMenu,
      };

      // Guardar en caché
      navigationCacheManager.setCachedMenus(storeId, response);

      return response;
    } catch (error) {
      logger.error(`Error fetching navigation menus for store ${storeId}`, error, 'NavigationFetcher');
      return { menus: [] };
    }
  }

  /**
   * Obtiene un menú específico por su handle
   */
  public async getNavigationMenuByHandle(storeId: string, handle: string): Promise<ProcessedNavigationMenu | null> {
    try {
      // Verificar caché
      const cached = navigationCacheManager.getCachedMenu(storeId, handle);
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

      const processedMenu = await navigationMenuProcessor.processNavigationMenu(targetMenu);

      // Guardar en caché
      navigationCacheManager.setCachedMenu(storeId, handle, processedMenu);

      return processedMenu;
    } catch (error) {
      logger.error(`Error fetching navigation menu ${handle} for store ${storeId}`, error, 'NavigationFetcher');
      return null;
    }
  }

  /**
   * Invalida el caché de menús de navegación para una tienda
   */
  public invalidateStoreCache(storeId: string): void {
    navigationCacheManager.invalidateStoreCache(storeId);
  }

  /**
   * Invalida el caché de un menú específico
   */
  public invalidateMenuCache(storeId: string, handle: string): void {
    navigationCacheManager.invalidateMenuCache(storeId, handle);
  }
}

export const navigationFetcher = NavigationFetcher.getInstance();
