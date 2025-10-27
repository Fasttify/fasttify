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

import { logger } from '../../lib/logger';
import { coreDataLoader, searchDataLoader } from './data-loader';
import type { CoreData } from './data-loader/core/core-data-loader';
import type { SearchData } from './data-loader/search/search-data-loader';
import type { CartContext } from '../../types';
import type { PageRenderOptions, PaginationInfo } from '../../types/template';

/**
 * Resultado de la carga dinámica de datos
 */
export interface DynamicLoadResult {
  products: any[];
  collections: any[];
  contextData: Record<string, any>;
  metaData: Record<string, any>;
  cartData: CartContext;
  analysis: any;
  nextToken?: string;
  paginate?: PaginationInfo;
  searchProducts?: any[];
  searchCollections?: any[];
}

/**
 * Cargador dinámico de datos basado en análisis de plantillas.
 * Orquesta el análisis, la carga de datos y la construcción del contexto.
 */
export class DynamicDataLoader {
  private static instance: DynamicDataLoader;

  private constructor() {}

  public static getInstance(): DynamicDataLoader {
    if (!DynamicDataLoader.instance) {
      DynamicDataLoader.instance = new DynamicDataLoader();
    }
    return DynamicDataLoader.instance;
  }

  /**
   * Carga todos los datos necesarios para renderizar una página
   */
  public async loadDynamicData(
    storeId: string,
    options: PageRenderOptions,
    searchParams: Record<string, string> = {},
    loadedTemplates?: Record<string, string>
  ): Promise<DynamicLoadResult> {
    try {
      const coreData: CoreData = await coreDataLoader.loadCoreData(storeId, options, searchParams);

      const cartContext: CartContext = {
        id: 'empty-cart',
        item_count: 0,
        total_price: 0,
        items: [],
        token: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        currency: 'COP',
      };

      let searchData: SearchData | null = null;
      if (loadedTemplates) {
        searchData = await searchDataLoader.loadSearchData(storeId, loadedTemplates, options.searchTerm);
        searchDataLoader.injectSearchDataIntoContext(coreData.contextData, searchData, options.searchTerm);
      }

      return {
        products: coreData.products,
        collections: coreData.collections,
        contextData: coreData.contextData,
        metaData: {},
        cartData: cartContext,
        analysis: coreData.analysis,
        nextToken: coreData.nextToken,
        paginate: coreData.paginate,
        searchProducts: searchData?.searchProducts,
        searchCollections: searchData?.searchCollections,
      };
    } catch (error) {
      logger.error('Error in dynamic data loading', error, 'DynamicDataLoader');
      return this.createFallbackData(storeId, options);
    }
  }

  /**
   * Crea datos de fallback en caso de error
   */
  private async createFallbackData(storeId: string, options: PageRenderOptions): Promise<DynamicLoadResult> {
    const cartContext: CartContext = {
      id: 'fallback-cart',
      item_count: 0,
      total_price: 0,
      items: [],
      token: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      currency: 'COP',
    };

    return {
      products: [],
      collections: [],
      contextData: {
        template: options.pageType,
        page_title: options.pageType.charAt(0).toUpperCase() + options.pageType.slice(1),
      },
      metaData: {},
      cartData: cartContext,
      analysis: {
        requiredData: new Map(),
        hasPagination: false,
        usedSections: [],
        liquidObjects: [],
        dependencies: [],
      },
      nextToken: undefined,
      searchProducts: [],
      searchCollections: [],
    };
  }

  /**
   * Obtiene estadísticas del último análisis (para debugging)
   */
  public getLastAnalysisStats(): any {
    return {
      message: 'Use loadDynamicData to get analysis results',
    };
  }
}

export const dynamicDataLoader = DynamicDataLoader.getInstance();
