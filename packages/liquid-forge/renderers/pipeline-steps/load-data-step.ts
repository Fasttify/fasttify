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

import { pageConfig } from '../../config/page-config';
import { logger } from '../../lib/logger';
import type { RenderingData } from '../dynamic-page-renderer';
import { dataFetcher } from '../../services/fetchers/data-fetcher';
import { dynamicDataLoader } from '../../services/page/dynamic-data-loader';
import { templateLoader } from '../../services/templates/template-loader';
import { settingsLoader } from '../../services/themes/settings';

/**
 * Paso 4: Cargar todos los datos en paralelo
 */
export async function loadDataStep(data: RenderingData): Promise<RenderingData> {
  const templatePath = pageConfig.getTemplatePath(data.options.pageType);
  const isJsonTemplate = templatePath.endsWith('.json');

  const [layout, compiledLayout, navigationMenus, pageTemplate, compiledPageTemplate, themeSettings] =
    await Promise.all([
      templateLoader.loadMainLayout(data.store!.storeId),
      templateLoader.loadMainLayoutCompiled(data.store!.storeId),
      dataFetcher.getStoreNavigationMenus(data.store!.storeId),
      templateLoader.loadTemplate(data.store!.storeId, templatePath),
      isJsonTemplate
        ? Promise.resolve(undefined)
        : templateLoader.loadCompiledTemplate(data.store!.storeId, templatePath),
      settingsLoader.loadSettings(data.store!.storeId),
    ]);

  // Cargar la configuración del template para obtener products_per_page
  let storeTemplate = null;
  if (isJsonTemplate && pageTemplate) {
    try {
      const templateConfig = JSON.parse(pageTemplate.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1'));
      storeTemplate = { templates: { [data.options.pageType]: templateConfig } };
    } catch (error) {
      logger.warn('Error parsing template config:', error);
    }
  }

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

  return {
    ...data,
    layout,
    compiledLayout,
    pageData,
    storeTemplate,
    pageTemplate,
    compiledPageTemplate,
    navigationMenus,
    themeSettings,
  };
}
