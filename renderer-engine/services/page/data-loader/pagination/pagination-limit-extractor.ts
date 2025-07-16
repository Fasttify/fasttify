import { logger } from '@/renderer-engine/lib/logger';
import type { TemplateAnalysis } from '@/renderer-engine/services/templates/template-analyzer';
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
  if (!analysis.hasPagination) {
    return;
  }

  const templatePath = getTemplatePath(options.pageType);
  const pageTemplateContent = loadedTemplates[templatePath];

  if (!pageTemplateContent || !templatePath.endsWith('.json')) {
    return;
  }

  try {
    const templateConfig = JSON.parse(pageTemplateContent);
    const sections = templateConfig.sections;

    if (!sections) return;

    let limit: number | undefined;

    for (const sectionId in sections) {
      const sectionConfig = sections[sectionId];
      if (!sectionConfig || !sectionConfig.type) continue;

      const settings = sectionConfig.settings;
      let jsonOverride: number | undefined;

      if (settings) {
        if (settings.products_per_page || settings.collections_per_page) {
          jsonOverride = Number(settings.products_per_page || settings.collections_per_page);
        } else if (
          (settings.id === 'products_per_page' || settings.id === 'collections_per_page') &&
          settings.default
        ) {
          jsonOverride = Number(settings.default);
        }
      }

      if (jsonOverride) {
        limit = jsonOverride;
        break;
      }

      const sectionPath = `sections/${sectionConfig.type}.liquid`;
      const sectionContent = loadedTemplates[sectionPath];
      if (!sectionContent) continue;

      const schemaMatch = sectionContent.match(/\{%\s*schema\s*%\}([\s\S]*?)\{%\s*endschema\s*%\}/);
      if (!schemaMatch || !schemaMatch[1]) continue;

      try {
        const schema = JSON.parse(schemaMatch[1]);
        const paginationSetting = schema.settings?.find(
          (s: any) => s.id === 'collections_per_page' || s.id === 'products_per_page'
        );

        if (paginationSetting?.default) {
          limit = Number(paginationSetting.default);
          break;
        }
      } catch (e) {
        logger.warn(`Failed to parse schema for ${sectionPath}`, { error: e });
      }
    }

    if (limit) {
      (analysis as any).paginationLimit = limit;
    }
  } catch (error) {
    logger.warn(`Could not parse template to find pagination limit for ${templatePath}`, error);
  }
}
