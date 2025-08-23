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
  getFeaturedProductsCacheKey,
  getProductCacheKey,
  getProductHandleMapCacheKey,
  getProductsCacheKey,
} from '@/renderer-engine/services/core/cache';
import type { ProductContext, ProductsResponse } from './types/product-types';

export class ProductCacheManager {
  /**
   * Obtiene datos del caché para productos de una tienda
   */
  public getCachedProducts(storeId: string, limit: number, nextToken?: string): ProductsResponse | null {
    const cacheKey = getProductsCacheKey(storeId, limit, nextToken);
    return cacheManager.getCached(cacheKey);
  }

  /**
   * Obtiene datos del caché para un producto específico
   */
  public getCachedProduct(storeId: string, productIdOrHandle: string): ProductContext | null {
    const cacheKey = getProductCacheKey(storeId, productIdOrHandle);
    return cacheManager.getCached(cacheKey);
  }

  /**
   * Obtiene datos del caché para productos destacados
   */
  public getCachedFeaturedProducts(storeId: string, limit: number): ProductContext[] | null {
    const cacheKey = getFeaturedProductsCacheKey(storeId, limit);
    return cacheManager.getCached(cacheKey);
  }

  /**
   * Obtiene el mapa de handles del caché
   */
  public getCachedHandleMap(storeId: string): { [handle: string]: string } | null {
    const cacheKey = getProductHandleMapCacheKey(storeId);
    return cacheManager.getCached(cacheKey);
  }

  /**
   * Guarda en caché la respuesta de productos
   */
  public setCachedProducts(
    storeId: string,
    limit: number,
    nextToken: string | undefined,
    data: ProductsResponse
  ): void {
    const cacheKey = getProductsCacheKey(storeId, limit, nextToken);
    cacheManager.setCached(cacheKey, data, cacheManager.getDataTTL('product'));
  }

  /**
   * Guarda en caché un producto específico
   */
  public setCachedProduct(storeId: string, productIdOrHandle: string, data: ProductContext): void {
    const cacheKey = getProductCacheKey(storeId, productIdOrHandle);
    cacheManager.setCached(cacheKey, data, cacheManager.getDataTTL('product'));
  }

  /**
   * Guarda en caché productos destacados
   */
  public setCachedFeaturedProducts(storeId: string, limit: number, data: ProductContext[]): void {
    const cacheKey = getFeaturedProductsCacheKey(storeId, limit);
    cacheManager.setCached(cacheKey, data, cacheManager.getDataTTL('product'));
  }

  /**
   * Guarda en caché el mapa de handles
   */
  public setCachedHandleMap(storeId: string, data: { [handle: string]: string }): void {
    const cacheKey = getProductHandleMapCacheKey(storeId);
    cacheManager.setCached(cacheKey, data, cacheManager.getDataTTL());
  }

  /**
   * Invalida el caché de productos para una tienda
   */
  public invalidateStoreCache(storeId: string): void {
    // Invalida todos los tipos de caché relacionados con productos
    const productsCacheKey = getProductsCacheKey(storeId, 20);
    const featuredCacheKey = getFeaturedProductsCacheKey(storeId, 8);
    const handleMapCacheKey = getProductHandleMapCacheKey(storeId);

    cacheManager.invalidateTemplateCache(productsCacheKey);
    cacheManager.invalidateTemplateCache(featuredCacheKey);
    cacheManager.invalidateTemplateCache(handleMapCacheKey);
  }

  /**
   * Invalida el caché de un producto específico
   */
  public invalidateProductCache(storeId: string, productId: string): void {
    const cacheKey = getProductCacheKey(storeId, productId);
    cacheManager.invalidateTemplateCache(cacheKey);
  }
}

export const productCacheManager = new ProductCacheManager();
