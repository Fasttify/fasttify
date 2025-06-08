import { domainResolver } from '../services/core/domain-resolver'
import { templateLoader } from '../services/templates/template-loader'
import { dataFetcher } from '../services/fetchers/data-fetcher'
import { liquidEngine } from '../liquid/engine'
import type {
  RenderResult,
  RenderContext,
  ShopContext,
  PageContext,
  ProductContext,
  OpenGraphData,
  SchemaData,
  TemplateError,
} from '../types'

export class ProductRenderer {
  /**
   * Renderiza una página de producto
   * @param domain - Dominio completo de la tienda
   * @param productHandle - Handle SEO del producto (slug)
   * @returns Resultado completo del renderizado con metadata SEO
   */
  public async render(domain: string, productHandle: string): Promise<RenderResult> {
    try {
      // 1. Resolver dominio a tienda
      const store = await domainResolver.resolveStoreByDomain(domain)

      // 2. Buscar producto por handle o ID
      const product = await this.findProductByHandle(store.storeId, productHandle)
      if (!product) {
        throw this.createTemplateError('DATA_ERROR', `Product not found: ${productHandle}`, 404)
      }

      // 3. Verificar que la tienda tenga plantillas
      const hasTemplates = await templateLoader.hasTemplates(store.storeId)
      if (!hasTemplates) {
        throw this.createTemplateError(
          'TEMPLATE_NOT_FOUND',
          `No templates found for store: ${store.storeId}`
        )
      }

      // 4. Cargar layout principal y productos relacionados
      const [layout, relatedProducts] = await Promise.all([
        templateLoader.loadMainLayout(store.storeId),
        dataFetcher.getFeaturedProducts(store.storeId, 4), // Productos relacionados
      ])

      // 5. Crear contexto para las plantillas Liquid
      const context = this.createRenderContext(store, product, relatedProducts)

      // 6. Renderizar con LiquidJS
      const html = await liquidEngine.render(layout, context, `product_${store.storeId}`)

      // 7. Generar metadata SEO
      const metadata = this.generateMetadata(store, product, domain)

      // 8. Crear clave de caché
      const cacheKey = `product_${store.storeId}_${product.id}_${Date.now()}`

      return {
        html,
        metadata,
        cacheKey,
        cacheTTL: 15 * 60 * 1000, // 15 minutos (productos cambian más frecuentemente)
      }
    } catch (error) {
      console.error(`Error rendering product ${productHandle} for domain ${domain}:`, error)

      if (error instanceof Error && 'type' in error) {
        throw error // Re-lanzar errores tipados
      }

      throw this.createTemplateError('RENDER_ERROR', `Failed to render product: ${error}`)
    }
  }

  /**
   * Busca un producto por handle (slug SEO-friendly)
   * Como no tenemos índice por handle, buscamos todos los productos y filtramos
   * TODO: Optimizar con índice por handle en el futuro
   */
  private async findProductByHandle(
    storeId: string,
    handle: string
  ): Promise<ProductContext | null> {
    try {
      // Si el handle parece ser un ID, intentar búsqueda directa
      if (handle.match(/^[a-zA-Z0-9-]{8,}$/)) {
        const product = await dataFetcher.getProduct(storeId, handle)
        if (product) return product
      }

      // Buscar en todos los productos (con paginación)
      const { products } = await dataFetcher.getStoreProducts(storeId, { limit: 50 })

      // Buscar por handle exacto
      const product = products.find(p => p.handle === handle)
      if (product) return product

      // Buscar por título similar (fallback)
      const titleMatch = products.find(p => this.createHandle(p.title) === handle)

      return titleMatch || null
    } catch (error) {
      console.error(`Error finding product by handle ${handle}:`, error)
      return null
    }
  }

  /**
   * Crea el contexto completo para el renderizado de Liquid
   */
  private createRenderContext(
    store: any,
    product: ProductContext,
    relatedProducts: ProductContext[]
  ): RenderContext {
    // Crear contexto de la tienda
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
      title: `${product.title} | ${store.storeName}`,
      url: product.url,
      template: 'product',
      handle: product.handle,
    }

    return {
      shop,
      store: shop, // Alias para compatibilidad
      page,
      page_title: `${product.title} | ${store.storeName}`,
      page_description:
        product.description || `${product.title} - Disponible en ${store.storeName}`,
      product,
      products: relatedProducts, // Productos relacionados
      collections: [], // No hay colecciones en la página de producto
    }
  }

  /**
   * Genera metadata SEO para la página de producto
   */
  private generateMetadata(
    store: any,
    product: ProductContext,
    domain: string
  ): RenderResult['metadata'] {
    const title = `${product.title} | ${store.storeName}`
    const description =
      product.description ||
      `${product.title} - ${product.price} COP. Disponible en ${store.storeName}. ¡Compra ahora!`
    const url = `https://${domain}${product.url}`
    const image = product.images[0]?.url || store.storeLogo

    const openGraph: OpenGraphData = {
      title,
      description,
      url,
      type: 'product',
      image,
      site_name: store.storeName,
    }

    const schema: SchemaData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description: product.description,
      url,
      image: product.images.map(img => img.url),
      brand: {
        '@type': 'Brand',
        name: store.storeName,
      },
      offers: {
        '@type': 'Offer',
        price: product.price.replace(/[.,\s]/g, ''), // Limpiar formato para schema
        priceCurrency: store.storeCurrency || 'COP',
        availability: product.available
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: store.storeName,
        },
      },
      sku: product.variants[0]?.sku || product.id,
      productID: product.id,
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
   * Crea un handle SEO-friendly a partir de un texto
   */
  private createHandle(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[áàäâã]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöôõ]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  /**
   * Crea un error de plantilla tipado
   */
  private createTemplateError(
    type: TemplateError['type'],
    message: string,
    statusCode?: number
  ): TemplateError {
    return {
      type,
      message,
      statusCode: statusCode || (type === 'TEMPLATE_NOT_FOUND' ? 404 : 500),
    }
  }
}
