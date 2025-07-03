import DevAutoReloadScript from '@/app/[store]/components/DevAutoReloadScript';
import { generateStoreMetadata, getCachedRenderResult, isAssetPath } from '@/app/[store]/lib/store-page-utils';
import { logger } from '@/renderer-engine/lib/logger';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

// Forzar renderizado dinámico para acceder a variables de entorno en runtime
export const dynamic = 'force-dynamic';

/**
 * Función cacheada usando React.cache() que persiste entre generateMetadata y StorePage
 * Esta es la forma oficial de Next.js para compartir datos entre estas funciones
 */

interface StorePageProps {
  params: Promise<{
    store: string;
  }>;
  searchParams: Promise<{
    path?: string;
    [key: string]: string | string[] | undefined;
  }>;
}

/**
 * Página principal de tienda con SSR
 * Maneja todas las rutas de tienda: /, /products/slug, /collections/slug, etc
 */
export default async function StorePage({ params, searchParams }: StorePageProps) {
  const requestHeaders = await headers();
  const xOriginalHost = requestHeaders.get('x-original-host');

  const hostname =
    xOriginalHost ||
    (requestHeaders.get('cf-connecting-ip')
      ? requestHeaders.get('x-forwarded-host') || requestHeaders.get('host') || ''
      : requestHeaders.get('host') || '');

  const cleanHostname = hostname?.split(':')[0] || '';

  // Esta página NUNCA debe renderizarse para el dominio principal.
  // El dominio principal (ej: fasttify.com) muestra la landing, precios, etc.
  // Las tiendas solo se sirven en subdominios (ej: store.fasttify.com) o dominios personalizados.
  const isMainDomain =
    cleanHostname === 'fasttify.com' || cleanHostname === 'www.fasttify.com' || cleanHostname === 'localhost';

  if (isMainDomain) {
    notFound();
  }

  const { store } = await params;
  const path = (await searchParams).path || '/';

  // Validar que no sea una ruta de asset
  if (isAssetPath(path)) {
    notFound();
  }

  try {
    // Resolver dominio completo - detectar el tipo de dominio
    // El middleware ya debería haber procesado esto correctamente
    const domain = store.includes('.') ? store : `${store}.fasttify.com`;

    // Renderizar página usando el sistema con caché temporal
    const result = await getCachedRenderResult(domain, path, searchParams);

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
  const { store } = await params;
  const path = (await searchParams).path || '/';

  // No generar metadata para assets
  if (isAssetPath(path)) {
    return {
      title: 'Asset',
      description: 'Static asset',
    };
  }

  return generateStoreMetadata(store, path, searchParams);
}
