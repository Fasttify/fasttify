import { domainResolver } from '@/lib/store-renderer/services/core/domain-resolver'
import { templateLoader } from '@/lib/store-renderer/services/templates/template-loader'
import { dataFetcher } from '@/lib/store-renderer/services/fetchers/data-fetcher'
import { liquidEngine } from '@/lib/store-renderer/liquid/engine'
import { contextBuilder } from '@/lib/store-renderer/services/rendering/context-builder'
import { metadataGenerator } from '@/lib/store-renderer/services/rendering/metadata-generator'
import { sectionRenderer } from '@/lib/store-renderer/services/rendering/section-renderer'
import { errorRenderer } from '@/lib/store-renderer/services/errors/error-renderer'
import type { RenderResult, ShopContext, TemplateError } from '@/lib/store-renderer/types'

export interface PageRenderOptions {
  pageType:
    | 'index'
    | 'product'
    | 'collection'
    | 'page'
    | 'blog'
    | 'article'
    | 'search'
    | 'cart'
    | '404'
  handle?: string // Para productos, colecciones, páginas específicas, etc.
  productId?: string // ID específico del producto
  collectionId?: string // ID específico de la colección
  searchQuery?: string // Para páginas de búsqueda
  pageNumber?: number // Para paginación
}

export class DynamicPageRenderer {
  /**
   * Renderiza cualquier página de una tienda dinámicamente
   * @param domain - Dominio completo de la tienda
   * @param options - Opciones de renderizado específicas para el tipo de página (opcional, por defecto homepage)
   * @returns Resultado completo del renderizado con metadata SEO
   */
  public async render(
    domain: string,
    options: PageRenderOptions = { pageType: 'index' }
  ): Promise<RenderResult> {
    try {
      // 1. Resolver dominio a tienda
      const store = await domainResolver.resolveStoreByDomain(domain)

      // 2. Verificar que la tienda tenga plantillas
      const hasTemplates = await templateLoader.hasTemplates(store.storeId)
      if (!hasTemplates) {
        throw this.createTemplateError(
          'TEMPLATE_NOT_FOUND',
          `No templates found for store: ${store.storeId}`
        )
      }

      // 3. Cargar layout principal y datos específicos según el tipo de página
      const [layout, pageData, storeTemplate] = await Promise.all([
        templateLoader.loadMainLayout(store.storeId),
        this.loadPageData(store.storeId, options),
        dataFetcher.getStoreTemplateData(store.storeId),
      ])

      // 4. Crear contexto para las plantillas Liquid
      const context = contextBuilder.createRenderContext(
        store,
        pageData.featuredProducts || [],
        pageData.collections || [],
        storeTemplate
      )

      // Agregar datos específicos de la página al contexto
      Object.assign(context, pageData.contextData)

      // 5. Cargar template específico y renderizar contenido
      const templatePath = this.getTemplatePath(options.pageType)
      const pageTemplate = await templateLoader.loadTemplate(store.storeId, templatePath)

      let renderedContent: string

      if (templatePath.endsWith('.json')) {
        // Template con configuración JSON (como index.json)
        const templateConfig = JSON.parse(pageTemplate)
        renderedContent = await this.renderSectionsFromConfig(
          templateConfig,
          store.storeId,
          context,
          storeTemplate
        )
      } else {
        // Template Liquid directo
        renderedContent = await liquidEngine.render(
          pageTemplate,
          context,
          `${options.pageType}_${store.storeId}`
        )
      }

      // 6. Detectar y pre-cargar todas las secciones usadas en el layout
      const layoutSections = sectionRenderer.extractSectionNamesFromLayout(layout)
      const preloadedSections: Record<string, string> = {}

      if (layoutSections.length > 0) {
        const sectionPromises = layoutSections.map(async (sectionName: string) => {
          const sectionContent = await sectionRenderer.loadSectionSafely(
            store.storeId,
            sectionName,
            context,
            storeTemplate
          )
          return { name: sectionName, content: sectionContent }
        })

        const sectionResults = await Promise.all(sectionPromises)
        sectionResults.forEach(({ name, content }: { name: string; content: string }) => {
          preloadedSections[name] = content
        })
      }

      // 7. Insertar contenido y secciones en el contexto
      context.content_for_layout = renderedContent
      context.content_for_header = metadataGenerator.generateHeadContent(store)
      context.preloaded_sections = preloadedSections

      // 8. Renderizar el layout completo
      const html = await liquidEngine.render(
        layout,
        context,
        `${options.pageType}_${store.storeId}`
      )

      // 9. Generar metadata SEO
      const metadata = metadataGenerator.generateMetadata(store, domain)

      // 10. Crear clave de caché
      const cacheKey = `${options.pageType}_${store.storeId}_${options.handle || options.productId || options.collectionId || 'default'}_${Date.now()}`

      return {
        html,
        metadata,
        cacheKey,
        cacheTTL: this.getCacheTTL(options.pageType),
      }
    } catch (error) {
      console.error(`Error rendering ${options.pageType} page for domain ${domain}:`, error)
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')

      if (error && typeof error === 'object' && 'type' in error) {
        throw error // Re-lanzar errores tipados
      }

      const errorMessage = error instanceof Error ? error.message : String(error)
      throw this.createTemplateError(
        'RENDER_ERROR',
        `Failed to render ${options.pageType} page: ${errorMessage}`
      )
    }
  }

