import { logger } from '@/renderer-engine/lib/logger';
import { loadDataFromAnalysis } from '@/renderer-engine/services/page/data-loader';
import { buildContextData } from '@/renderer-engine/services/page/data-loader/core/context-builder-helper';
import { analyzeRequiredTemplates } from '@/renderer-engine/services/page/data-loader/core/template-analyzer-helper';
import { buildPaginationObject } from '@/renderer-engine/services/page/data-loader/pagination/pagination-builder-helper';
import type { TemplateAnalysis } from '@/renderer-engine/services/templates/analysis/template-analyzer';
import type { PageRenderOptions, PaginationInfo } from '@/renderer-engine/types/template';

/**
 * Interfaz para los datos principales cargados
 */
export interface CoreData {
  products: any[];
  collections: any[];
  contextData: Record<string, any>;
  analysis: TemplateAnalysis;
  nextToken?: string;
  paginate?: PaginationInfo;
}

/**
 * Cargador especializado para datos principales de la página
 */
export class CoreDataLoader {
  private static instance: CoreDataLoader;

  private constructor() {}

  public static getInstance(): CoreDataLoader {
    if (!CoreDataLoader.instance) {
      CoreDataLoader.instance = new CoreDataLoader();
    }
    return CoreDataLoader.instance;
  }

  /**
   * Carga los datos principales necesarios para renderizar la página
   */
  public async loadCoreData(
    storeId: string,
    options: PageRenderOptions,
    searchParams: Record<string, string> = {}
  ): Promise<CoreData> {
    try {
      const analysis = await analyzeRequiredTemplates(storeId, options);

      const { loadedData, paginationInfo } = await loadDataFromAnalysis(storeId, analysis, options, searchParams);

      const contextData = await buildContextData(storeId, options, loadedData);

      // El límite se obtiene ahora dentro de loadDataFromAnalysis
      const currentLimitForLogging =
        analysis.requiredData.get('products')?.limit || analysis.requiredData.get('collections')?.limit || 50;

      const paginate = buildPaginationObject(
        analysis,
        loadedData,
        paginationInfo,
        searchParams,
        currentLimitForLogging
      );
      if (paginate) {
        contextData.paginate = paginate;
      }

      logger.info(`Core data loaded successfully for ${options.pageType}`, {
        productsCount: loadedData.products?.length || 0,
        collectionsCount: loadedData.collections?.length || 0,
        hasPagination: analysis.hasPagination,
        paginationLimit: currentLimitForLogging,
      });

      return {
        products: loadedData.products || [],
        collections: loadedData.collections || [],
        contextData,
        analysis,
        nextToken: paginationInfo.nextToken,
        paginate,
      };
    } catch (error) {
      logger.error('Error in core data loading', error, 'CoreDataLoader');
      return this.createFallbackData(storeId, options);
    }
  }

  /**
   * Crea datos de fallback en caso de error
   */
  private async createFallbackData(storeId: string, options: PageRenderOptions): Promise<CoreData> {
    return {
      products: [],
      collections: [],
      contextData: {
        template: options.pageType,
        page_title: options.pageType.charAt(0).toUpperCase() + options.pageType.slice(1),
      },
      analysis: {
        requiredData: new Map(),
        hasPagination: false,
        usedSections: [],
        liquidObjects: [],
        dependencies: [],
      },
      nextToken: undefined,
    };
  }
}

export const coreDataLoader = CoreDataLoader.getInstance();
