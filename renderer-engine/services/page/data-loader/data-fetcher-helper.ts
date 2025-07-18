import { logger } from '@/renderer-engine/lib/logger';
import type { TemplateAnalysis } from '@/renderer-engine/services/templates/analysis/template-analyzer';
import type { PageRenderOptions, PaginationInfo } from '@/renderer-engine/types/template';
import { loadSpecificData } from './handlers/data-handlers';
import { responseProcessors } from './handlers/response-processors';

/**
 * Carga datos basándose en el análisis de plantillas.
 */
export async function loadDataFromAnalysis(
  storeId: string,
  analysis: TemplateAnalysis,
  options: PageRenderOptions,
  searchParams: Record<string, string>
): Promise<{ loadedData: Record<string, any>; paginationInfo: PaginationInfo }> {
  const loadedData: Record<string, any> = {};
  const paginationInfo: PaginationInfo = {};
  const loadPromises: Promise<void>[] = [];

  for (const [dataType, loadOptions] of analysis.requiredData.entries()) {
    const effectiveLoadOptions = { ...loadOptions };

    // Obtener el límite específico para este dataType del análisis de la plantilla
    const specificLimit = analysis.requiredData.get(dataType)?.limit;
    if (specificLimit !== undefined) {
      effectiveLoadOptions.limit = specificLimit;
    }

    if (searchParams.token) {
      effectiveLoadOptions.nextToken = searchParams.token;
    }

    const promise = loadSpecificData(storeId, dataType, effectiveLoadOptions, options)
      .then((data) => {
        if (data) {
          const processor = responseProcessors[dataType];
          if (processor) {
            processor(data, dataType, loadedData, paginationInfo);
          } else {
            loadedData[dataType] = data;
          }
        }
      })
      .catch((error) => {
        logger.warn(`Failed to load ${dataType}`, error, 'DynamicDataLoader');
      });

    loadPromises.push(promise);
  }

  await Promise.all(loadPromises);
  return { loadedData, paginationInfo };
}
