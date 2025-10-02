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

import { cookiesClient } from '@/utils/server/AmplifyServer';
import type { PageData, PageQueryOptions, PagesResponse } from './types/page-types';

export class PageQueryManager {
  /**
   * Obtiene páginas de una tienda con filtros y paginación
   */
  public async queryStorePages(storeId: string, options: PageQueryOptions = {}): Promise<PagesResponse> {
    const { limit = 10, nextToken, filter } = options;

    const response = await cookiesClient.models.Page.listPageByStoreId(
      { storeId },
      {
        limit,
        nextToken,
        filter,
      }
    );

    if (!response.data) {
      return { pages: [] };
    }

    return {
      pages: response.data as any[],
      nextToken: response.nextToken,
    };
  }

  /**
   * Obtiene una página específica por ID
   */
  public async queryPageById(pageId: string): Promise<PageData | null> {
    const { data: page } = await cookiesClient.models.Page.get({
      id: pageId,
    });

    return (page as PageData) || null;
  }

  /**
   * Obtiene páginas de políticas de una tienda
   */
  public async queryPoliciesPages(storeId: string): Promise<PageData[]> {
    const response = await cookiesClient.models.Page.listPageByStoreId(
      { storeId },
      {
        filter: {
          isVisible: { eq: true },
          status: { eq: 'published' },
          pageType: { eq: 'policies' },
        },
      }
    );

    return (response.data as PageData[]) || [];
  }
}

export const pageQueryManager = new PageQueryManager();
