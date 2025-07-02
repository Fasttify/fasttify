import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { storeRenderer } from '@/renderer-engine';
import { logger } from '@/renderer-engine/lib/logger';

// Forzar renderizado dinámico para acceder a variables de entorno en runtime
export const dynamic = 'force-dynamic';

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
  ];
  return (
    assetExtensions.some((ext) => path.toLowerCase().endsWith(ext)) ||
    path.startsWith('/assets/') ||
    path.startsWith('/_next/') ||
    path.includes('/icons/')
  );
}

/**
 * Función cacheada usando React.cache() que persiste entre generateMetadata y StorePage
 * Esta es la forma oficial de Next.js para compartir datos entre estas funciones
 */
const getCachedRenderResult = cache(async (domain: string, path: string, searchParams: Record<string, string>) => {
  return await storeRenderer.renderPage(domain, path, searchParams);
});

interface StorePageProps {
  params: Promise<{
    store: string;
  }>;
  searchParams: Promise<{
    path?: string;
  }>;
}

/**
 * Componente cliente para manejar el auto-reload solo en desarrollo
 * Esto evita hydration mismatch al ejecutarse solo en el cliente
 */
function DevAutoReloadScript() {
  // Este componente se renderiza solo en el cliente
  if (typeof window === 'undefined') {
    return null;
  }

  // Verificar si estamos en desarrollo
  const isDev = process.env.APP_ENV === 'development';

  if (!isDev) {
    return null;
  }

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
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
            
            // Iniciar conexión solo si estamos en desarrollo
            if (window.location.hostname === 'localhost' || window.location.hostname.includes('dev')) {
              connectSSE();
            }
          })();
        `,
      }}
    />
  );
}

/**
 * Página principal de tienda con SSR
 * Maneja todas las rutas de tienda: /, /products/slug, /collections/slug
 */
export default async function StorePage({ params, searchParams }: StorePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { store } = resolvedParams;
  const path = resolvedSearchParams.path || '/';

  // Validar que no sea una ruta de asset
  if (isAssetPath(path)) {
    notFound();
  }

  try {
    // Resolver dominio completo - detectar el tipo de dominio
    // El middleware ya debería haber procesado esto correctamente
    const domain = store.includes('.') ? store : `${store}.fasttify.com`;

    // Renderizar página usando el sistema con caché temporal
    const result = await getCachedRenderResult(domain, path, resolvedSearchParams as any);

    // Retornar HTML renderizado con aislamiento CSS y auto-reload seguro
    return (
      <>
        <div dangerouslySetInnerHTML={{ __html: result.html }} />
        <DevAutoReloadScript />
      </>
    );
  } catch (error: any) {
    logger.error(`Error rendering store page ${store}${path}`, error, 'StorePage');

    // Si el error ya tiene HTML renderizado (páginas de error amigables),
    // mostrar esa página en lugar de lanzar el error
    if (error.html) {
      return <div dangerouslySetInnerHTML={{ __html: error.html }} />;
    }

    // Mostrar 404 solo para casos muy específicos
    if (error.type === 'STORE_NOT_FOUND' && error.statusCode === 404) {
      notFound();
    }

    // Para otros errores, intentar renderizar una página de error básica
    // Si llegamos aquí, significa que falló el renderizado de error también
    throw error;
  }
}

/**
 * Genera metadata SEO para la página
 */
export async function generateMetadata({ params, searchParams }: StorePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { store } = resolvedParams;
  const path = resolvedSearchParams.path || '/';

  // No generar metadata para assets
  if (isAssetPath(path)) {
    return {
      title: 'Asset',
      description: 'Static asset',
    };
  }

  try {
    const domain = store.includes('.') ? store : `${store}.fasttify.com`;

    // Usar el cache global para obtener el resultado completo
    const result = await getCachedRenderResult(domain, path, resolvedSearchParams as any);
    const { metadata } = result;

    // Asegurar que el título se muestre correctamente sin sufijos
    // El título ya debería incluir la página específica + nombre de tienda
    const storeTitle = metadata.title;

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
    };
  } catch (error) {
    logger.error(`ERROR generating metadata for ${store}${path}`, error, 'StorePage');

    // Extraer nombre más amigable del dominio para el fallback
    const friendlyName = store.includes('.')
      ? store.split('.')[0].charAt(0).toUpperCase() + store.split('.')[0].slice(1)
      : store.charAt(0).toUpperCase() + store.slice(1);

    // Metadata por defecto para errores - usando nombre más amigable
    return {
      title: {
        absolute: `${friendlyName} - Tienda Online`,
        template: '%s', // Evitar que Next.js añada sufijos
      },
      description: `Descubre productos únicos en ${friendlyName}. ¡Compra online!`,
    };
  }
}
