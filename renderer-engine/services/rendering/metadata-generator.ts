import type { RenderResult, OpenGraphData, SchemaData } from '@/renderer-engine/types'

export class MetadataGenerator {
  /**
   * Genera metadata SEO para la homepage
   */
  public generateMetadata(
    store: any,
    domain: string,
    pageTitle?: string
  ): RenderResult['metadata'] {
    // Si se proporciona un título de página específico, usarlo con el nombre de la tienda
    const title = pageTitle
      ? `${pageTitle} | ${store.storeName}`
      : `${store.storeName} - Tienda Online`

    const description =
      store.storeDescription ||
      `Descubre los mejores productos en ${store.storeName}. Compra online con envío seguro.`
    const url = `https://${domain}`
    const image = store.storeLogo || store.storeBanner

    const openGraph: OpenGraphData = {
      title,
      description,
      url,
      type: 'website',
      image,
      site_name: store.storeName,
    }

    const schema: SchemaData = {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: store.storeName,
      description,
      url,
      logo: image,
      image,
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
      icons: image,
      keywords: ['ecommerce', 'tienda online', store.storeName, 'compras online'],
    }
  }

  /**
   * Genera el contenido para el <head> incluyendo favicon y meta tags
   */
  public generateHeadContent(store: any): string {
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

      // Generar una sola etiqueta de favicon con múltiples atributos
      headContent.push(
        `<link 
          rel="icon" 
          type="${mimeType}" 
          href="${faviconUrl}" 
          sizes="16x16 32x32 48x48 180x180"
        >`
      )
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

export const metadataGenerator = new MetadataGenerator()