  /**
   * Carga los datos específicos según el tipo de página usando solo métodos disponibles
   */
  private async loadPageData(storeId: string, options: PageRenderOptions) {
    const baseData = {
      featuredProducts: [],
      collections: [],
      contextData: {},
      metaData: {},
    }

    switch (options.pageType) {
      case 'index':
        const [featuredProducts, collections] = await Promise.all([
          dataFetcher.getFeaturedProducts(storeId, 8),
          dataFetcher.getStoreCollections(storeId, { limit: 6 }),
        ])
        return {
          ...baseData,
          featuredProducts,
          collections: collections.collections,
          contextData: {
            template: 'index',
            page_title: 'Home',
          },
        }

      case 'product':
        if (options.productId || options.handle) {
          // Si tenemos handle, primero necesitaríamos resolverlo a productId
          // Por ahora usamos el productId directamente si existe
          const productId = options.productId || options.handle!
          const product = await dataFetcher.getProduct(storeId, productId)
          if (product) {
            return {
              ...baseData,
              contextData: {
                template: 'product',
                product,
                page_title: product.name,
              },
            }
          }
        }
        return {
          ...baseData,
          contextData: {
            template: 'product',
            page_title: 'Product',
          },
        }

      case 'collection':
        // Caso 1: Tenemos collectionId directo
        if (options.collectionId) {
          const collection = await dataFetcher.getCollection(storeId, options.collectionId)
          if (collection) {
            return {
              ...baseData,
              contextData: {
                template: 'collection',
                collection,
                page_title: collection.title,
              },
            }
          }
        }

        // Caso 2: Tenemos handle, buscar colección por handle/slug
        if (options.handle) {
          // Buscar por todas las colecciones y encontrar por slug/handle
          const collectionsResponse = await dataFetcher.getStoreCollections(storeId, { limit: 100 })
          const collection = collectionsResponse.collections.find(
            c =>
              c.slug === options.handle ||
              c.title.toLowerCase().replace(/\s+/g, '-') === options.handle
          )

          if (collection) {
            return {
              ...baseData,
              contextData: {
                template: 'collection',
                collection,
                page_title: collection.title,
              },
            }
          }
        }

        // Caso 3: Sin parámetros específicos, mostrar página genérica
        return {
          ...baseData,
          contextData: {
            template: 'collection',
            page_title: 'Collection',
          },
        }

      case 'cart':
        return {
          ...baseData,
          contextData: {
            template: 'cart',
            page_title: 'Carrito de Compras',
            cart_items: [], // Se cargarían desde localStorage o sesión
          },
        }

      case '404':
        return {
          ...baseData,
          contextData: {
            template: '404',
            page_title: 'Página No Encontrada',
            error_message: 'La página que buscas no existe',
          },
        }

      default:
        return {
          ...baseData,
          contextData: {
            template: options.pageType,
            page_title: options.pageType.charAt(0).toUpperCase() + options.pageType.slice(1),
          },
        }
    }
  }

