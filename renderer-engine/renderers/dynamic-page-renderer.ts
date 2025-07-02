import { domainResolver } from '@/renderer-engine/services/core/domain-resolver';
import { templateLoader } from '@/renderer-engine/services/templates/template-loader';
import { dataFetcher } from '@/renderer-engine/services/fetchers/data-fetcher';
import { liquidEngine } from '@/renderer-engine/liquid/engine';
import { contextBuilder } from '@/renderer-engine/services/rendering/context-builder';
import { metadataGenerator } from '@/renderer-engine/services/rendering/metadata-generator';
import { sectionRenderer } from '@/renderer-engine/services/rendering/section-renderer';
import { errorRenderer } from '@/renderer-engine/services/errors/error-renderer';
import { pageConfig } from '@/renderer-engine/services/page/page-config';
import { dynamicDataLoader } from '@/renderer-engine/services/page/dynamic-data-loader';
import { logger } from '@/renderer-engine/lib/logger';
import type { RenderResult, ShopContext, TemplateError } from '@/renderer-engine/types';
import type { PageRenderOptions } from '@/renderer-engine/types/template';

/**
 * Tipo para pasos del pipeline de renderizado
 */
type RenderStep = (data: RenderingData) => Promise<RenderingData>;

/**
 * Datos que pasan a través del pipeline de renderizado
 */
interface RenderingData {
  domain: string;
  options: PageRenderOptions;
  searchParams: Record<string, string>;
  store?: any;
  layout?: string;
  pageData?: any;
  storeTemplate?: any;
  context?: any;
  pageTemplate?: string;
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
    throw this.createTemplateError('RENDER_ERROR', `Failed to render ${options.pageType} page: ${errorMessage}`);
  }

  private createTemplateError(type: TemplateError['type'], message: string): TemplateError {
    return {
      type,
      message,
      statusCode: type === 'TEMPLATE_NOT_FOUND' ? 404 : 500,
    };
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
 * Paso 1: Resolver dominio a tienda
 */
async function resolveStoreStep(data: RenderingData): Promise<RenderingData> {
  const store = await domainResolver.resolveStoreByDomain(data.domain);
  return { ...data, store };
}

/**
 * Paso 2: Inicializar motor de rendering
 */
async function initializeEngineStep(data: RenderingData): Promise<RenderingData> {
  liquidEngine.assetCollector.clear();
  return data;
}

/**
 * Paso 4: Cargar todos los datos en paralelo
 */
async function loadDataStep(data: RenderingData): Promise<RenderingData> {
  logger.info(`Using dynamic data loading for ${data.options.pageType}`, 'DynamicPageRenderer');

  const templatePath = pageConfig.getTemplatePath(data.options.pageType);

  // Cargar todo en paralelo para máximo rendimiento
  const [layout, pageData, storeTemplate, pageTemplate] = await Promise.all([
    templateLoader.loadMainLayout(data.store!.storeId),
    dynamicDataLoader.loadDynamicData(data.store!.storeId, data.options, data.searchParams),
    dataFetcher.getStoreNavigationMenus(data.store!.storeId),
    templateLoader.loadTemplate(data.store!.storeId, templatePath),
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

  return { ...data, layout, pageData, storeTemplate, pageTemplate };
}

/**
 * Paso 5: Construir contexto de renderizado
 */
async function buildContextStep(data: RenderingData): Promise<RenderingData> {
  const context = await contextBuilder.createRenderContext(
    data.store!,
    data.pageData!.products || [],
    data.pageData!.collections || [],
    data.storeTemplate!,
    data.pageData!.cartData
  );

  // Combinar datos dinámicos
  Object.assign(context, data.pageData!.contextData);

  // Agregar tokens de paginación
  if (data.pageData!.nextToken) {
    (context as any).next_token = data.pageData!.nextToken;
  }

  if (data.searchParams.token) {
    (context as any).current_token = data.searchParams.token;
  }

  // Agregar objeto request para el tag paginate
  (context as any).request = {
    searchParams: new URLSearchParams(Object.entries(data.searchParams).map(([key, value]) => [key, value])),
  };

  return { ...data, context };
}

/**
 * Paso 6: Renderizar contenido de la página
 */
async function renderContentStep(data: RenderingData): Promise<RenderingData> {
  const templatePath = pageConfig.getTemplatePath(data.options.pageType);

  const renderedContent = await renderPageContent(
    templatePath,
    data.pageTemplate!,
    data.context!,
    data.store!.storeId,
    data.options,
    data.storeTemplate!
  );

  return { ...data, renderedContent };
}

/**
 * Paso 7: Renderizar layout completo
 */
async function renderLayoutStep(data: RenderingData): Promise<RenderingData> {
  // Pre-cargar secciones del layout en paralelo
  await preloadLayoutSections(data.store!.storeId, data.layout!, data.context!, data.storeTemplate!);
  (data.context as any).content_for_layout = data.renderedContent!;
  (data.context as any).content_for_header = metadataGenerator.generateHeadContent(data.store!);

  const htmlRaw = await liquidEngine.render(
    data.layout!,
    data.context!,
    `${data.options.pageType}_${data.store!.storeId}`
  );

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
 * Renderiza el contenido de la página (template específico)
 */
async function renderPageContent(
  templatePath: string,
  pageTemplate: string,
  context: any,
  storeId: string,
  options: PageRenderOptions,
  storeTemplate: any
): Promise<string> {
  if (templatePath.endsWith('.json')) {
    const templateConfig = JSON.parse(pageTemplate.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1'));
    return await renderSectionsFromConfig(templateConfig, storeId, context, storeTemplate);
  } else {
    return await liquidEngine.render(pageTemplate, context, `${options.pageType}_${storeId}`);
  }
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
 * Inyecta assets CSS y JS en el HTML
 */
function injectAssets(html: string, assetCollector: any): string {
  let finalHtml = html;
  const css = assetCollector.getCombinedCss();
  const js = assetCollector.getCombinedJs();

  if (css) {
    const styleTag = `<style data-fasttify-assets="true">${css}</style>`;
    finalHtml = finalHtml.includes('</head>')
      ? finalHtml.replace('</head>', `${styleTag}</head>`)
      : finalHtml + styleTag;
  }

  if (js) {
    const scriptTag = `<script data-fasttify-assets="true">${js}</script>`;
    finalHtml = finalHtml.includes('</body>')
      ? finalHtml.replace('</body>', `${scriptTag}</body>`)
      : finalHtml + scriptTag;
  }

  return finalHtml;
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
