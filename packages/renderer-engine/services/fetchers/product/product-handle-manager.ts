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

import { dataTransformer } from '@/renderer-engine/services/core/data-transformer';
import { productCacheManager } from './product-cache-manager';
import { productQueryManager } from './product-query-manager';
import type { ProductData, ProductHandleMap } from './types/product-types';

export class ProductHandleManager {
  /**
   * Obtiene un producto por handle usando el mapa de caché
   */
  public async getProductByHandle(
    storeId: string,
    handle: string
  ): Promise<{ product: ProductData; handleMap: ProductHandleMap } | null> {
    // Verificar caché del mapa de handles
    const handleMapCacheKey = `${storeId}-handle-map`;
    let handleMap = productCacheManager.getCachedHandleMap(storeId);

    if (handleMap && handleMap[handle]) {
      const productId = handleMap[handle];
      const product = await productQueryManager.queryProductById(productId);

      if (product && product.storeId === storeId) {
        return { product, handleMap };
      }
    }

    // Si no está en caché o no se encontró, crear nuevo mapa
    const allProducts = await productQueryManager.queryAllStoreProducts(storeId);

    if (!allProducts || allProducts.length === 0) {
      return null;
    }

    const newHandleMap: ProductHandleMap = {};
    let targetProduct: ProductData | null = null;

    for (const product of allProducts) {
      const productHandle = dataTransformer.createHandle(product.name);
      newHandleMap[productHandle] = product.id;

      if (productHandle === handle) {
        targetProduct = product;
      }
    }

    // Guardar en caché
    productCacheManager.setCachedHandleMap(storeId, newHandleMap);

    if (!targetProduct) {
      return null;
    }

    return { product: targetProduct, handleMap: newHandleMap };
  }

  /**
   * Crea un mapa de handles para todos los productos de una tienda
   */
  public async createHandleMap(storeId: string): Promise<ProductHandleMap> {
    const allProducts = await productQueryManager.queryAllStoreProducts(storeId);

    if (!allProducts || allProducts.length === 0) {
      return {};
    }

    const handleMap: ProductHandleMap = {};

    for (const product of allProducts) {
      const handle = dataTransformer.createHandle(product.name);
      handleMap[handle] = product.id;
    }

    // Guardar en caché
    productCacheManager.setCachedHandleMap(storeId, handleMap);

    return handleMap;
  }

  /**
   * Invalida el mapa de handles para una tienda
   */
  public invalidateHandleMap(storeId: string): void {
    productCacheManager.invalidateStoreCache(storeId);
  }
}

export const productHandleManager = new ProductHandleManager();
