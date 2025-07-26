import { pathToRenderOptions } from '@/renderer-engine/config/route-matchers';
import { logger } from '@/renderer-engine/lib/logger';
import { DynamicPageRenderer } from '@/renderer-engine/renderers/dynamic-page-renderer';
import type { RenderResult } from '@/renderer-engine/types';

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
      const options = pathToRenderOptions(cleanPath);

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
