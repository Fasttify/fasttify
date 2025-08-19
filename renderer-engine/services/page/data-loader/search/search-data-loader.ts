/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { logger } from '@/renderer-engine/lib/logger';
import { dataFetcher } from '@/renderer-engine/services/fetchers/data-fetcher';
import { productFetcher } from '@/renderer-engine/services/fetchers/product-fetcher';
import { extractSearchLimitsFromSettings } from '@/renderer-engine/services/page/data-loader/search/search-limits-extractor';
import type { ProductContext } from '@/renderer-engine/types';
import { cookiesClient } from '@/utils/server/AmplifyServer';

/**
 * Interfaz para los datos de búsqueda cargados
 */
export interface SearchData {
  searchProducts: ProductContext[];
  searchProductsLimit: number;
  searchCollections?: any[];
  searchCollectionsLimit?: number;
}

/**
 * Función interna para buscar productos por término de búsqueda.
 * Retorna ProductContext[]
 */
export async function searchProductsByTerm(
  storeId: string,
  searchTerm: string,
  limit: number = 20
): Promise<ProductContext[]> {
  if (!storeId || !searchTerm) {
    logger.warn('searchProductsByTerm: storeId or searchTerm missing.', { storeId, searchTerm });
    return [];
  }

  try {
    const { data } = await cookiesClient.models.Product.listProductByStoreId(
      { storeId },
      {
        limit,
        filter: {
          status: { eq: 'active' },
          nameLowercase: { contains: searchTerm.toLowerCase() },
        },
      }
    );
    return (data || []).map((product) => productFetcher.transformProduct(product));
  } catch (error) {
    logger.error('Failed to search products by term:', error);
    return [];
  }
}

/**
 * Cargador especializado para datos de búsqueda
 */
export class SearchDataLoader {
  private static instance: SearchDataLoader;

  private constructor() {}

  public static getInstance(): SearchDataLoader {
    if (!SearchDataLoader.instance) {
      SearchDataLoader.instance = new SearchDataLoader();
    }
    return SearchDataLoader.instance;
  }

  /**
   * Carga los datos necesarios para la funcionalidad de búsqueda
   * @param searchTerm - Término de búsqueda opcional para productos
   */
  public async loadSearchData(
    storeId: string,
    loadedTemplates: Record<string, string>,
    searchTerm?: string
  ): Promise<SearchData> {
    try {
      const { searchProductsLimit, searchCollectionsLimit } = extractSearchLimitsFromSettings(loadedTemplates);

      let searchProducts: ProductContext[] = [];

      if (searchTerm) {
        searchProducts = await searchProductsByTerm(storeId, searchTerm, searchProductsLimit);
        logger.info(`Search by term results: ${searchProducts.length} products for term "${searchTerm}"`);
      } else {
        const searchProductsData = await dataFetcher.getStoreProducts(storeId, {
          limit: searchProductsLimit,
        });
        searchProducts = searchProductsData.products || [];
        logger.info(`Loaded ${searchProducts.length} regular products for search page`);
      }

      let searchCollections: any[] = [];
      if (searchCollectionsLimit) {
        try {
          const collectionsData = await dataFetcher.getStoreCollections(storeId, {
            limit: searchCollectionsLimit,
          });
          searchCollections = collectionsData.collections || [];
        } catch (error) {
          logger.warn('Failed to load search collections', error);
        }
      }

      logger.info(`Search data loaded successfully`, {
        productsCount: searchProducts.length,
        collectionsCount: searchCollections.length,
        productsLimit: searchProductsLimit,
        collectionsLimit: searchCollectionsLimit,
        searchTerm: searchTerm || 'N/A',
      });

      return {
        searchProducts,
        searchProductsLimit,
        searchCollections,
        searchCollectionsLimit,
      };
    } catch (error) {
      logger.warn('Failed to load search data, using fallback', error);
      return {
        searchProducts: [],
        searchProductsLimit: 8,
        searchCollections: [],
        searchCollectionsLimit: undefined,
      };
    }
  }

  /**
   * Inyecta los datos de búsqueda en el contexto Liquid
   */
  public injectSearchDataIntoContext(
    contextData: Record<string, any>,
    searchData: SearchData,
    searchTerm?: string
  ): void {
    contextData.search_products = searchData.searchProducts;
    contextData.search_products_limit = searchData.searchProductsLimit;

    if (searchData.searchCollections && searchData.searchCollections.length > 0) {
      contextData.search_collections = searchData.searchCollections;
      contextData.search_collections_limit = searchData.searchCollectionsLimit;
    }

    if (searchTerm) {
      contextData.search_term = searchTerm;
    }
  }
}

export const searchDataLoader = SearchDataLoader.getInstance();
