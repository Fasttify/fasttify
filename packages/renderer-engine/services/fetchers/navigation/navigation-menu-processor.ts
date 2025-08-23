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
import type { NavigationMenuItem, ProcessedNavigationMenu } from '@/renderer-engine/types/store';
import type { NavigationMenuData, ProcessedMenuItemData } from './types/navigation-types';

export class NavigationMenuProcessor {
  /**
   * Procesa un menú crudo de la base de datos
   */
  public async processNavigationMenu(rawMenu: NavigationMenuData): Promise<ProcessedNavigationMenu> {
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
          .map((item) => this.processMenuItem(item))
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
      logger.error(`Error processing navigation menu ${rawMenu.handle}`, error, 'NavigationMenuProcessor');
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
   */
  public async processMenuItem(item: NavigationMenuItem): Promise<ProcessedMenuItemData> {
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
        }
        break;

      case 'collection':
        if (item.collectionHandle) {
          url = `/collections/${item.collectionHandle}`;
        } else {
          url = '/collections';
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
}

export const navigationMenuProcessor = new NavigationMenuProcessor();
