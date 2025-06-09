import {
  DynamicPageRenderer,
  type PageRenderOptions,
} from '@/lib/store-renderer/renderers/homepage'
import type { RenderResult } from '@/lib/store-renderer/types'

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

      // Re-lanzar errores de plantilla con su metadata
      if (error instanceof Error && 'type' in error) {
        throw error
      }

      // Crear error genérico para otros casos
      throw {
        type: 'RENDER_ERROR',
        message: `Failed to render page: ${error}`,
        statusCode: 500,
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
export type { RenderResult } from '@/lib/store-renderer/types'
export { DynamicPageRenderer } from '@/lib/store-renderer/renderers/homepage'

// Exportar servicios para uso avanzado
export { domainResolver } from '@/lib/store-renderer/services/core/domain-resolver'
export { templateLoader } from '@/lib/store-renderer/services/templates/template-loader'
export { dataFetcher } from '@/lib/store-renderer/services/fetchers/data-fetcher'
export { liquidEngine } from '@/lib/store-renderer/liquid/engine'
