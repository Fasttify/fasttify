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

import { cookiesClient } from '@/utils/server/AmplifyServer';
import type { ProductData, ProductQueryOptions, ProductsQueryResponse } from './types/product-types';

export class ProductQueryManager {
  /**
   * Obtiene productos de una tienda con filtros y paginación
   */
  public async queryStoreProducts(storeId: string, options: ProductQueryOptions = {}): Promise<ProductsQueryResponse> {
    const { limit = 20, nextToken, filter } = options;

    const response = await cookiesClient.models.Product.listProductByStoreId(
      { storeId },
      {
        limit,
        nextToken,
        filter: {
          status: { eq: 'active' },
          ...filter,
        },
      }
    );

    if (!response.data) {
      throw new Error(`No products found for store: ${storeId}`);
    }

    const products = response.data as ProductData[];

    // Calcular totalCount: si hay nextToken, significa que hay más productos
    let totalCount = products.length;
    if (response.nextToken) {
      // Hay más productos, pero no sabemos el total exacto
      // Para evitar consultas adicionales costosas, usamos una estimación
      // basada en el patrón de paginación
      totalCount = (limit || 20) * 2; // Estimación conservadora
    }

    return {
      products,
      nextToken: response.nextToken,
      totalCount,
    };
  }

  /**
   * Obtiene un producto específico por ID
   */
  public async queryProductById(productId: string): Promise<ProductData | null> {
    const { data: product } = await cookiesClient.models.Product.get({
      id: productId,
    });

    return (product as ProductData) || null;
  }

  /**
   * Obtiene productos destacados de una tienda
   */
  public async queryFeaturedProducts(storeId: string, limit: number = 8): Promise<ProductData[]> {
    const response = await cookiesClient.models.Product.listProductByStoreId(
      { storeId },
      {
        limit,
        filter: {
          status: { eq: 'active' },
        },
      }
    );

    return (response.data as ProductData[]) || [];
  }

  /**
   * Obtiene productos de una colección específica con paginación
   */
  public async queryProductsByCollection(
    collectionId: string,
    options: ProductQueryOptions = {}
  ): Promise<ProductsQueryResponse> {
    const { limit = 20, nextToken } = options;

    const response = await cookiesClient.models.Product.listProductByCollectionId(
      {
        collectionId: collectionId,
      },
      {
        limit,
        nextToken: nextToken,
        filter: {
          status: { eq: 'active' },
        },
      }
    );

    const products = response.data as ProductData[];

    // Calcular totalCount: si hay nextToken, significa que hay más productos
    let totalCount = products.length;
    if (response.nextToken) {
      totalCount = (limit || 20) * 2; // Estimación conservadora
    }

    return {
      products,
      nextToken: response.nextToken,
      totalCount,
    };
  }

  /**
   * Obtiene todos los productos de una tienda para crear el mapa de handles
   */
  public async queryAllStoreProducts(storeId: string): Promise<ProductData[]> {
    const response = await cookiesClient.models.Product.listProductByStoreId(
      { storeId },
      {
        filter: {
          status: { eq: 'active' },
        },
      }
    );

    return (response.data as ProductData[]) || [];
  }
}

export const productQueryManager = new ProductQueryManager();
