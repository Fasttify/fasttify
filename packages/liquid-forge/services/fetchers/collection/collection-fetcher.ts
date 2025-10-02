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
import type { CollectionContext, TemplateError } from '@/liquid-forge/types';
import { productFetcher } from '../product';
import { collectionCacheManager } from './collection-cache-manager';
import { collectionQueryManager } from './collection-query-manager';
import { collectionTransformer } from './collection-transformer';
import type { CollectionsResponse, PaginationOptions } from './types/collection-types';

export class CollectionFetcher {
  /**
   * Obtiene colecciones de una tienda
   */
  public async getStoreCollections(storeId: string, options: PaginationOptions = {}): Promise<CollectionsResponse> {
    try {
      const { limit = 10, nextToken } = options;

      // Verificar caché
      const cached = collectionCacheManager.getCachedCollections(storeId, limit, nextToken);
      if (cached) {
        return cached;
      }

      // Consultar base de datos
      const response = await collectionQueryManager.queryStoreCollections(storeId, options);

      // Transformar colecciones
      const transformedCollections = collectionTransformer.transformCollections(response.collections);

      const result: CollectionsResponse = {
        collections: transformedCollections,
        nextToken: response.nextToken,
      };

      // Guardar en caché
      collectionCacheManager.setCachedCollections(storeId, limit, nextToken, result);
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
   * Obtiene una colección específica con sus productos paginados
   */
  public async getCollection(
    storeId: string,
    collectionId: string,
    options: PaginationOptions = {}
  ): Promise<CollectionContext | null> {
    try {
      // Verificar caché
      const cached = collectionCacheManager.getCachedCollection(
        storeId,
        collectionId,
        options.limit,
        options.nextToken
      );
      if (cached) {
        return cached;
      }

      // Consultar base de datos
      const collection = await collectionQueryManager.queryCollectionById(collectionId);
      if (!collection || collection.storeId !== storeId) {
        return null;
      }

      const handle = collection.slug || collection.title || `collection-${collection.id}`;

      // Obtener productos de la colección
      const { products, nextToken, totalCount } = await productFetcher.getProductsByCollection(
        storeId,
        collectionId,
        handle,
        options
      );

      // Transformar colección
      const transformedCollection = collectionTransformer.transformCollection(
        collection,
        products,
        nextToken,
        totalCount || 0
      );

      // Guardar en caché
      collectionCacheManager.setCachedCollection(
        storeId,
        collectionId,
        options.limit,
        options.nextToken,
        transformedCollection
      );
      return transformedCollection;
    } catch (error) {
      logger.error(`Error fetching collection ${collectionId} for store ${storeId}`, error, 'CollectionFetcher');
      return null;
    }
  }
}

export const collectionFetcher = new CollectionFetcher();
