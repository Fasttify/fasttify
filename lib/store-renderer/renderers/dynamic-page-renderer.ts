import { domainResolver } from '@/lib/store-renderer/services/core/domain-resolver'
import { templateLoader } from '@/lib/store-renderer/services/templates/template-loader'
import { dataFetcher } from '@/lib/store-renderer/services/fetchers/data-fetcher'
import { liquidEngine } from '@/lib/store-renderer/liquid/engine'
import { contextBuilder } from '@/lib/store-renderer/services/rendering/context-builder'
import { metadataGenerator } from '@/lib/store-renderer/services/rendering/metadata-generator'
import { sectionRenderer } from '@/lib/store-renderer/services/rendering/section-renderer'
import { errorRenderer } from '@/lib/store-renderer/services/errors/error-renderer'
import { pageConfig } from '@/lib/store-renderer/services/page/page-config'
import { pageDataLoader } from '@/lib/store-renderer/services/page/page-data-loader'
import type { RenderResult, ShopContext, TemplateError } from '@/lib/store-renderer/types'
import type { PageRenderOptions } from '@/lib/store-renderer/types/template'

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
      liquidEngine.assetCollector.clear()

      // 2. Verificar que la tienda tenga plantillas
      await this.ensureTemplatesExist(store.storeId)

      // 3. Cargar datos y plantillas en paralelo
      const [layout, pageData, storeTemplate] = await Promise.all([
        templateLoader.loadMainLayout(store.storeId),
        pageDataLoader.load(store.storeId, options),
        dataFetcher.getStoreTemplateData(store.storeId),
      ])

      // 4. Crear contexto y renderizar contenido de la página
      const context = this.buildInitialContext(store, pageData, storeTemplate)
      const renderedContent = await this.renderPageContent(
        store.storeId,
        options,
        context,
        storeTemplate
      )

      // 5. Pre-cargar secciones del layout y renderizar layout completo
      await this.preloadLayoutSections(store.storeId, layout, context, storeTemplate)
      context.content_for_layout = renderedContent
      context.content_for_header = metadataGenerator.generateHeadContent(store)

      const html = await liquidEngine.render(
        layout,
        context,
        `${options.pageType}_${store.storeId}`
      )
      const htmlWithAssets = this.injectAssets(html, liquidEngine.assetCollector)

      // 6. Generar metadata y clave de caché
      const metadata = metadataGenerator.generateMetadata(store, domain)
      const cacheKey = this.generateCacheKey(store.storeId, options)

      return {
        html: htmlWithAssets,
        metadata,
        cacheKey,
        cacheTTL: pageConfig.getCacheTTL(options.pageType),
      }
    } catch (error) {
      console.error(`Error rendering ${options.pageType} page for domain ${domain}:`, error)
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw this.createTemplateError(
        'RENDER_ERROR',
        `Failed to render ${options.pageType} page: ${errorMessage}`
      )
    }
  }

  private async ensureTemplatesExist(storeId: string): Promise<void> {
    const hasTemplates = await templateLoader.hasTemplates(storeId)
    if (!hasTemplates) {
      throw this.createTemplateError(
        'TEMPLATE_NOT_FOUND',
        `No templates found for store: ${storeId}`
      )
    }
  }

  private buildInitialContext(store: any, pageData: any, storeTemplate: any): any {
    const context = contextBuilder.createRenderContext(
      store,
      pageData.featuredProducts || [],
      pageData.collections || [],
      storeTemplate
    )
    Object.assign(context, pageData.contextData)
    return context
  }

  private async renderPageContent(
    storeId: string,
    options: PageRenderOptions,
    context: any,
    storeTemplate: any
  ): Promise<string> {
    const templatePath = pageConfig.getTemplatePath(options.pageType)
    const pageTemplate = await templateLoader.loadTemplate(storeId, templatePath)

    if (templatePath.endsWith('.json')) {
      const templateConfig = JSON.parse(
        pageTemplate.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1')
      )
      return await this.renderSectionsFromConfig(templateConfig, storeId, context, storeTemplate)
    } else {
      return await liquidEngine.render(pageTemplate, context, `${options.pageType}_${storeId}`)
    }
  }

  private async preloadLayoutSections(
    storeId: string,
    layout: string,
    context: any,
    storeTemplate: any
  ): Promise<void> {
    const layoutSections = sectionRenderer.extractSectionNamesFromLayout(layout)
    const preloadedSections: Record<string, string> = {}

    if (layoutSections.length > 0) {
      const sectionPromises = layoutSections.map(async (sectionName: string) => {
        const sectionContent = await sectionRenderer.loadSectionSafely(
          storeId,
          sectionName,
          context,
          storeTemplate
        )
        return { name: sectionName, content: sectionContent }
      })
      const sectionResults = await Promise.all(sectionPromises)
      sectionResults.forEach(({ name, content }) => {
        preloadedSections[name] = content
      })
    }
    context.preloaded_sections = preloadedSections
  }

  private injectAssets(html: string, assetCollector: any): string {
    let finalHtml = html
    const css = assetCollector.getCombinedCss()
    const js = assetCollector.getCombinedJs()

    if (css) {
      const styleTag = `<style data-fasttify-assets="true">${css}</style>`
      finalHtml = finalHtml.includes('</head>')
        ? finalHtml.replace('</head>', `${styleTag}</head>`)
        : finalHtml + styleTag
    }

    if (js) {
      const scriptTag = `<script data-fasttify-assets="true">${js}</script>`
      finalHtml = finalHtml.includes('</body>')
        ? finalHtml.replace('</body>', `${scriptTag}</body>`)
        : finalHtml + scriptTag
    }
    return finalHtml
  }

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

  private generateCacheKey(storeId: string, options: PageRenderOptions): string {
    const { pageType, handle, productId, collectionId } = options
    const identifier = handle || productId || collectionId || 'default'
    return `${pageType}_${storeId}_${identifier}_${Date.now()}`
  }

  private createTemplateError(type: TemplateError['type'], message: string): TemplateError {
    return {
      type,
      message,
      statusCode: type === 'TEMPLATE_NOT_FOUND' ? 404 : 500,
    }
  }

  public async renderError(
    error: TemplateError,
    domain: string,
    path?: string
  ): Promise<RenderResult> {
    try {
      let store: ShopContext | undefined = undefined
      if (error.type !== 'STORE_NOT_FOUND') {
        try {
          store = (await domainResolver.resolveStoreByDomain(domain)) as unknown as ShopContext
        } catch {
          // Continue without store info if it fails
        }
      }
      return await errorRenderer.renderError(error, { domain, path, store })
    } catch (renderError) {
      console.error('Critical error in renderError:', renderError)
      // Fallback to a plain text error response
      throw error
    }
  }
}

export const dynamicPageRenderer = new DynamicPageRenderer()
