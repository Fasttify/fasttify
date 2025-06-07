import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { storeRenderer } from '@/lib/store-renderer'

interface StorePageProps {
  params: Promise<{
    store: string
  }>
  searchParams: Promise<{
    path?: string
  }>
}

/**
 * Página principal de tienda con SSR
 * Maneja todas las rutas de tienda: /, /products/slug, /collections/slug
 */
export default async function StorePage({ params, searchParams }: StorePageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const { store } = resolvedParams
  const path = resolvedSearchParams.path || '/'

  try {
    // Resolver dominio completo (el middleware ya reescribió la URL)
    const domain = `${store}.fasttify.com`

    // Renderizar página usando el sistema
    const result = await storeRenderer.renderPage(domain, path)

    // Retornar HTML renderizado como componente dangerouslySetInnerHTML
    // Esto permite SSR completo con SEO optimizado
    return <div dangerouslySetInnerHTML={{ __html: result.html }} />
  } catch (error: any) {
    console.error(`Error rendering store page ${store}${path}:`, error)

    // Mostrar 404 para tiendas no encontradas
    if (error.type === 'STORE_NOT_FOUND' || error.statusCode === 404) {
      notFound()
    }

    // Para otros errores, mostrar página de error
    throw error
  }
}

/**
 * Genera metadata SEO para la página
 */
export async function generateMetadata({
  params,
  searchParams,
}: StorePageProps): Promise<Metadata> {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const { store } = resolvedParams
  const path = resolvedSearchParams.path || '/'

  try {
    const domain = `${store}.fasttify.com`
    const result = await storeRenderer.renderPage(domain, path)

    const { metadata } = result

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
            type: metadata.openGraph.type as any,
            images: metadata.openGraph.image ? [metadata.openGraph.image] : undefined,
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
      other: metadata.schema
        ? {
            'application-ld+json': JSON.stringify(metadata.schema),
          }
        : undefined,
    }
  } catch (error) {
    console.error(`Error generating metadata for ${store}${path}:`, error)

    // Metadata por defecto para errores
    return {
      title: `${store} - Tienda Online`,
      description: `Descubre productos únicos en ${store}. ¡Compra online!`,
    }
  }
}

/**
 * Configurar revalidación de páginas para ISR
 * Esto permite que las páginas se regeneren automáticamente
 */
export const revalidate = 1800 // 30 minutos

/**
 * Configurar generación estática para tiendas populares
 * (esto se ejecutaría en build time)
 */
export async function generateStaticParams() {
  // TODO: Obtener lista de tiendas activas desde la base de datos
  // Por ahora retornamos array vacío para generar páginas bajo demanda
  return []
}
