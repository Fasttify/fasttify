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
import type {
  DataRequirement,
  TemplateAnalysis,
} from '@/renderer-engine/services/templates/analysis/template-analyzer';
import type { PageRenderOptions } from '@/renderer-engine/types/template';

/**
 * Mapeo declarativo de tipos de página a paths de templates.
 * @private
 */
const templatePaths: Record<string, string> = {
  index: 'templates/index.json',
  product: 'templates/product.json',
  collection: 'templates/collection.json',
  cart: 'templates/cart.json',
  page: 'templates/page.json',
  policies: 'templates/policies.json',
  search: 'templates/search.json',
  '404': 'templates/404.json',
};

/**
 * Obtiene el path de la plantilla según el tipo de página.
 * @private
 */
function getTemplatePath(pageType: string): string {
  return templatePaths[pageType] || `templates/${pageType}.json`;
}

/**
 * Extrae el límite de paginación de la configuración de las secciones
 * dentro del archivo de plantilla JSON y lo asigna al objeto de análisis.
 *
 * @param loadedTemplates - Un mapa de plantillas cargadas.
 * @param options - Las opciones de renderizado de la página.
 * @param analysis - El objeto de análisis de la plantilla a modificar.
 */
export function extractPaginationLimitFromTemplate(
  loadedTemplates: Record<string, string>,
  options: PageRenderOptions,
  analysis: TemplateAnalysis
): void {
  // No necesitamos un `hasPagination` general aquí, ya que los límites se aplicarán por tipo de dato.
  // if (!analysis.hasPagination) {
  //   return;
  // }

  const templatePath = getTemplatePath(options.pageType);
  const pageTemplateContent = loadedTemplates[templatePath];

  if (!pageTemplateContent || !templatePath.endsWith('.json')) {
    return;
  }

  try {
    const templateConfig = JSON.parse(pageTemplateContent);
    const sections = templateConfig.sections;

    if (!sections) return;

    for (const sectionId in sections) {
      const sectionConfig = sections[sectionId];
      if (!sectionConfig || !sectionConfig.type) continue;

      const settings = sectionConfig.settings;
      let extractedLimit: number | undefined;
      let targetDataType: string | undefined;

      if (settings) {
        if (settings.products_per_page !== undefined) {
          extractedLimit = Number(settings.products_per_page);
          targetDataType = 'products';
        } else if (settings.collections_per_page !== undefined) {
          extractedLimit = Number(settings.collections_per_page);
          targetDataType = 'collections';
        } else if (
          (settings.id === 'products_per_page' || settings.id === 'collections_per_page') &&
          settings.default !== undefined
        ) {
          extractedLimit = Number(settings.default);
          targetDataType = settings.id === 'products_per_page' ? 'products' : 'collections';
        }
      }

      if (options.pageType === 'collection' && targetDataType === 'products') {
        targetDataType = 'collection';
      }

      if (extractedLimit !== undefined && targetDataType) {
        const existingOptions = analysis.requiredData.get(targetDataType as DataRequirement) || {};
        analysis.requiredData.set(targetDataType as DataRequirement, { ...existingOptions, limit: extractedLimit });
      }
    }
  } catch (error) {
    logger.warn(`Could not parse template to find pagination limits for ${templatePath}`, error);
  }
}
