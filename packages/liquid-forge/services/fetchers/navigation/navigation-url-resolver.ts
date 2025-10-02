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

import { logger } from '@/liquid-forge/lib/logger';
import { cookiesClient } from '@/utils/server/AmplifyServer';

export class NavigationUrlResolver {
  /**
   * Resuelve la URL de una página por su handle
   */
  public async resolvePageUrl(storeId: string, pageHandle?: string): Promise<string> {
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
      logger.warn(`Error resolving page URL for handle ${pageHandle}`, error, 'NavigationUrlResolver');
    }

    return `/${pageHandle}`;
  }

  /**
   * Resuelve la URL de una colección por su handle
   */
  public async resolveCollectionUrl(storeId: string, collectionHandle?: string): Promise<string> {
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
      logger.warn(`Error resolving collection URL for handle ${collectionHandle}`, error, 'NavigationUrlResolver');
    }

    return `/collections/${collectionHandle}`;
  }
}

export const navigationUrlResolver = new NavigationUrlResolver();
