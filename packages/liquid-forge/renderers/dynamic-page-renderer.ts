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

import { injectAssets } from '../lib/inject-assets';
import { logger } from '../lib/logger';
import { liquidEngine } from '../liquid/engine';
import { pageConfig } from '../config/page-config';
import { getCachedPageRender, makePageCacheKey, setCachedPageRender } from '../services/rendering/page-html-cache';
import { domainResolver } from '../services/core/domain-resolver';
import { errorRenderer } from '../services/errors/error-renderer';
import { createTemplateError } from '../services/errors/error-utils';
import { metadataGenerator } from '../services/rendering/metadata-generator';
import { sectionRenderer } from '../services/rendering/section-renderer';
import { templateLoader } from '../services/templates/template-loader';
import {
  buildContextStep,
  initializeEngineStep,
  loadDataStep,
  renderContentStep,
  resolveStoreStep,
} from './pipeline-steps';
import type { RenderResult, ShopContext, TemplateError } from '../types';
import type { PageRenderOptions } from '../types/template';
import type { Template } from 'liquidjs';

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
  sessionId?: string;
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
  navigationMenus?: any;
  themeSettings?: Record<string, any>;
  cacheKey?: string;
}

/**
 * Pipeline declarativo de pasos de renderizado
 */
const renderingPipeline: RenderStep[] = [
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
      if (options.pageType === 'search' && searchParams.q) {
        options.searchTerm = searchParams.q;
      }

      let data: RenderingData = { domain, options, searchParams };

      // 1) Resolver tienda
      data = await resolveStoreStep(data);

      // 2) Ejecutar pasos hasta tener contexto completo para formar una clave específica
      for (const step of [initializeEngineStep, loadDataStep, buildContextStep]) {
        data = await step(data);
      }

      // 3) Intentar HIT de caché con routeId derivado de options + context + params
      const { cacheKey: earlyCacheKey, cached } = getCachedPageRender(
        data.store!.storeId,
        data.options,
        data.searchParams,
        data.context
      );
      if (earlyCacheKey && cached) {
        return {
          html: cached.html,
          metadata: cached.metadata,
          cacheKey: earlyCacheKey,
          cacheTTL: pageConfig.getCacheTTL(options.pageType),
        };
      }

      // 4) Continuar renderizado
      for (const step of [renderContentStep, renderLayoutStep, generateMetadataStep]) {
        data = await step(data);
      }

      const result = {
        html: data.html!,
        metadata: data.metadata!,
        cacheKey: data.cacheKey!,
        cacheTTL: pageConfig.getCacheTTL(options.pageType),
      };

      // 5) Guardar en caché el resultado (html + metadata) con TTL de página
      setCachedPageRender(result.cacheKey, { html: result.html, metadata: result.metadata }, options.pageType);

      return result;
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
        } catch {}
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

  const html = injectAssets(htmlRaw, liquidEngine.assetCollector, data.domain);

  return { ...data, html };
}

/**
 * Paso 8: Generar metadata y clave de caché
 */
async function generateMetadataStep(data: RenderingData): Promise<RenderingData> {
  const pageTitle = (data.context as any).page_title || (data.context as any).page?.title;
  const metadata = metadataGenerator.generateMetadata(data.store!, pageTitle);
  const cacheKey = makePageCacheKey(data.store!.storeId, data.options, data.searchParams, data.context);

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
  storeTemplate: any,
  pageType?: string
): Promise<string> {
  const sectionPromises = templateConfig.order.map(async (sectionId: string) => {
    const sectionConfig = templateConfig.sections[sectionId];
    if (!sectionConfig) return '';

    try {
      const sectionContent = await templateLoader.loadTemplate(storeId, `${sectionConfig.type}.liquid`);
      return await sectionRenderer.renderSectionWithSchema(
        sectionConfig.type,
        sectionContent,
        context,
        storeTemplate,
        sectionId,
        pageType
      );
    } catch (error) {
      logger.warn(`Section ${sectionConfig.type} not found`, error, 'DynamicPageRenderer');
      return `<!-- Section '${sectionConfig.type}' not found -->`;
    }
  });

  const renderedSections = await Promise.all(sectionPromises);
  return renderedSections.join('\n');
}

export const dynamicPageRenderer = new DynamicPageRenderer();
