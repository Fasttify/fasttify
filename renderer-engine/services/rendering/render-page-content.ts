import { logger } from '@/renderer-engine/lib/logger';
import { liquidEngine } from '@/renderer-engine/liquid/engine';
import { sectionRenderer } from '@/renderer-engine/services/rendering/section-renderer';
import { templateLoader } from '@/renderer-engine/services/templates/template-loader';
import type { PageRenderOptions } from '@/renderer-engine/types/template';
import type { Template } from 'liquidjs';

/**
 * Renderiza el contenido de la página (template específico)
 */
export async function renderPageContent(
  templatePath: string,
  pageTemplate: string,
  compiledPageTemplate: Template[] | undefined,
  context: any,
  storeId: string,
  options: PageRenderOptions,
  storeTemplate: any
): Promise<string> {
  if (templatePath.endsWith('.json')) {
    const templateConfig = JSON.parse(pageTemplate.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1'));
    return await renderSectionsFromConfig(templateConfig, storeId, context, storeTemplate);
  } else {
    if (!compiledPageTemplate) {
      throw new Error(`Compiled template for ${templatePath} not loaded`);
    }
    return await liquidEngine.renderCompiled(compiledPageTemplate, context);
  }
}

/**
 * Renderiza secciones desde configuración JSON
 */
export async function renderSectionsFromConfig(
  templateConfig: any,
  storeId: string,
  context: any,
  storeTemplate: any
): Promise<string> {
  const sectionPromises = templateConfig.order.map(async (sectionId: string) => {
    const sectionConfig = templateConfig.sections[sectionId];
    if (!sectionConfig) return '';

    try {
      const sectionContent = await templateLoader.loadTemplate(storeId, `${sectionConfig.type}.liquid`);
      return await sectionRenderer.renderSectionWithSchema(sectionConfig.type, sectionContent, context, storeTemplate);
    } catch (error) {
      logger.warn(`Section ${sectionConfig.type} not found`, error, 'DynamicPageRenderer');
      return `<!-- Section '${sectionConfig.type}' not found -->`;
    }
  });

  const renderedSections = await Promise.all(sectionPromises);
  return renderedSections.join('\n');
}
