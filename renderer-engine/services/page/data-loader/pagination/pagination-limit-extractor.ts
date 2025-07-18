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
          targetDataType = 'products'; // O 'collection' si la sección es de productos de colección
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

      // Si la página actual es de tipo 'collection' y el límite es para 'products',
      // reasignar el targetDataType a 'collection' para que afecte a los productos dentro de la colección.
      if (options.pageType === 'collection' && targetDataType === 'products') {
        targetDataType = 'collection';
      }

      if (extractedLimit !== undefined && targetDataType) {
        // Actualizar el límite en requiredData para el tipo de datos específico
        const existingOptions = analysis.requiredData.get(targetDataType as DataRequirement) || {};
        analysis.requiredData.set(targetDataType as DataRequirement, { ...existingOptions, limit: extractedLimit });
      }
    }

    // NOTA: La propiedad `paginationLimit` en `analysis` ya no se usa y se eliminará.
  } catch (error) {
    logger.warn(`Could not parse template to find pagination limits for ${templatePath}`, error);
  }
}
