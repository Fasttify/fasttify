import { pageConfig } from '@/renderer-engine/config/page-config';
import type { RenderingData } from '@/renderer-engine/renderers/dynamic-page-renderer';
import { renderPageContent } from '@/renderer-engine/services/rendering/render-page-content';

/**
 * Paso 6: Renderizar contenido de la página
 */
export async function renderContentStep(data: RenderingData): Promise<RenderingData> {
  const templatePath = pageConfig.getTemplatePath(data.options.pageType);

  const renderedContent = await renderPageContent(
    templatePath,
    data.pageTemplate!,
    data.compiledPageTemplate,
    data.context!,
    data.store!.storeId,
    data.options,
    data.storeTemplate!
  );

  return { ...data, renderedContent };
}
