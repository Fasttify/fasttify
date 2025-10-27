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

import {
  cacheManager,
  getCollectionCacheKey,
  getCollectionPrefix,
  getCollectionsCacheKey,
  getCollectionsPrefix,
} from '../../core/cache';
import type { CollectionContext, CollectionsResponse } from './types/collection-types';

export class CollectionCacheManager {
  /**
   * Obtiene datos del caché para colecciones de una tienda
   */
  public getCachedCollections(storeId: string, limit: number, nextToken?: string): CollectionsResponse | null {
    const cacheKey = getCollectionsCacheKey(storeId, limit, nextToken);
    return cacheManager.getCached(cacheKey);
  }

  /**
   * Obtiene datos del caché para una colección específica
   */
  public getCachedCollection(
    storeId: string,
    collectionId: string,
    limit?: number,
    nextToken?: string
  ): CollectionContext | null {
    const cacheKey = getCollectionCacheKey(storeId, collectionId, limit, nextToken);
    return cacheManager.getCached(cacheKey);
  }

  /**
   * Guarda en caché la respuesta de colecciones
   */
  public setCachedCollections(
    storeId: string,
    limit: number,
    nextToken: string | undefined,
    data: CollectionsResponse
  ): void {
    const cacheKey = getCollectionsCacheKey(storeId, limit, nextToken);
    cacheManager.setCached(cacheKey, data, cacheManager.getDataTTL('collection'));
  }

  /**
   * Guarda en caché una colección específica
   */
  public setCachedCollection(
    storeId: string,
    collectionId: string,
    limit: number | undefined,
    nextToken: string | undefined,
    data: CollectionContext
  ): void {
    const cacheKey = getCollectionCacheKey(storeId, collectionId, limit, nextToken);
    cacheManager.setCached(cacheKey, data, cacheManager.getDataTTL('collection'));
  }

  /**
   * Invalida el caché de colecciones para una tienda
   */
  public invalidateStoreCache(storeId: string): void {
    // Eliminar todas las páginas de colecciones y colecciones individuales de la tienda
    cacheManager.deleteByPrefix(getCollectionsPrefix(storeId));
    cacheManager.deleteByPrefix(getCollectionPrefix(storeId, ''));
  }

  /**
   * Invalida el caché de una colección específica
   */
  public invalidateCollectionCache(storeId: string, collectionId: string): void {
    // Eliminar todas las variantes paginadas de esa colección
    cacheManager.deleteByPrefix(getCollectionPrefix(storeId, collectionId));
  }
}

export const collectionCacheManager = new CollectionCacheManager();
