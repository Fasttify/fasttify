import { logger } from '@/renderer-engine/lib/logger';
import { DynamicPageRenderer } from '@/renderer-engine/renderers/dynamic-page-renderer';
import type { RenderResult } from '@/renderer-engine/types';
import type { PageRenderOptions } from '@/renderer-engine/types/template';

/**
 * Tipo para matchers de rutas
 */
type RouteMatcher = {
  pattern: RegExp;
  handler: (match: RegExpMatchArray) => PageRenderOptions;
};

/**
 * Matchers declarativos para rutas de tienda
 */
const routeMatchers: RouteMatcher[] = [
  // Homepage
  {
    pattern: /^\/$/,
    handler: () => ({ pageType: 'index' }),
  },

  // Producto: /products/handle
  {
    pattern: /^\/products\/([^\/]+)$/,
    handler: (match) => ({
      pageType: 'product',
      handle: match[1],
    }),
  },

  // Colección: /collections/handle
  {
    pattern: /^\/collections\/([^\/]+)$/,
    handler: (match) => ({
      pageType: 'collection',
      handle: match[1],
    }),
  },

  // Policies: /policies
  {
    pattern: /^\/policies$/,
    handler: () => ({ pageType: 'policies' }),
  },

  // Página estática: /pages/handle (plural)
  {
    pattern: /^\/pages\/([^\/]+)$/,
    handler: (match) => ({
      pageType: 'page',
      handle: match[1],
    }),
  },

  // Blog: /blogs/handle
  {
    pattern: /^\/blogs\/([^\/]+)$/,
    handler: (match) => ({
      pageType: 'blog',
      handle: match[1],
    }),
  },

  // Rutas exactas
  {
    pattern: /^\/search$/,
    handler: () => ({ pageType: 'search' }),
  },

  {
    pattern: /^\/cart$/,
    handler: () => ({ pageType: 'cart' }),
  },

  {
    pattern: /^\/404$/,
    handler: () => ({ pageType: '404' }),
  },

  // Casos especiales para compatibilidad
  {
    pattern: /^\/collection$/,
    handler: () => ({ pageType: 'collection' }),
  },

  {
    pattern: /^\/products$/,
    handler: () => ({ pageType: 'product' }),
  },
];

/**
 * Factory principal del sistema de renderizado de tiendas
 * Usa el nuevo sistema dinámico unificado
 */
export class StoreRendererFactory {
  private dynamicRenderer: DynamicPageRenderer;

  constructor() {
    this.dynamicRenderer = new DynamicPageRenderer();
  }

  /**
   * Renderiza cualquier página de una tienda basada en el path
   * @param domain - Dominio completo de la tienda
   * @param path - Path de la página (ej: '/', '/products/mi-producto')
   * @param searchParams - Parámetros de búsqueda (opcional)
   * @returns Resultado del renderizado con metadata SEO
   */
  public async renderPage(
    domain: string,
    path: string = '/',
    searchParams: Record<string, string> = {}
  ): Promise<RenderResult> {
    // Limpiar path
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    try {
      // Convertir path a opciones del renderizador dinámico
      const options = this.pathToRenderOptions(cleanPath);

      // Usar el renderizador dinámico
      return await this.dynamicRenderer.render(domain, options, searchParams);
    } catch (error) {
      return this.handleRenderError(error, domain, cleanPath);
    }
  }

  /**
   * Maneja errores de renderizado de forma centralizada
   */
  private async handleRenderError(error: unknown, domain: string, path: string): Promise<RenderResult> {
    logger.error(`Error rendering page ${path} for domain ${domain}`, error, 'StoreRendererFactory');

    // Si es un error tipado de plantilla, usarlo directamente
    if (error && typeof error === 'object' && 'type' in error) {
      const templateError = error as any;
      try {
        return await this.dynamicRenderer.renderError(templateError, domain, path);
      } catch (renderError) {
        logger.error(
          'Failed to render error page, falling back to throwing error',
          renderError,
          'StoreRendererFactory'
        );
        throw templateError;
      }
    }

    // Crear error genérico para otros casos
    const errorMessage = error instanceof Error ? error.message : String(error);
    const genericError = {
      type: 'RENDER_ERROR' as const,
      message: `Failed to render page: ${errorMessage}`,
      statusCode: 500,
    };

    try {
      return await this.dynamicRenderer.renderError(genericError, domain, path);
    } catch (renderError) {
      logger.error('Failed to render error page for generic error', renderError, 'StoreRendererFactory');
      throw genericError;
    }
  }

  /**
   * Convierte un path a opciones usando matchers declarativos
   */
  private pathToRenderOptions(path: string): PageRenderOptions {
    // Buscar primer matcher que coincida
    for (const { pattern, handler } of routeMatchers) {
      const match = path.match(pattern);
      if (match) {
        return handler(match);
      }
    }

    // Fallback para paths no reconocidos
    return { pageType: '404' };
  }

  /**
   * Verifica si una tienda tiene configuración completa para renderizado
   * @param domain - Dominio de la tienda
   * @returns True si la tienda puede ser renderizada
   */
  public async canRenderStore(domain: string): Promise<boolean> {
    try {
      // Intentar renderizar homepage para verificar configuración
      await this.dynamicRenderer.render(domain, { pageType: 'index' });
      return true;
    } catch (error) {
      logger.warn(`Store ${domain} cannot be rendered`, error, 'StoreRendererFactory');
      return false;
    }
  }
}

// Exportar instancia singleton
export const storeRenderer = new StoreRendererFactory();

// Exportar tipos para uso externo
export { DynamicPageRenderer } from '@/renderer-engine/renderers/dynamic-page-renderer';
export type { RenderResult } from '@/renderer-engine/types';

// Exportar servicios para uso avanzado
export { liquidEngine } from '@/renderer-engine/liquid/engine';
export { domainResolver } from '@/renderer-engine/services/core/domain-resolver';
export { linkListService } from '@/renderer-engine/services/core/navigation-service';
export { errorRenderer } from '@/renderer-engine/services/errors/error-renderer';
export { dataFetcher } from '@/renderer-engine/services/fetchers/data-fetcher';
export { navigationFetcher } from '@/renderer-engine/services/fetchers/navigation-fetcher';
export { templateLoader } from '@/renderer-engine/services/templates/template-loader';

// Exportar nuevos servicios dinámicos
export { dynamicDataLoader } from '@/renderer-engine/services/page/dynamic-data-loader';
export { templateAnalyzer } from '@/renderer-engine/services/templates/template-analyzer';

// Exportar tipos del sistema dinámico
export type { DynamicLoadResult } from '@/renderer-engine/services/page/dynamic-data-loader';
export type {
  DataLoadOptions,
  DataRequirement,
  TemplateAnalysis,
} from '@/renderer-engine/services/templates/template-analyzer';
