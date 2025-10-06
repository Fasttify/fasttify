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

import { cacheManager, getPageCacheKey, getPagesCacheKey, getPagesPrefix } from '@/liquid-forge/services/core/cache';
import type { PageContext, PagesResponse } from './types/page-types';

export class PageCacheManager {
  /**
   * Obtiene datos del caché para páginas de una tienda
   */
  public getCachedPages(storeId: string): PagesResponse | null {
    const cacheKey = getPagesCacheKey(storeId);
    return cacheManager.getCached(cacheKey);
  }

  /**
   * Obtiene datos del caché para una página específica
   */
  public getCachedPage(storeId: string, pageId: string): PageContext | null {
    const cacheKey = getPageCacheKey(storeId, pageId);
    return cacheManager.getCached(cacheKey);
  }

  /**
   * Guarda en caché la respuesta de páginas
   */
  public setCachedPages(storeId: string, data: PagesResponse): void {
    const cacheKey = getPagesCacheKey(storeId);
    cacheManager.setCached(cacheKey, data, cacheManager.getPageTTL());
  }

  /**
   * Guarda en caché una página específica
   */
  public setCachedPage(storeId: string, pageId: string, data: PageContext): void {
    const cacheKey = getPageCacheKey(storeId, pageId);
    cacheManager.setCached(cacheKey, data, cacheManager.getPageTTL());
  }

  /**
   * Invalida el caché de páginas para una tienda
   */
  public invalidateStoreCache(storeId: string): void {
    // Eliminar listado de páginas y páginas individuales de la tienda
    cacheManager.deleteKey(getPagesCacheKey(storeId));
    cacheManager.deleteByPrefix(getPagesPrefix(storeId));
  }

  /**
   * Invalida el caché de una página específica
   */
  public invalidatePageCache(storeId: string, pageId: string): void {
    cacheManager.deleteKey(getPageCacheKey(storeId, pageId));
  }
}

export const pageCacheManager = new PageCacheManager();
