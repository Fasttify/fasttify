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

import { logger } from '@/renderer-engine/lib/logger';
import type { ProductContext, TemplateError } from '@/renderer-engine/types';
import { productCacheManager } from './product-cache-manager';
import { productHandleManager } from './product-handle-manager';
import { productQueryManager } from './product-query-manager';
import { productTransformer } from './product-transformer';
import type { PaginationOptions, ProductsResponse } from './types/product-types';

export class ProductFetcher {
  /**
   * Obtiene productos de una tienda con paginación
   */
  public async getStoreProducts(storeId: string, options: PaginationOptions = {}): Promise<ProductsResponse> {
    try {
      const { limit = 20, nextToken } = options;

      // Verificar caché
      const cached = productCacheManager.getCachedProducts(storeId, limit, nextToken);
      if (cached) {
        return cached;
      }

      // Consultar base de datos
      const response = await productQueryManager.queryStoreProducts(storeId, options);

      // Transformar productos
      const transformedProducts = productTransformer.transformProducts(response.products);

      const result: ProductsResponse = {
        products: transformedProducts,
        nextToken: response.nextToken,
        totalCount: response.totalCount,
      };

      // Guardar en caché
      productCacheManager.setCachedProducts(storeId, limit, nextToken, result);
      return result;
    } catch (error) {
      logger.error(`Error fetching products for store ${storeId}`, error, 'ProductFetcher');

      const templateError: TemplateError = {
        type: 'DATA_ERROR',
        message: `Failed to fetch products for store: ${storeId}`,
        details: error,
        statusCode: 500,
      };

      throw templateError;
    }
  }

  /**
   * Obtiene un producto específico por ID o por su handle (slug)
   */
  public async getProduct(storeId: string, productIdOrHandle: string): Promise<ProductContext | null> {
    try {
      // Verificar caché
      const cachedProduct = productCacheManager.getCachedProduct(storeId, productIdOrHandle);
      if (cachedProduct) {
        return cachedProduct;
      }

      // Intentar obtener por ID primero
      try {
        const product = await productQueryManager.queryProductById(productIdOrHandle);
        if (product && product.storeId === storeId) {
          const transformed = productTransformer.transformProduct(product);
          productCacheManager.setCachedProduct(storeId, productIdOrHandle, transformed);
          return transformed;
        }
      } catch (e) {
        // Si falla, continuar con la búsqueda por handle
      }

      // Si no se encontró por ID, buscar por handle
      const handleResult = await productHandleManager.getProductByHandle(storeId, productIdOrHandle);

      if (!handleResult) {
        return null;
      }

      const transformedProduct = productTransformer.transformProduct(handleResult.product);
      productCacheManager.setCachedProduct(storeId, productIdOrHandle, transformedProduct);
      return transformedProduct;
    } catch (error) {
      logger.error(`Error fetching product "${productIdOrHandle}" for store ${storeId}`, error, 'ProductFetcher');
      return null;
    }
  }

  /**
   * Obtiene productos destacados de una tienda
   */
  public async getFeaturedProducts(storeId: string, limit: number = 8): Promise<ProductContext[]> {
    try {
      // Verificar caché
      const cached = productCacheManager.getCachedFeaturedProducts(storeId, limit);
      if (cached) {
        return cached;
      }

      // Consultar base de datos
      const products = await productQueryManager.queryFeaturedProducts(storeId, limit);

      // Transformar productos
      const transformedProducts = productTransformer.transformProducts(products);

      // Guardar en caché
      productCacheManager.setCachedFeaturedProducts(storeId, limit, transformedProducts);
      return transformedProducts;
    } catch (error) {
      logger.error(`Error fetching featured products for store ${storeId}`, error, 'ProductFetcher');
      return [];
    }
  }

  /**
   * Obtiene productos de una colección específica con paginación
   */
  public async getProductsByCollection(
    storeId: string,
    collectionId: string,
    collectionHandle?: string,
    options: PaginationOptions = {}
  ): Promise<ProductsResponse> {
    try {
      // Consultar base de datos
      const response = await productQueryManager.queryProductsByCollection(collectionId, options);

      // Transformar productos
      const transformedProducts = productTransformer.transformProducts(response.products, collectionHandle);

      return {
        products: transformedProducts,
        nextToken: response.nextToken,
        totalCount: response.totalCount,
      };
    } catch (error) {
      logger.error(`Error fetching products for collection ${collectionId}`, error, 'ProductFetcher');
      return { products: [], nextToken: null, totalCount: 0 };
    }
  }
}

export const productFetcher = new ProductFetcher();
