import { domainResolver } from '../services/domain-resolver'
import { templateLoader } from '../services/template-loader'
import { dataFetcher } from '../services/data-fetcher'
import { liquidEngine } from '../liquid/engine'
import type {
  RenderResult,
  RenderContext,
  ShopContext,
  PageContext,
  OpenGraphData,
  SchemaData,
  TemplateError,
} from '../types'

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

      // 3. Cargar layout principal y secciones necesarias
      const [layout, featuredProducts, collections] = await Promise.all([
        templateLoader.loadMainLayout(store.storeId),
        dataFetcher.getFeaturedProducts(store.storeId, 8),
        dataFetcher.getStoreCollections(store.storeId, { limit: 6 }),
      ])

      // 4. Crear contexto para las plantillas Liquid
      const context = this.createRenderContext(store, featuredProducts, collections.collections)

      // 5. Generar contenido de homepage usando nuestras secciones reales
      const homepageContent = await this.generateHomepageContent(store.storeId, context)

      // 6. Insertar contenido en el layout
      context.content_for_layout = homepageContent
      context.content_for_header = this.generateHeadContent(store)

      // 7. Renderizar el layout completo
      const html = await liquidEngine.render(layout, context, `homepage_${store.storeId}`)

      // 8. Generar metadata SEO
      const metadata = this.generateMetadata(store, domain)

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
   * Crea el contexto completo para el renderizado de Liquid
   */
  private createRenderContext(
    store: any,
    featuredProducts: any[],
    collections: any[]
  ): RenderContext {
    // Crear contexto de la tienda (como 'shop' para compatibilidad)
    const shop: ShopContext = {
      name: store.storeName,
      description: store.storeDescription || `Tienda online de ${store.storeName}`,
      domain: store.customDomain,
      url: `https://${store.customDomain}`,
      currency: store.storeCurrency || 'COP',
      money_format: store.storeCurrency === 'USD' ? '${{amount}}' : '${{amount}}',
      email: store.contactEmail,
      phone: store.contactPhone?.toString(),
      address: store.storeAdress,
      logo: store.storeLogo,
      banner: store.storeBanner,
      theme: store.storeTheme || 'modern',
      favicon: store.storeFavicon,
    }

    // Crear contexto de la página
    const page: PageContext = {
      title: store.storeName,
      url: '/',
      template: 'index',
      handle: 'homepage',
    }

    // Crear contexto que incluye tanto 'shop' como 'store' para compatibilidad
    // y variables de página al nivel raíz como espera el template
    return {
      shop,
      store: shop, // Alias para compatibilidad con templates que usan {{ store.name }}
      page,
      page_title: store.storeName, // Variable al nivel raíz para {{ page_title }}
      page_description: store.storeDescription || `Tienda online de ${store.storeName}`,
      products: featuredProducts,
      collections,
    }
  }

  /**
   * Genera metadata SEO para la homepage
   */
  private generateMetadata(store: any, domain: string): RenderResult['metadata'] {
    const title = `${store.storeName} - Tienda Online`
    const description =
      store.storeDescription ||
      `Descubre los mejores productos en ${store.storeName}. Compra online con envío seguro.`
    const url = `https://${domain}`

    const openGraph: OpenGraphData = {
      title,
      description,
      url,
      type: 'website',
      image: store.storeLogo || store.storeBanner,
      site_name: store.storeName,
    }

    const schema: SchemaData = {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: store.storeName,
      description,
      url,
      logo: store.storeLogo,
      image: store.storeBanner,
      email: store.contactEmail,
      telephone: store.contactPhone,
      address: store.storeAdress
        ? {
            '@type': 'PostalAddress',
            addressLocality: store.storeAdress,
          }
        : undefined,
      currenciesAccepted: store.storeCurrency || 'COP',
      paymentAccepted: ['Credit Card', 'Debit Card'],
    }

    return {
      title,
      description,
      canonical: url,
      openGraph,
      schema,
    }
  }

  /**
   * Genera el contenido de la homepage renderizando las secciones reales
   */
  private async generateHomepageContent(storeId: string, context: RenderContext): Promise<string> {
    try {
      // Cargar secciones reales desde nuestros templates
      const [header, heroBanner, featuredProducts, collectionList, footer] = await Promise.all([
        templateLoader.loadTemplate(storeId, 'sections/header.liquid'),
        templateLoader.loadTemplate(storeId, 'sections/hero-banner.liquid'),
        templateLoader.loadTemplate(storeId, 'sections/featured-products.liquid'),
        templateLoader.loadTemplate(storeId, 'sections/collection-list.liquid'),
        templateLoader.loadTemplate(storeId, 'sections/footer.liquid'),
      ])

      // Renderizar cada sección con su contexto específico y extraer settings del schema
      const renderedSections = await Promise.all([
        this.renderSectionWithSchema('header', header, context),
        this.renderSectionWithSchema('hero-banner', heroBanner, context),
        this.renderSectionWithSchema('featured-products', featuredProducts, context),
        this.renderSectionWithSchema('collection-list', collectionList, context),
        this.renderSectionWithSchema('footer', footer, context),
      ])

      // Combinar todas las secciones
      return renderedSections.join('\n')
    } catch (error) {
      console.error('Error generating homepage content for store', storeId, ':', error)
      return ''
    }
  }

  /**
   * Renderiza una sección extrayendo primero los settings del schema
   */
  private async renderSectionWithSchema(
    sectionName: string,
    templateContent: string,
    baseContext: RenderContext
  ): Promise<string> {
    try {
      // Crear contexto específico para esta sección
      const sectionContext = {
        ...baseContext,
        section: {
          id: sectionName,
          settings: this.extractSchemaSettings(templateContent),
          blocks: this.extractSchemaBlocks(templateContent),
        },
      }

      // Renderizar la sección con el contexto enriquecido
      return await liquidEngine.render(templateContent, sectionContext, `section_${sectionName}`)
    } catch (error) {
      console.error(`Error rendering section ${sectionName}:`, error)
      return `<!-- Error rendering ${sectionName} section -->`
    }
  }

  /**
   * Extrae los settings del schema de un template usando expresiones regulares
   */
  private extractSchemaSettings(templateContent: string): Record<string, any> {
    try {
      // Buscar el bloque {% schema %}...{% endschema %}
      const schemaRegex = /{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/i
      const match = templateContent.match(schemaRegex)

      if (!match || !match[1]) {
        return {}
      }

      // Parsear el JSON del schema
      const schemaJSON = JSON.parse(match[1].trim())

      if (!schemaJSON.settings) {
        return {}
      }

      // Convertir settings a valores por defecto
      const settings: Record<string, any> = {}

      for (const setting of schemaJSON.settings) {
        if (setting.id) {
          settings[setting.id] = setting.default || this.getDefaultValueForType(setting.type)
        }
      }

      return settings
    } catch (error) {
      console.warn('Error extracting schema settings:', error)
      return {}
    }
  }

  /**
   * Extrae los blocks del schema
   */
  private extractSchemaBlocks(templateContent: string): any[] {
    try {
      const schemaRegex = /{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/i
      const match = templateContent.match(schemaRegex)

      if (!match || !match[1]) {
        return []
      }

      const schemaJSON = JSON.parse(match[1].trim())
      return schemaJSON.blocks || []
    } catch (error) {
      console.warn('Error extracting schema blocks:', error)
      return []
    }
  }

  /**
   * Obtiene valores por defecto basados en el tipo de setting
   */
  private getDefaultValueForType(type: string): any {
    switch (type) {
      case 'text':
      case 'textarea':
      case 'richtext':
      case 'html':
      case 'url':
        return ''
      case 'number':
      case 'range':
        return 0
      case 'checkbox':
        return false
      case 'color':
        return '#000000'
      case 'select':
      case 'radio':
        return ''
      case 'image_picker':
      case 'video':
      case 'file':
        return null
      default:
        return ''
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

  /**
   * Genera el contenido para el <head> incluyendo favicon y meta tags
   */
  private generateHeadContent(store: any): string {
    const headContent = []

    // Favicon con soporte para diferentes tipos
    if (store.storeFavicon) {
      const faviconUrl = store.storeFavicon
      let mimeType = 'image/x-icon'

      // Detectar tipo de archivo por extensión
      if (faviconUrl.includes('.png')) {
        mimeType = 'image/png'
      } else if (faviconUrl.includes('.svg')) {
        mimeType = 'image/svg+xml'
      } else if (faviconUrl.includes('.jpg') || faviconUrl.includes('.jpeg')) {
        mimeType = 'image/jpeg'
      }

      headContent.push(`<link rel="icon" type="${mimeType}" href="${faviconUrl}">`)
      headContent.push(`<link rel="shortcut icon" type="${mimeType}" href="${faviconUrl}">`)

      // Para PNG, agregar también tamaños comunes
      if (mimeType === 'image/png') {
        headContent.push(`<link rel="apple-touch-icon" sizes="180x180" href="${faviconUrl}">`)
        headContent.push(`<link rel="icon" type="image/png" sizes="32x32" href="${faviconUrl}">`)
        headContent.push(`<link rel="icon" type="image/png" sizes="16x16" href="${faviconUrl}">`)
      }
    }

    // Open Graph meta tags adicionales
    if (store.storeBanner) {
      headContent.push(`<meta property="og:image" content="${store.storeBanner}">`)
    }

    // Meta tags adicionales para SEO
    headContent.push(`<meta name="author" content="${store.storeName}">`)
    headContent.push(`<meta name="robots" content="index, follow">`)

    // Canonical URL
    if (store.customDomain) {
      headContent.push(`<link rel="canonical" href="https://${store.customDomain}">`)
    }

    return headContent.join('\n    ')
  }
}
