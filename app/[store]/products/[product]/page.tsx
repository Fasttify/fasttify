import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { storeRenderer } from '@/lib/store-renderer'

interface ProductPageProps {
  params: Promise<{
    store: string
    product: string
  }>
  searchParams: Promise<{
    [key: string]: string | string[] | undefined
  }>
}

/**
 * Página de producto individual con SSR
 * Ruta: /[store]/products/[product]
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params
  const { store, product } = resolvedParams

  try {
    // Construir dominio y path
    const domain = `${store}.fasttify.com`
    const path = `/products/${product}`

    // Renderizar página de producto
    const result = await storeRenderer.renderPage(domain, path)

    return <div dangerouslySetInnerHTML={{ __html: result.html }} />
  } catch (error: any) {
    console.error(`Error rendering product page ${store}/products/${product}:`, error)

    // 404 para productos no encontrados
    if (error.type === 'DATA_ERROR' || error.statusCode === 404) {
      notFound()
    }

    // Re-lanzar otros errores para error boundary
    throw error
  }
}

/**
 * Genera metadata SEO específica para productos
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const { store, product } = resolvedParams

  try {
    const domain = `${store}.fasttify.com`
    const path = `/products/${product}`
    const result = await storeRenderer.renderPage(domain, path)

    const { metadata } = result

    // Metadata optimizada para productos (e-commerce)
    return {
      title: metadata.title,
      description: metadata.description,
      alternates: {
        canonical: metadata.canonical,
      },
      openGraph: metadata.openGraph
        ? {
            title: metadata.openGraph.title,
            description: metadata.openGraph.description,
            url: metadata.openGraph.url,
            type: 'website', // Para productos específicos
            images: metadata.openGraph.image
              ? [
                  {
                    url: metadata.openGraph.image,
                    alt: metadata.openGraph.title,
                  },
                ]
              : undefined,
            siteName: metadata.openGraph.site_name,
          }
        : undefined,
      twitter: metadata.openGraph
        ? {
            card: 'summary_large_image',
            title: metadata.openGraph.title,
            description: metadata.openGraph.description,
            images: metadata.openGraph.image ? [metadata.openGraph.image] : undefined,
          }
        : undefined,
      // Schema.org para productos
      other: metadata.schema
        ? {
            'application-ld+json': JSON.stringify(metadata.schema),
          }
        : undefined,
      // Keywords específicos para productos
      keywords: [product.replace(/-/g, ' '), store, 'comprar online', 'tienda', 'producto'].join(
        ', '
      ),
    }
  } catch (error) {
    console.error(`Error generating product metadata for ${store}/products/${product}:`, error)

    // Metadata de fallback
    const productName = product.replace(/-/g, ' ')
    return {
      title: `${productName} | ${store}`,
      description: `Compra ${productName} en ${store}. ¡Envío rápido y seguro!`,
      keywords: `${productName}, ${store}, comprar online`,
    }
  }
}

/**
 * Configurar ISR para productos
 * Los productos cambian con más frecuencia que las páginas principales
 */
export const revalidate = 900 // 15 minutos

/**
 * Generar parámetros estáticos para productos populares
 */
export async function generateStaticParams() {
  // TODO: Implementar generación de productos populares
  // Por ahora generar bajo demanda
  return []
}
