import { dataFetcher } from '@/renderer-engine/services/fetchers/data-fetcher';
import { logger } from '@/renderer-engine/lib/logger';
import type { PageRenderOptions } from '@/renderer-engine/types/template';
import type { TemplateAnalysis } from '@/renderer-engine/services/templates/template-analyzer';
import { analyzeRequiredTemplates } from '@/renderer-engine/services/page/data-loader/template-analyzer-helper';
import { loadDataFromAnalysis } from '@/renderer-engine/services/page/data-loader/data-fetcher-helper';
import { buildContextData } from '@/renderer-engine/services/page/data-loader/context-builder-helper';

/**
 * Resultado de la carga dinámica de datos
 */
export interface DynamicLoadResult {
  products: any[];
  collections: any[];
  contextData: Record<string, any>;
  metaData: Record<string, any>;
  cartData: any;
  analysis: TemplateAnalysis;
  nextToken?: string;
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

  public async loadDynamicData(
    storeId: string,
    options: PageRenderOptions,
    searchParams: Record<string, string> = {}
  ): Promise<DynamicLoadResult> {
    try {
      const analysis = await analyzeRequiredTemplates(storeId, options);
      const cartData = dataFetcher.transformCartToContext(await dataFetcher.getCart(storeId));
      const { loadedData, paginationInfo } = await loadDataFromAnalysis(storeId, analysis, options, searchParams);
      const contextData = await buildContextData(storeId, options, loadedData);

      return {
        products: loadedData.products || [],
        collections: loadedData.collections || [],
        contextData,
        metaData: {},
        cartData,
        analysis,
        nextToken: paginationInfo.nextToken,
      };
    } catch (error) {
      logger.error('Error in dynamic data loading', error, 'DynamicDataLoader');
      return this.createFallbackData(storeId, options);
    }
  }

  private async createFallbackData(storeId: string, options: PageRenderOptions): Promise<DynamicLoadResult> {
    const cartData = dataFetcher.transformCartToContext(await dataFetcher.getCart(storeId));
    return {
      products: [],
      collections: [],
      contextData: {
        template: options.pageType,
        page_title: options.pageType.charAt(0).toUpperCase() + options.pageType.slice(1),
      },
      metaData: {},
      cartData,
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

  public getLastAnalysisStats(): any {
    return {
      message: 'Use loadDynamicData to get analysis results',
    };
  }
}

export const dynamicDataLoader = DynamicDataLoader.getInstance();
