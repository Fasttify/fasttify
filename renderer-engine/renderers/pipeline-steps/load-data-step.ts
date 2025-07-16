import { pageConfig } from '@/renderer-engine/config/page-config';
import { logger } from '@/renderer-engine/lib/logger';
import type { RenderingData } from '@/renderer-engine/renderers/dynamic-page-renderer';
import { dataFetcher } from '@/renderer-engine/services/fetchers/data-fetcher';
import { dynamicDataLoader } from '@/renderer-engine/services/page/dynamic-data-loader';
import { templateLoader } from '@/renderer-engine/services/templates/template-loader';

/**
 * Paso 4: Cargar todos los datos en paralelo
 */
export async function loadDataStep(data: RenderingData): Promise<RenderingData> {
  logger.info(`Using dynamic data loading for ${data.options.pageType}`, 'DynamicPageRenderer');

  const templatePath = pageConfig.getTemplatePath(data.options.pageType);
  const isJsonTemplate = templatePath.endsWith('.json');

  const [layout, compiledLayout, storeTemplate, pageTemplate, compiledPageTemplate] = await Promise.all([
    templateLoader.loadMainLayout(data.store!.storeId),
    templateLoader.loadMainLayoutCompiled(data.store!.storeId),
    dataFetcher.getStoreNavigationMenus(data.store!.storeId),
    templateLoader.loadTemplate(data.store!.storeId, templatePath),
    isJsonTemplate
      ? Promise.resolve(undefined)
      : templateLoader.loadCompiledTemplate(data.store!.storeId, templatePath),
  ]);

  const [settingsSchema] = await Promise.all([
    templateLoader.loadTemplate(data.store!.storeId, 'config/settings_schema.json').catch(() => null),
  ]);

  const loadedTemplates: Record<string, string> = {};
  if (layout) loadedTemplates['layout/theme.liquid'] = layout;
  if (pageTemplate) loadedTemplates[templatePath] = pageTemplate;
  if (settingsSchema) loadedTemplates['config/settings_schema.json'] = settingsSchema;

  const pageData = await dynamicDataLoader.loadDynamicData(
    data.store!.storeId,
    data.options,
    data.searchParams,
    loadedTemplates
  );

  logger.debug(
    `Dynamic analysis results for ${data.options.pageType}:`,
    {
      requiredData: Array.from(pageData.analysis.requiredData.keys()),
      liquidObjects: pageData.analysis.liquidObjects,
      dependencies: pageData.analysis.dependencies.length,
      searchProductsCount: pageData.searchProducts?.length,
    },
    'DynamicPageRenderer'
  );

  return { ...data, layout, compiledLayout, pageData, storeTemplate, pageTemplate, compiledPageTemplate };
}
