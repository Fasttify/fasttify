import { DynamicPageRenderer } from '@/renderer-engine/renderers/dynamic-page-renderer'
import { logger } from '@/renderer-engine/lib/logger'
import type { RenderResult } from '@/renderer-engine/types'
import type { PageRenderOptions } from '@/renderer-engine/types/template'

/**
 * Factory principal del sistema de renderizado de tiendas
 * Usa el nuevo sistema dinámico unificado
 */
export class StoreRendererFactory {
  private dynamicRenderer: DynamicPageRenderer

  constructor() {
    this.dynamicRenderer = new DynamicPageRenderer()
  }

  /**
   * Renderiza cualquier página de una tienda basada en el path
   * @param domain - Dominio completo de la tienda
   * @param path - Path de la página (ej: '/', '/products/mi-producto', '/collections/zapatos?sort_by=price-ascending')
   * @returns Resultado del renderizado con metadata SEO
   */
  public async renderPage(domain: string, path: string = '/'): Promise<RenderResult> {
    // Limpiar path
    const cleanPath = path.startsWith('/') ? path : `/${path}`

    try {
      // Convertir path completo (incluyendo query parameters) a opciones del renderizador dinámico
      const options = this.pathToRenderOptions(cleanPath)

      // Usar el renderizador dinámico unificado
      return await this.dynamicRenderer.render(domain, options)
    } catch (error) {
      logger.error(
        `Error rendering page ${cleanPath} for domain ${domain}`,
        error,
        'StoreRendererFactory'
      )

      // Si es un error tipado de plantilla, renderizar página de error amigable
      if (error && typeof error === 'object' && 'type' in error) {
        const templateError = error as any
        try {
          return await this.dynamicRenderer.renderError(templateError, domain, cleanPath)
        } catch (renderError) {
          logger.error(
            'Failed to render error page, falling back to throwing error',
            renderError,
            'StoreRendererFactory'
          )
          throw error // Si falla el renderizado de error, lanzar el error original
        }
      }

      // Crear error genérico para otros casos y renderizar página de error
      const errorMessage = error instanceof Error ? error.message : String(error)
      const genericError = {
        type: 'RENDER_ERROR' as const,
        message: `Failed to render page: ${errorMessage}`,
        statusCode: 500,
      }

      try {
        return await this.dynamicRenderer.renderError(genericError, domain, cleanPath)
      } catch (renderError) {
        logger.error(
          'Failed to render error page for generic error',
          renderError,
          'StoreRendererFactory'
        )
        throw genericError
      }
    }
  }

  /**
   * Convierte un path a opciones del renderizador dinámico
   */
  private pathToRenderOptions(path: string): PageRenderOptions {
    // Separar path de query parameters
    const [pathname, queryString] = path.split('?', 2)
    const queryParams = new URLSearchParams(queryString || '')

    // Extraer parámetros comunes de query string
    const sortBy = queryParams.get('sort_by') || undefined
    const pageNumber = queryParams.get('page') ? parseInt(queryParams.get('page')!) : undefined
    const searchQuery = queryParams.get('q') || queryParams.get('query') || undefined

    // Homepage
    if (pathname === '/') {
      return { pageType: 'index', sortBy, pageNumber, searchQuery }
    }

    // Producto: /products/mi-producto
    const productMatch = pathname.match(/^\/products\/([^\/]+)$/)
    if (productMatch) {
      return {
        pageType: 'product',
        handle: productMatch[1],
        sortBy,
        pageNumber,
        searchQuery,
      }
    }

    // Colección: /collections/mi-coleccion
    const collectionMatch = pathname.match(/^\/collections\/([^\/]+)$/)
    if (collectionMatch) {
      return {
        pageType: 'collection',
        handle: collectionMatch[1],
        sortBy,
        pageNumber,
        searchQuery,
      }
    }

    // Página estática: /pages/mi-pagina
    const pageMatch = pathname.match(/^\/pages\/([^\/]+)$/)
    if (pageMatch) {
      return {
        pageType: 'page',
        handle: pageMatch[1],
        sortBy,
        pageNumber,
        searchQuery,
      }
    }

    // Blog: /blogs/mi-blog
    const blogMatch = pathname.match(/^\/blogs\/([^\/]+)$/)
    if (blogMatch) {
      return {
        pageType: 'blog',
        handle: blogMatch[1],
        sortBy,
        pageNumber,
        searchQuery,
      }
    }

    // Búsqueda: /search
    if (pathname === '/search') {
      return { pageType: 'search', sortBy, pageNumber, searchQuery }
    }

    // Cart: /cart
    if (pathname === '/cart') {
      return { pageType: 'cart', sortBy, pageNumber, searchQuery }
    }

    // 404: /404 (para pruebas)
    if (pathname === '/404') {
      return { pageType: '404', sortBy, pageNumber, searchQuery }
    }

    if (pathname === '/collection') {
      return { pageType: 'collection', sortBy, pageNumber, searchQuery }
    }

    // Fallback a 404 para paths no reconocidos
    return { pageType: '404', sortBy, pageNumber, searchQuery }
  }

  /**
   * Verifica si una tienda tiene configuración completa para renderizado
   * @param domain - Dominio de la tienda
   * @returns True si la tienda puede ser renderizada
   */
  public async canRenderStore(domain: string): Promise<boolean> {
    try {
      // Intentar renderizar homepage para verificar configuración
      await this.dynamicRenderer.render(domain, { pageType: 'index' })
      return true
    } catch (error) {
      logger.warn(`Store ${domain} cannot be rendered`, error, 'StoreRendererFactory')
      return false
    }
  }
}

// Exportar instancia singleton
export const storeRenderer = new StoreRendererFactory()

// Exportar tipos para uso externo
export type { RenderResult } from '@/renderer-engine/types'
export { DynamicPageRenderer } from '@/renderer-engine/renderers/dynamic-page-renderer'

// Exportar servicios para uso avanzado
export { domainResolver } from '@/renderer-engine/services/core/domain-resolver'
export { templateLoader } from '@/renderer-engine/services/templates/template-loader'
export { dataFetcher } from '@/renderer-engine/services/fetchers/data-fetcher'
export { navigationFetcher } from '@/renderer-engine/services/fetchers/navigation-fetcher'
export { linkListService } from '@/renderer-engine/services/core/linkList-service'
export { liquidEngine } from '@/renderer-engine/liquid/engine'
export { errorRenderer } from '@/renderer-engine/services/errors/error-renderer'
