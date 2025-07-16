import { logger } from '@/renderer-engine/lib/logger';
import { coreDataLoader, searchDataLoader } from '@/renderer-engine/services/page/data-loader';
import type { CoreData } from '@/renderer-engine/services/page/data-loader/core/core-data-loader';
import type { SearchData } from '@/renderer-engine/services/page/data-loader/search/search-data-loader';
import type { PageRenderOptions, PaginationInfo } from '@/renderer-engine/types/template';

/**
 * Resultado de la carga dinámica de datos
 */
export interface DynamicLoadResult {
  products: any[];
  collections: any[];
  contextData: Record<string, any>;
  metaData: Record<string, any>;
  cartData: any;
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
      // Cargar datos principales (productos, colecciones, carrito, etc.)
      const coreData: CoreData = await coreDataLoader.loadCoreData(storeId, options, searchParams);

      // Cargar datos de búsqueda si tenemos acceso a las plantillas
      let searchData: SearchData | null = null;
      if (loadedTemplates) {
        searchData = await searchDataLoader.loadSearchData(storeId, loadedTemplates);

        // Inyectar datos de búsqueda en el contexto
        searchDataLoader.injectSearchDataIntoContext(coreData.contextData, searchData);
      }

      logger.info(`Dynamic data loading completed for ${options.pageType}`, {
        coreProductsCount: coreData.products.length,
        coreCollectionsCount: coreData.collections.length,
        searchProductsCount: searchData?.searchProducts.length || 0,
        searchCollectionsCount: searchData?.searchCollections?.length || 0,
      });

      return {
        products: coreData.products,
        collections: coreData.collections,
        contextData: coreData.contextData,
        metaData: {},
        cartData: coreData.cartData,
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
    return {
      products: [],
      collections: [],
      contextData: {
        template: options.pageType,
        page_title: options.pageType.charAt(0).toUpperCase() + options.pageType.slice(1),
      },
      metaData: {},
      cartData: null,
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
