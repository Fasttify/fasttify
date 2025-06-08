import { domainResolver } from '../services/core/domain-resolver'
import { templateLoader } from '../services/templates/template-loader'
import { dataFetcher } from '../services/fetchers/data-fetcher'
import { liquidEngine } from '../liquid/engine'
import { contextBuilder } from '../services/rendering/context-builder'
import { metadataGenerator } from '../services/rendering/metadata-generator'
import { sectionRenderer } from '../services/rendering/section-renderer'
import type { RenderResult, TemplateError } from '../types'

export class HomepageRenderer {
  /**
   * Renderiza la homepage de una tienda
   * @param domain - Dominio completo de la tienda
   * @returns Resultado completo del renderizado con metadata SEO
   */
  public async render(domain: string): Promise<RenderResult> {
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

      // 3. Cargar layout principal, datos de template y secciones necesarias
      const [layout, featuredProducts, collections, storeTemplate] = await Promise.all([
        templateLoader.loadMainLayout(store.storeId),
        dataFetcher.getFeaturedProducts(store.storeId, 8),
        dataFetcher.getStoreCollections(store.storeId, { limit: 6 }),
        dataFetcher.getStoreTemplateData(store.storeId),
      ])

      // 4. Crear contexto para las plantillas Liquid
      const context = contextBuilder.createRenderContext(
        store,
        featuredProducts,
        collections.collections,
        storeTemplate
      )

      // 5. Cargar template index.json y renderizar secciones
      const indexTemplate = await templateLoader.loadTemplate(store.storeId, 'templates/index.json')
      const templateConfig = JSON.parse(indexTemplate)

      // Renderizar cada sección definida en el template
      const sectionPromises = templateConfig.order.map(async (sectionId: string) => {
        const sectionConfig = templateConfig.sections[sectionId]
        if (!sectionConfig) return ''

        try {
          const sectionContent = await templateLoader.loadTemplate(
            store.storeId,
            `sections/${sectionConfig.type}.liquid`
          )
          return await sectionRenderer.renderSectionWithSchema(
            sectionConfig.type,
            sectionContent,
            context
          )
        } catch (error) {
          console.warn(`Section ${sectionConfig.type} not found:`, error)
          return `<!-- Section '${sectionConfig.type}' not found -->`
        }
      })

      const renderedSections = await Promise.all(sectionPromises)
      const renderedContent = renderedSections.join('\n')

      // 6. Detectar y pre-cargar todas las secciones usadas en el layout
      const layoutSections = sectionRenderer.extractSectionNamesFromLayout(layout)
      const preloadedSections: Record<string, string> = {}

      if (layoutSections.length > 0) {
        const sectionPromises = layoutSections.map(async (sectionName: string) => {
          const sectionContent = await sectionRenderer.loadSectionSafely(
            store.storeId,
            sectionName,
            context
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
      const html = await liquidEngine.render(layout, context, `homepage_${store.storeId}`)

      // 8. Generar metadata SEO
      const metadata = metadataGenerator.generateMetadata(store, domain)

      // 9. Crear clave de caché
      const cacheKey = `homepage_${store.storeId}_${Date.now()}`

      return {
        html,
        metadata,
        cacheKey,
        cacheTTL: 30 * 60 * 1000, // 30 minutos
      }
    } catch (error) {
      console.error(`Error rendering homepage for domain ${domain}:`, error)
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')

      if (error instanceof Error && 'type' in error) {
        throw error // Re-lanzar errores tipados
      }

      const errorMessage = error instanceof Error ? error.message : String(error)
      throw this.createTemplateError('RENDER_ERROR', `Failed to render homepage: ${errorMessage}`)
    }
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
}
