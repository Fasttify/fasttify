import { logger } from '@/renderer-engine/lib/logger';
import { cacheManager, getCollectionCacheKey, getCollectionsCacheKey } from '@/renderer-engine/services/core/cache';

import { dataTransformer } from '@/renderer-engine/services/core/data-transformer';
import { productFetcher } from '@/renderer-engine/services/fetchers/product-fetcher';
import type { CollectionContext, ProductContext, TemplateError } from '@/renderer-engine/types';
import { cookiesClient } from '@/utils/server/AmplifyServer';

interface PaginationOptions {
  limit?: number;
  offset?: number;
  nextToken?: string;
}

interface CollectionsResponse {
  collections: CollectionContext[];
  nextToken?: string | null;
}

export class CollectionFetcher {
  /**
   * Obtiene colecciones de una tienda
   */
  public async getStoreCollections(storeId: string, options: PaginationOptions = {}): Promise<CollectionsResponse> {
    try {
      const { limit = 10, nextToken } = options;
      const cacheKey = getCollectionsCacheKey(storeId, limit, nextToken);

      const cached = cacheManager.getCached(cacheKey);
      if (cached) {
        return cached as CollectionsResponse;
      }

      // Amplify Query
      const response = await cookiesClient.models.Collection.listCollectionByStoreId(
        { storeId },
        {
          limit,
          nextToken,
          filter: {
            isActive: { eq: true },
          },
        }
      );

      if (!response.data) {
        return { collections: [] };
      }

      const collections: CollectionContext[] = [];
      for (const collection of response.data) {
        const transformedCollection = this.transformCollection(collection, [], null);
        collections.push(transformedCollection);
      }

      const result: CollectionsResponse = {
        collections,
        nextToken: response.nextToken,
      };

      cacheManager.setCached(cacheKey, result, cacheManager.getDataTTL('collection'));
      return result;
    } catch (error) {
      logger.error(`Error fetching collections for store ${storeId}`, error, 'CollectionFetcher');

      const templateError: TemplateError = {
        type: 'DATA_ERROR',
        message: `Failed to fetch collections for store: ${storeId}`,
        details: error,
        statusCode: 500,
      };

      throw templateError;
    }
  }

  /**
   * Obtiene una colección específica con sus productos paginados.
   */
  public async getCollection(
    storeId: string,
    collectionId: string,
    options: PaginationOptions = {}
  ): Promise<CollectionContext | null> {
    try {
      const cacheKey = getCollectionCacheKey(storeId, collectionId, options.limit, options.nextToken);
      const cached = cacheManager.getCached(cacheKey);
      if (cached) {
        return cached as CollectionContext;
      }

      const { data: collection } = await cookiesClient.models.Collection.get({
        id: collectionId,
      });
      if (!collection || collection.storeId !== storeId) {
        return null;
      }

      const handle = dataTransformer.createHandle(collection.title || `collection-${collection.id}`);

      const { products, nextToken } = await productFetcher.getProductsByCollection(
        storeId,
        collectionId,
        handle,
        options
      );

      const transformedCollection = this.transformCollection(collection, products, nextToken);

      cacheManager.setCached(cacheKey, transformedCollection, cacheManager.getDataTTL('collection'));
      return transformedCollection;
    } catch (error) {
      logger.error(`Error fetching collection ${collectionId} for store ${storeId}`, error, 'CollectionFetcher');
      return null;
    }
  }

  /**
   * Transforma una colección de Amplify al formato Liquid, inyectando productos paginados.
   */
  private transformCollection(
    collection: any,
    products: ProductContext[],
    nextToken: string | null | undefined
  ): CollectionContext {
    const handle = dataTransformer.createHandle(collection.name || collection.title || `collection-${collection.id}`);

    return {
      id: collection.id,
      storeId: collection.storeId,
      title: collection.title,
      description: collection.description,
      slug: handle,
      url: `/collections/${handle}`,
      image: collection.image || 'collection-img',
      products,
      nextToken,
      owner: collection.owner,
      sortOrder: collection.sortOrder,
      isActive: collection.isActive,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    };
  }
}

export const collectionFetcher = new CollectionFetcher();
