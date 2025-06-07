import { HomepageRenderer } from './renderers/homepage'
import { ProductRenderer } from './renderers/product'
import type { RenderResult } from './types'

/**
 * Factory principal del sistema de renderizado de tiendas
 * Combina todos los renderizadores específicos y expone una API unificada
 */
export class StoreRendererFactory {
  private homepageRenderer: HomepageRenderer
  private productRenderer: ProductRenderer

  constructor() {
    this.homepageRenderer = new HomepageRenderer()
    this.productRenderer = new ProductRenderer()
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
      // Determinar tipo de página basado en el path
      const pageType = this.determinePageType(cleanPath)

      switch (pageType.type) {
        case 'homepage':
          return await this.homepageRenderer.render(domain)

        case 'product':
          if (!pageType.handle) {
            throw new Error('Product handle is required for product pages')
          }
          return await this.productRenderer.render(domain, pageType.handle)

        case 'collection':
          // TODO: Implementar CollectionRenderer
          throw new Error('Collection pages not yet implemented')

        case 'page':
          // TODO: Implementar PageRenderer (páginas estáticas)
          throw new Error('Static pages not yet implemented')

        default:
          throw new Error(`Unknown page type: ${pageType.type}`)
      }
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
   * Determina el tipo de página basado en el path
   */
  private determinePageType(path: string): {
    type: 'homepage' | 'product' | 'collection' | 'page'
    handle?: string
  } {
    // Homepage
    if (path === '/') {
      return { type: 'homepage' }
    }

    // Producto: /products/mi-producto
    const productMatch = path.match(/^\/products\/([^\/]+)$/)
    if (productMatch) {
      return {
        type: 'product',
        handle: productMatch[1],
      }
    }

    // Colección: /collections/mi-coleccion
    const collectionMatch = path.match(/^\/collections\/([^\/]+)$/)
    if (collectionMatch) {
      return {
        type: 'collection',
        handle: collectionMatch[1],
      }
    }

    // Página estática: /pages/mi-pagina
    const pageMatch = path.match(/^\/pages\/([^\/]+)$/)
    if (pageMatch) {
      return {
        type: 'page',
        handle: pageMatch[1],
      }
    }

    // Fallback a homepage para paths no reconocidos
    return { type: 'homepage' }
  }

  /**
   * Verifica si una tienda tiene configuración completa para renderizado
   * @param domain - Dominio de la tienda
   * @returns True si la tienda puede ser renderizada
   */
  public async canRenderStore(domain: string): Promise<boolean> {
    try {
      // Intentar renderizar homepage para verificar configuración
      await this.homepageRenderer.render(domain)
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
export type { RenderResult } from './types'
export { HomepageRenderer } from './renderers/homepage'
export { ProductRenderer } from './renderers/product'

// Exportar servicios para uso avanzado
export { domainResolver } from './services/domain-resolver'
export { templateLoader } from './services/template-loader'
export { dataFetcher } from './services/data-fetcher'
export { liquidEngine } from './liquid/engine'
