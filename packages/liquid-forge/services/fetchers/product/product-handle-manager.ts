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

import { dataTransformer } from '@/liquid-forge/services/core/data-transformer';
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
    const handleMap = productCacheManager.getCachedHandleMap(storeId);

    if (handleMap && handleMap[handle]) {
      const productId = handleMap[handle];
      const product = await productQueryManager.queryProductById(productId);

      // Validar que el producto corresponde realmente al handle solicitado
      if (product && product.storeId === storeId && (product.slug === handle || (product as any).handle === handle)) {
        return { product, handleMap };
      }

      // Autocorrección puntual del handle -> id
      const allProducts = await productQueryManager.queryAllStoreProducts(storeId);
      if (!allProducts || allProducts.length === 0) return null;
      const fixed = this.selectBestProductForHandle(allProducts, handle);
      if (!fixed) return null;
      const updatedMap: ProductHandleMap = { ...(handleMap || {}) };
      updatedMap[handle] = fixed.id;
      productCacheManager.setCachedHandleMap(storeId, updatedMap);
      return { product: fixed, handleMap: updatedMap };
    }

    // No hay en caché: construir determinísticamente y devolver coincidencia
    const allProducts = await productQueryManager.queryAllStoreProducts(storeId);
    if (!allProducts || allProducts.length === 0) return null;

    const newHandleMap: ProductHandleMap = this.buildDeterministicHandleMap(allProducts);
    productCacheManager.setCachedHandleMap(storeId, newHandleMap);

    const target = this.selectBestProductForHandle(allProducts, handle);
    if (!target) return null;
    return { product: target, handleMap: newHandleMap };
  }

  /**
   * Crea un mapa de handles para todos los productos de una tienda
   */
  public async createHandleMap(storeId: string): Promise<ProductHandleMap> {
    const allProducts = await productQueryManager.queryAllStoreProducts(storeId);

    if (!allProducts || allProducts.length === 0) {
      return {};
    }

    const handleMap: ProductHandleMap = this.buildDeterministicHandleMap(allProducts);
    productCacheManager.setCachedHandleMap(storeId, handleMap);
    return handleMap;
  }

  /**
   * Invalida el mapa de handles para una tienda
   */
  public invalidateHandleMap(storeId: string): void {
    productCacheManager.invalidateStoreCache(storeId);
  }

  // Helpers
  private computeHandle(p: ProductData): string {
    return p.slug || dataTransformer.createHandle(p.name);
  }

  private getUpdatedAtMs(p: ProductData): number {
    const ts = (p as any).updatedAt || (p as any).createdAt || 0;
    const n = typeof ts === 'string' ? Date.parse(ts) : typeof ts === 'number' ? ts : 0;
    return isNaN(n) ? 0 : n;
  }

  private pickPreferred(a: ProductData | null | undefined, b: ProductData, targetHandle: string): ProductData {
    if (!a) return b;
    const aExact = a.slug === targetHandle;
    const bExact = b.slug === targetHandle;
    if (aExact !== bExact) return bExact ? b : a;
    const aActive = (a as any).isActive !== false;
    const bActive = (b as any).isActive !== false;
    if (aActive !== bActive) return bActive ? b : a;
    const aTime = this.getUpdatedAtMs(a);
    const bTime = this.getUpdatedAtMs(b);
    return bTime >= aTime ? b : a;
  }

  private buildDeterministicHandleMap(allProducts: ProductData[]): ProductHandleMap {
    const map: ProductHandleMap = {};
    for (const p of allProducts) {
      const h = this.computeHandle(p);
      if (map[h]) {
        const current = allProducts.find((x) => x.id === map[h]);
        map[h] = this.pickPreferred(current, p, h).id;
      } else {
        map[h] = p.id;
      }
    }
    return map;
  }

  private selectBestProductForHandle(products: ProductData[], handle: string): ProductData | null {
    const candidates = products.filter((p) => this.computeHandle(p) === handle);
    if (candidates.length === 0) return null;
    return candidates.reduce((acc, curr) => this.pickPreferred(acc, curr, handle));
  }
}

export const productHandleManager = new ProductHandleManager();
