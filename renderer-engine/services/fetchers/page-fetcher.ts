import { logger } from '@/renderer-engine/lib/logger';
import { cacheManager } from '@/renderer-engine/services/core/cache-manager';
import { dataTransformer } from '@/renderer-engine/services/core/data-transformer';
import type { PageContext, TemplateError } from '@/renderer-engine/types';
import { cookiesClient } from '@/utils/server/AmplifyServer';

interface PaginationOptions {
  limit?: number;
  nextToken?: string;
}

interface PagesResponse {
  pages: PageContext[];
  nextToken?: string | null;
}

export class PageFetcher {
  /**
   * Obtiene páginas de una tienda con paginación
   */
  public async getStorePages(storeId: string, options: PaginationOptions = {}): Promise<PagesResponse> {
    try {
      const { limit = 10, nextToken } = options;
      const cacheKey = `pages_${storeId}_${limit}_${nextToken || 'first'}`;

      const cached = cacheManager.getCached(cacheKey);
      if (cached) {
        return cached as PagesResponse;
      }

      // Amplify Query
      const response = await cookiesClient.models.Page.listPageByStoreId(
        { storeId },
        {
          limit,
          nextToken,
          filter: {
            isVisible: { eq: true },
            status: { eq: 'published' },
            pageType: { eq: 'standard' },
          },
        }
      );

      if (!response.data) {
        return { pages: [] };
      }

      const pages: PageContext[] = [];
      for (const page of response.data) {
        const transformedPage = this.transformPage(page);
        pages.push(transformedPage);
      }

      const result: PagesResponse = {
        pages,
        nextToken: response.nextToken,
      };

      cacheManager.setCached(cacheKey, result, cacheManager.getPageTTL());
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
      const cacheKey = `page_${storeId}_${pageId}`;
      const cached = cacheManager.getCached(cacheKey);
      if (cached) {
        return cached as PageContext;
      }

      const { data: page } = await cookiesClient.models.Page.get({
        id: pageId,
      });

      if (!page || page.storeId !== storeId) {
        return null;
      }

      const transformedPage = this.transformPage(page);

      cacheManager.setCached(cacheKey, transformedPage, cacheManager.getPageTTL());
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
      const cacheKey = `page_slug_${storeId}_${slug}`;
      const cached = cacheManager.getCached(cacheKey);
      if (cached) {
        return cached as PageContext;
      }

      // Buscar por slug en el store específico
      const response = await cookiesClient.models.Page.listPageByStoreId(
        { storeId },
        {
          filter: {
            slug: { eq: slug },
            isVisible: { eq: true },
            status: { eq: 'published' },
            pageType: { eq: 'standard' },
          },
        }
      );

      if (!response.data || response.data.length === 0) {
        return null;
      }

      const page = response.data[0];
      const transformedPage = this.transformPage(page);

      cacheManager.setCached(cacheKey, transformedPage, cacheManager.getPageTTL());
      return transformedPage;
    } catch (error) {
      logger.error(`Error fetching page by slug ${slug} for store ${storeId}`, error, 'PageFetcher');
      return null;
    }
  }

  /**
   * Obtiene todas las páginas de políticas de una tienda.
   */
  public async getPoliciesPages(storeId: string): Promise<PageContext[]> {
    try {
      const cacheKey = `policies_pages_${storeId}`;
      const cached = cacheManager.getCached(cacheKey);
      if (cached) {
        return cached as PageContext[];
      }

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

      if (!response.data) {
        return [];
      }

      const pages = response.data.map((page) => this.transformPage(page));

      cacheManager.setCached(cacheKey, pages, cacheManager.getPageTTL());
      return pages;
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
      const { limit = 10, nextToken } = options;
      const cacheKey = `visible_pages_${storeId}_${limit}_${nextToken || 'first'}`;

      const cached = cacheManager.getCached(cacheKey);
      if (cached) {
        return cached as PagesResponse;
      }

      // Amplify Query con filtro para páginas visibles
      const response = await cookiesClient.models.Page.listPageByStoreId(
        { storeId },
        {
          limit,
          nextToken,
          filter: {
            isVisible: { eq: true },
            status: { eq: 'published' },
            pageType: { eq: 'standard' },
          },
        }
      );

      if (!response.data) {
        return { pages: [] };
      }

      const pages: PageContext[] = [];
      for (const page of response.data) {
        const transformedPage = this.transformPage(page);
        pages.push(transformedPage);
      }

      const result: PagesResponse = {
        pages,
        nextToken: response.nextToken,
      };

      cacheManager.setCached(cacheKey, result, cacheManager.getPageTTL());
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

  /**
   * Transforma una página de Amplify al formato Liquid
   */
  private transformPage(page: any): PageContext {
    const handle = dataTransformer.createHandle(page.slug || page.title || `page-${page.id}`);
    return {
      id: page.id,
      title: page.title,
      content: page.content,
      createdAt: page.createdAt,
      url: `/pages/${handle}`,
      updatedAt: page.updatedAt,
    };
  }
}

export const pageFetcher = new PageFetcher();
