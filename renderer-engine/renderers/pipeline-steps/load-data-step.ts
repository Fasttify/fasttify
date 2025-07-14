import { logger } from '@/renderer-engine/lib/logger';
import { dataFetcher } from '@/renderer-engine/services/fetchers/data-fetcher';
import { dynamicDataLoader } from '@/renderer-engine/services/page/dynamic-data-loader';
import { pageConfig } from '@/renderer-engine/services/page/page-config';
import { templateLoader } from '@/renderer-engine/services/templates/template-loader';
import type { RenderingData } from '@/renderer-engine/renderers/dynamic-page-renderer';

/**
 * Paso 4: Cargar todos los datos en paralelo
 */
export async function loadDataStep(data: RenderingData): Promise<RenderingData> {
  logger.info(`Using dynamic data loading for ${data.options.pageType}`, 'DynamicPageRenderer');

  const templatePath = pageConfig.getTemplatePath(data.options.pageType);
  const isJsonTemplate = templatePath.endsWith('.json');

  // Cargar todo en paralelo para máximo rendimiento
  const [layout, compiledLayout, pageData, storeTemplate, pageTemplate, compiledPageTemplate] = await Promise.all([
    templateLoader.loadMainLayout(data.store!.storeId),
    templateLoader.loadMainLayoutCompiled(data.store!.storeId),
    dynamicDataLoader.loadDynamicData(data.store!.storeId, data.options, data.searchParams),
    dataFetcher.getStoreNavigationMenus(data.store!.storeId),
    templateLoader.loadTemplate(data.store!.storeId, templatePath),
    // Solo cargar compilado si no es JSON, para no lanzar error innecesario
    isJsonTemplate
      ? Promise.resolve(undefined)
      : templateLoader.loadCompiledTemplate(data.store!.storeId, templatePath),
  ]);

  // Log del análisis dinámico para debugging
  logger.debug(
    `Dynamic analysis results for ${data.options.pageType}:`,
    {
      requiredData: Array.from(pageData.analysis.requiredData.keys()),
      liquidObjects: pageData.analysis.liquidObjects,
      dependencies: pageData.analysis.dependencies.length,
    },
    'DynamicPageRenderer'
  );

  return { ...data, layout, compiledLayout, pageData, storeTemplate, pageTemplate, compiledPageTemplate };
}
