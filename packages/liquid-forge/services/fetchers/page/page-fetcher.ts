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
import type { PageContext, TemplateError } from '@/liquid-forge/types';
import { pageCacheManager } from './page-cache-manager';
import { pageQueryManager } from './page-query-manager';
import { pageTransformer } from './page-transformer';
import type { PageData, PagesResponse, PaginationOptions } from './types/page-types';

export class PageFetcher {
  /**
   * Obtiene páginas de una tienda con paginación
   */
  public async getStorePages(storeId: string, options: PaginationOptions = {}): Promise<PagesResponse> {
    try {
      // Verificar caché
      const cached = pageCacheManager.getCachedPages(storeId);
      if (cached) {
        return cached;
      }

      // Consultar base de datos
      const response = await pageQueryManager.queryStorePages(storeId, {
        ...options,
        filter: {
          isVisible: { eq: true },
          status: { eq: 'published' },
          pageType: { eq: 'standard' },
        },
      });

      const result: PagesResponse = {
        pages: response.pages,
        nextToken: response.nextToken,
      };

      // Guardar en caché
      pageCacheManager.setCachedPages(storeId, result);
      return result;
    } catch (error) {
      logger.error(`Error fetching pages for store ${storeId}`, error, 'PageFetcher');

      const templateError: TemplateError = {
        type: 'DATA_ERROR',
        message: `Failed to fetch pages for store: ${storeId}`,
        details: error,
        statusCode: 500,
      };

      throw templateError;
    }
  }

  /**
   * Obtiene una página específica por ID
   */
  public async getPage(storeId: string, pageId: string): Promise<PageContext | null> {
    try {
      // Verificar caché
      const cached = pageCacheManager.getCachedPage(storeId, pageId);
      if (cached) {
        return cached;
      }

      // Consultar base de datos
      const page = await pageQueryManager.queryPageById(pageId);

      if (!page || page.storeId !== storeId) {
        return null;
      }

      // Transformar página
      const transformedPage = pageTransformer.transformPage(page);

      // Guardar en caché
      pageCacheManager.setCachedPage(storeId, pageId, transformedPage);
      return transformedPage;
    } catch (error) {
      logger.error(`Error fetching page ${pageId} for store ${storeId}`, error, 'PageFetcher');
      return null;
    }
  }

  /**
   * Obtiene una página específica por slug
   */
  public async getPageBySlug(storeId: string, slug: string): Promise<PageContext | null> {
    try {
      const cacheKey = `${storeId}-${slug}`;
      const cached = pageCacheManager.getCachedPage(storeId, cacheKey);
      if (cached) {
        return cached;
      }

      // Consultar base de datos
      const response = await pageQueryManager.queryStorePages(storeId, {
        filter: {
          slug: { eq: slug },
          isVisible: { eq: true },
          status: { eq: 'published' },
          pageType: { eq: 'standard' },
        },
      });

      if (!response.pages || response.pages.length === 0) {
        return null;
      }

      const page = response.pages[0];
      const transformedPage = pageTransformer.transformPage(page as PageData);

      // Guardar en caché
      pageCacheManager.setCachedPage(storeId, cacheKey, transformedPage);
      return transformedPage;
    } catch (error) {
      logger.error(`Error fetching page by slug ${slug} for store ${storeId}`, error, 'PageFetcher');
      return null;
    }
  }

  /**
   * Obtiene todas las páginas de políticas de una tienda
   */
  public async getPoliciesPages(storeId: string): Promise<PageContext[]> {
    try {
      // Verificar caché
      const cached = pageCacheManager.getCachedPages(storeId);
      if (cached) {
        return cached.pages;
      }

      // Consultar base de datos
      const pages = await pageQueryManager.queryPoliciesPages(storeId);

      // Transformar páginas
      const transformedPages = pageTransformer.transformPages(pages);

      // Guardar en caché
      pageCacheManager.setCachedPages(storeId, { pages: transformedPages });
      return transformedPages;
    } catch (error) {
      logger.error(`Error fetching policies pages for store ${storeId}`, error, 'PageFetcher');
      return [];
    }
  }

  /**
   * Obtiene páginas visibles de una tienda
   */
  public async getVisibleStorePages(storeId: string, options: PaginationOptions = {}): Promise<PagesResponse> {
    try {
      // Verificar caché
      const cached = pageCacheManager.getCachedPages(storeId);
      if (cached) {
        return cached;
      }

      // Consultar base de datos
      const response = await pageQueryManager.queryStorePages(storeId, {
        ...options,
        filter: {
          isVisible: { eq: true },
          status: { eq: 'published' },
          pageType: { eq: 'standard' },
        },
      });

      const result: PagesResponse = {
        pages: response.pages,
        nextToken: response.nextToken,
      };

      // Guardar en caché
      pageCacheManager.setCachedPages(storeId, result);
      return result;
    } catch (error) {
      logger.error(`Error fetching visible pages for store ${storeId}`, error, 'PageFetcher');

      const templateError: TemplateError = {
        type: 'DATA_ERROR',
        message: `Failed to fetch visible pages for store: ${storeId}`,
        details: error,
        statusCode: 500,
      };

      throw templateError;
    }
  }
}

export const pageFetcher = new PageFetcher();
