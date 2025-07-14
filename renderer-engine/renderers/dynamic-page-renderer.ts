import { injectAssets } from '@/renderer-engine/lib/inject-assets';
import { logger } from '@/renderer-engine/lib/logger';
import { liquidEngine } from '@/renderer-engine/liquid/engine';
import { domainResolver } from '@/renderer-engine/services/core/domain-resolver';
import { errorRenderer } from '@/renderer-engine/services/errors/error-renderer';
import { createTemplateError } from '@/renderer-engine/services/errors/error-utils';
import { pageConfig } from '@/renderer-engine/services/page/page-config';
import { metadataGenerator } from '@/renderer-engine/services/rendering/metadata-generator';
import { sectionRenderer } from '@/renderer-engine/services/rendering/section-renderer';
import { templateLoader } from '@/renderer-engine/services/templates/template-loader';
import type { RenderResult, ShopContext, TemplateError } from '@/renderer-engine/types';
import type { PageRenderOptions } from '@/renderer-engine/types/template';
import type { Template } from 'liquidjs';
import { buildContextStep } from '@/renderer-engine/renderers/pipeline-steps/build-context-step';
import { initializeEngineStep } from '@/renderer-engine/renderers/pipeline-steps/initialize-engine-step';
import { loadDataStep } from '@/renderer-engine/renderers/pipeline-steps/load-data-step';
import { renderContentStep } from '@/renderer-engine/renderers/pipeline-steps/render-content-step';
import { resolveStoreStep } from '@/renderer-engine/renderers/pipeline-steps/resolve-store-step';

/**
 * Tipo para pasos del pipeline de renderizado
 */
type RenderStep = (data: RenderingData) => Promise<RenderingData>;

/**
 * Datos que pasan a través del pipeline de renderizado
 */
export interface RenderingData {
  domain: string;
  options: PageRenderOptions;
  searchParams: Record<string, string>;
  store?: any;
  layout?: string;
  compiledLayout?: Template[];
  pageData?: any;
  storeTemplate?: any;
  context?: any;
  pageTemplate?: string;
  compiledPageTemplate?: Template[];
  renderedContent?: string;
  html?: string;
  metadata?: any;
  cacheKey?: string;
}

/**
 * Pipeline declarativo de pasos de renderizado
 */
const renderingPipeline: RenderStep[] = [
  resolveStoreStep,
  initializeEngineStep,
  loadDataStep,
  buildContextStep,
  renderContentStep,
  renderLayoutStep,
  generateMetadataStep,
];

export class DynamicPageRenderer {
  /**
   * Renderiza cualquier página de una tienda usando un pipeline declarativo
   */
  public async render(
    domain: string,
    options: PageRenderOptions = { pageType: 'index' },
    searchParams: Record<string, string> = {}
  ): Promise<RenderResult> {
    try {
      let data: RenderingData = { domain, options, searchParams };

      // Ejecutar pipeline de renderizado
      for (const step of renderingPipeline) {
        data = await step(data);
      }

      return {
        html: data.html!,
        metadata: data.metadata!,
        cacheKey: data.cacheKey!,
        cacheTTL: pageConfig.getCacheTTL(options.pageType),
      };
    } catch (error) {
      return this.handleRenderError(error, domain, options);
    }
  }

  private async handleRenderError(error: unknown, domain: string, options: PageRenderOptions): Promise<RenderResult> {
    logger.error(`Error rendering ${options.pageType} page for domain ${domain}`, error, 'DynamicPageRenderer');

    if (error && typeof error === 'object' && 'type' in error) {
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    throw createTemplateError('RENDER_ERROR', `Failed to render ${options.pageType} page: ${errorMessage}`);
  }

  public async renderError(error: TemplateError, domain: string, path?: string): Promise<RenderResult> {
    try {
      let store: ShopContext | undefined = undefined;
      if (error.type !== 'STORE_NOT_FOUND') {
        try {
          store = (await domainResolver.resolveStoreByDomain(domain)) as unknown as ShopContext;
        } catch {
          // Continua sin información de la tienda si falla
        }
      }
      return await errorRenderer.renderError(error, { domain, path, store });
    } catch (renderError) {
      logger.error('Critical error in renderError', renderError, 'DynamicPageRenderer');
      throw error;
    }
  }
}

/**
 * Paso 7: Renderizar layout completo
 */
async function renderLayoutStep(data: RenderingData): Promise<RenderingData> {
  // Pre-cargar secciones del layout en paralelo
  await preloadLayoutSections(data.store!.storeId, data.layout!, data.context!, data.storeTemplate!);
  (data.context as any).content_for_layout = data.renderedContent!;
  (data.context as any).content_for_header = metadataGenerator.generateHeadContent(data.store!);

  const htmlRaw = await liquidEngine.renderCompiled(data.compiledLayout!, data.context!);

  const html = injectAssets(htmlRaw, liquidEngine.assetCollector);

  return { ...data, html };
}

/**
 * Paso 8: Generar metadata y clave de caché
 */
async function generateMetadataStep(data: RenderingData): Promise<RenderingData> {
  const pageTitle = (data.context as any).page_title || (data.context as any).page?.title;
  const metadata = metadataGenerator.generateMetadata(data.store!, data.domain, pageTitle);
  const cacheKey = generateCacheKey(data.store!.storeId, data.options);

  return { ...data, metadata, cacheKey };
}

/**
 * Pre-carga secciones del layout en paralelo
 */
async function preloadLayoutSections(storeId: string, layout: string, context: any, storeTemplate: any): Promise<void> {
  const layoutSections = sectionRenderer.extractSectionNamesFromLayout(layout);
  if (layoutSections.length === 0) return;

  const sectionPromises = layoutSections.map(async (sectionName: string) => {
    const sectionContent = await sectionRenderer.loadSectionSafely(storeId, sectionName, context, storeTemplate);
    return { name: sectionName, content: sectionContent };
  });

  const sectionResults = await Promise.all(sectionPromises);
  const preloadedSections: Record<string, string> = {};

  sectionResults.forEach(({ name, content }) => {
    preloadedSections[name] = content;
  });
  (context as any).preloaded_sections = preloadedSections;
}

/**
 * Renderiza secciones desde configuración JSON
 */
async function renderSectionsFromConfig(
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

/**
 * Genera clave de caché para la página
 */
function generateCacheKey(storeId: string, options: PageRenderOptions): string {
  const { pageType, handle, productId, collectionId } = options;
  const identifier = handle || productId || collectionId || 'default';
  return `${pageType}_${storeId}_${identifier}_${Date.now()}`;
}

export const dynamicPageRenderer = new DynamicPageRenderer();
