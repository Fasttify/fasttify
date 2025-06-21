import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { storeRenderer } from '@/renderer-engine'

// Forzar renderizado dinámico para acceder a variables de entorno en runtime
export const dynamic = 'force-dynamic'

/**
 * Verifica si el path corresponde a un asset estático
 */
function isAssetPath(path: string): boolean {
  const assetExtensions = [
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.webp',
    '.ico',
    '.css',
    '.js',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
  ]
  return (
    assetExtensions.some(ext => path.toLowerCase().endsWith(ext)) ||
    path.startsWith('/assets/') ||
    path.startsWith('/_next/') ||
    path.includes('/icons/')
  )
}

/**
 * Función cacheada usando React.cache() que persiste entre generateMetadata y StorePage
 * Esta es la forma oficial de Next.js para compartir datos entre estas funciones
 */
const getCachedRenderResult = cache(async (domain: string, path: string) => {
  return await storeRenderer.renderPage(domain, path)
})

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

  // DEBUG: Logging para Cloudflare
  console.log('=== CLOUDFLARE DEBUG ===')
  console.log('Store param:', store)
  console.log('Path:', path)

  // Validar que no sea una ruta de asset
  if (isAssetPath(path)) {
    notFound()
  }

  try {
    // Resolver dominio completo - usar el store name del parámetro
    // El middleware ya debería haber procesado esto correctamente
    const domain = `${store}.fasttify.com`
    console.log('Resolved domain:', domain)

    // Renderizar página usando el sistema con caché temporal
    const result = await getCachedRenderResult(domain, path)

    // Agregar script de recarga automática solo en desarrollo
    const isDev = process.env.NODE_ENV === 'development' || process.env.APP_ENV === 'development'
    const autoReloadScript = isDev
      ? `
        <script>
          (function() {
            // Crear conexión SSE para recargas automáticas
            function connectSSE() {
              const eventSource = new EventSource('/api/stores/template-dev/ws');
              
              eventSource.onopen = function() {
                console.log('[Template Dev] Conectado al servidor de desarrollo');
              };
              
              eventSource.onmessage = function(event) {
                const data = JSON.parse(event.data);
                
                if (data.type === 'reload') {
                  console.log('[Template Dev] Cambios detectados, recargando página...');
                  window.location.reload();
                }
                
                if (data.type === 'connected') {
                  console.log('[Template Dev] Conexión SSE establecida');
                }
              };
              
              eventSource.onerror = function() {
                console.log('[Template Dev] Error en la conexión, reconectando en 3s...');
                eventSource.close();
                setTimeout(connectSSE, 3000);
              };
            }
            
            // Iniciar conexión
            connectSSE();
          })();
        </script>
      `
      : ''

    // Inyectar el script de recarga automática al final del HTML
    const htmlWithAutoReload = isDev
      ? result.html.replace('</body>', `${autoReloadScript}</body>`)
      : result.html

    // Retornar HTML renderizado como componente dangerouslySetInnerHTML
    // Esto permite SSR completo con SEO optimizado
    return <div dangerouslySetInnerHTML={{ __html: htmlWithAutoReload }} />
  } catch (error: any) {
    console.error(`Error rendering store page ${store}${path}:`, error)

    // Si el error ya tiene HTML renderizado (páginas de error amigables),
    // mostrar esa página en lugar de lanzar el error
    if (error.html) {
      return <div dangerouslySetInnerHTML={{ __html: error.html }} />
    }

    // Mostrar 404 solo para casos muy específicos
    if (error.type === 'STORE_NOT_FOUND' && error.statusCode === 404) {
      notFound()
    }

    // Para otros errores, intentar renderizar una página de error básica
    // Si llegamos aquí, significa que falló el renderizado de error también
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

  // No generar metadata para assets
  if (isAssetPath(path)) {
    return {
      title: 'Asset',
      description: 'Static asset',
    }
  }

  try {
    const domain = `${store}.fasttify.com`

    // Usar el cache global para obtener el resultado completo
    const result = await getCachedRenderResult(domain, path)
    const { metadata } = result

    // Asegurar que el título se muestre correctamente sin sufijos
    // El título ya debería incluir la página específica + nombre de tienda
    const storeTitle = metadata.title

    return {
      title: {
        absolute: storeTitle,
        template: '%s', // Evitar que Next.js añada sufijos
      },
      description: metadata.description,
      alternates: {
        canonical: metadata.canonical,
      },
      icons: metadata.icons,
      keywords: metadata.keywords,
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
    console.error(`ERROR generating metadata for ${store}${path}:`, error)

    // Metadata por defecto para errores
    return {
      title: {
        absolute: `${store} - Tienda Online`,
        template: '%s', // Evitar que Next.js añada sufijos
      },
      description: `Descubre productos únicos en ${store}. ¡Compra online!`,
    }
  }
}

/**
 * COMENTADO: Estas configuraciones estáticas conflictan con force-dynamic
 * No se pueden usar juntas en Next.js 15
 */

// export const revalidate = 1800 // 30 minutos

// export async function generateStaticParams() {
//   return []
// }
