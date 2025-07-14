import { pageConfig } from '@/renderer-engine/services/page/page-config';
import { renderPageContent } from '@/renderer-engine/services/rendering/render-page-content';
import type { RenderingData } from '@/renderer-engine/renderers/dynamic-page-renderer';

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
