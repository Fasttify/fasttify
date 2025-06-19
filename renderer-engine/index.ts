import { DynamicPageRenderer } from '@/renderer-engine/renderers/dynamic-page-renderer'
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
   * @param path - Path de la página (ej: '/', '/products/mi-producto')
   * @returns Resultado del renderizado con metadata SEO
   */
  public async renderPage(domain: string, path: string = '/'): Promise<RenderResult> {
    // Limpiar path
    const cleanPath = path.startsWith('/') ? path : `/${path}`

    try {
      // Convertir path a opciones del renderizador dinámico
      const options = this.pathToRenderOptions(cleanPath)

      // Usar el renderizador dinámico unificado
      return await this.dynamicRenderer.render(domain, options)
    } catch (error) {
      console.error(`Error rendering page ${cleanPath} for domain ${domain}:`, error)

      // Si es un error tipado de plantilla, renderizar página de error amigable
      if (error && typeof error === 'object' && 'type' in error) {
        const templateError = error as any
        try {
          return await this.dynamicRenderer.renderError(templateError, domain, cleanPath)
        } catch (renderError) {
          console.error('Failed to render error page, falling back to throwing error:', renderError)
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
        console.error('Failed to render error page for generic error:', renderError)
        throw genericError
      }
    }
  }

  /**
   * Convierte un path a opciones del renderizador dinámico
   */
  private pathToRenderOptions(path: string): PageRenderOptions {
    // Homepage
    if (path === '/') {
      return { pageType: 'index' }
    }

    // Producto: /products/mi-producto
    const productMatch = path.match(/^\/products\/([^\/]+)$/)
    if (productMatch) {
      return {
        pageType: 'product',
        handle: productMatch[1],
      }
    }

    // Colección: /collections/mi-coleccion
    const collectionMatch = path.match(/^\/collections\/([^\/]+)$/)
    if (collectionMatch) {
      return {
        pageType: 'collection',
        handle: collectionMatch[1],
      }
    }

    // Página estática: /pages/mi-pagina
    const pageMatch = path.match(/^\/pages\/([^\/]+)$/)
    if (pageMatch) {
      return {
        pageType: 'page',
        handle: pageMatch[1],
      }
    }

    // Blog: /blogs/mi-blog
    const blogMatch = path.match(/^\/blogs\/([^\/]+)$/)
    if (blogMatch) {
      return {
        pageType: 'blog',
        handle: blogMatch[1],
      }
    }

    // Búsqueda: /search
    if (path === '/search') {
      return { pageType: 'search' }
    }

    // Cart: /cart
    if (path === '/cart') {
      return { pageType: 'cart' }
    }

    // 404: /404 (para pruebas)
    if (path === '/404') {
      return { pageType: '404' }
    }

    if (path === '/collection') {
      return { pageType: 'collection' }
    }

    // Fallback a homepage para paths no reconocidos
    return { pageType: '404' }
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
      console.warn(`Store ${domain} cannot be rendered:`, error)
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
export { liquidEngine } from '@/renderer-engine/liquid/engine'
export { errorRenderer } from '@/renderer-engine/services/errors/error-renderer'