  /**
   * Obtiene la ruta del template según el tipo de página
   */
  private getTemplatePath(pageType: string): string {
    const templatePaths: Record<string, string> = {
      index: 'templates/index.json',
      product: 'templates/product.json',
      collection: 'templates/collection.json',
      page: 'templates/page.json',
      blog: 'templates/blog.json',
      article: 'templates/article.json',
      search: 'templates/search.json',
      cart: 'templates/cart.json',
      '404': 'templates/404.json',
    }

    return templatePaths[pageType] || `templates/${pageType}.liquid`
  }

  /**
   * Renderiza secciones desde una configuración JSON (reutilizada del código original)
   */
  private async renderSectionsFromConfig(
    templateConfig: any,
    storeId: string,
    context: any,
    storeTemplate: any
  ): Promise<string> {
    const sectionPromises = templateConfig.order.map(async (sectionId: string) => {
      const sectionConfig = templateConfig.sections[sectionId]
      if (!sectionConfig) return ''

      try {
        const sectionContent = await templateLoader.loadTemplate(
          storeId,
          `sections/${sectionConfig.type}.liquid`
        )
        return await sectionRenderer.renderSectionWithSchema(
          sectionConfig.type,
          sectionContent,
          context,
          storeTemplate
        )
      } catch (error) {
        console.warn(`Section ${sectionConfig.type} not found:`, error)
        return `<!-- Section '${sectionConfig.type}' not found -->`
      }
    })

    const renderedSections = await Promise.all(sectionPromises)
    return renderedSections.join('\n')
  }

  /**
   * Obtiene el TTL de caché según el tipo de página
   */
  private getCacheTTL(pageType: string): number {
    const cacheTTLs: Record<string, number> = {
      index: 30 * 60 * 1000, // 30 minutos
      product: 60 * 60 * 1000, // 1 hora
      collection: 45 * 60 * 1000, // 45 minutos
      page: 24 * 60 * 60 * 1000, // 24 horas
      blog: 2 * 60 * 60 * 1000, // 2 horas
      article: 4 * 60 * 60 * 1000, // 4 horas
      search: 10 * 60 * 1000, // 10 minutos
      cart: 0, // Sin caché para cart (siempre fresco)
      '404': 24 * 60 * 60 * 1000, // 24 horas
    }

    return cacheTTLs[pageType] || 30 * 60 * 1000
  }

  /**
   * Crea un error de plantilla tipado
   */
  private createTemplateError(type: TemplateError['type'], message: string): TemplateError {
    return {
      type,
      message,
      statusCode: type === 'TEMPLATE_NOT_FOUND' ? 404 : 500,
    }
  }

  /**
   * Renderiza una página de error amigable
   */
  public async renderError(
    error: TemplateError,
    domain: string,
    path?: string
  ): Promise<RenderResult> {
    try {
      // Intentar obtener información de la tienda si es posible
      let store = undefined
      try {
        if (error.type !== 'STORE_NOT_FOUND') {
          store = await domainResolver.resolveStoreByDomain(domain)
        }
      } catch {
        // Si no se puede obtener la tienda, continuar sin ella
      }

      return await errorRenderer.renderError(error, {
        domain,
        path,
        store: store as unknown as ShopContext,
      })
    } catch (renderError) {
      console.error('Error rendering error page:', renderError)
      throw error
    }
  }
}

// Exportar una instancia para compatibilidad
export const dynamicPageRenderer = new DynamicPageRenderer()
