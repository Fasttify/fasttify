import DevAutoReloadScript from '@/app/[store]/components/DevAutoReloadScript';
import { generateStoreMetadata, getCachedRenderResult, isAssetPath } from '@/app/[store]/lib/store-page-utils';
import { logger } from '@/renderer-engine/lib/logger';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

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

  const isMainDomain =
    cleanHostname === 'fasttify.com' || cleanHostname === 'www.fasttify.com' || cleanHostname === 'localhost';

  if (isMainDomain) {
    notFound();
  }

  const { store } = await params;
  const awaitedSearchParams = await searchParams;
  const path = awaitedSearchParams.path || '/';

  if (isAssetPath(path)) {
    notFound();
  }

  try {
    const domain = store.includes('.') ? store : `${store}.fasttify.com`;

    const result = await getCachedRenderResult(domain, path, awaitedSearchParams);

    return (
      <>
        <div dangerouslySetInnerHTML={{ __html: result.html }} />
        <DevAutoReloadScript />
      </>
    );
  } catch (error: any) {
    logger.error(`Error rendering store page ${store}${path}`, error, 'StorePage');

    if (error.html) {
      return <div dangerouslySetInnerHTML={{ __html: error.html }} />;
    }

    if (error.type === 'STORE_NOT_FOUND' && error.statusCode === 404) {
      notFound();
    }

    throw error;
  }
}

/**
 * Genera metadata SEO para la página
 */
export async function generateMetadata({ params, searchParams }: StorePageProps): Promise<Metadata> {
  const { store } = await params;
  const awaitedSearchParams = await searchParams;
  const path = awaitedSearchParams.path || '/';

  if (isAssetPath(path)) {
    return {
      title: 'Asset',
      description: 'Static asset',
    };
  }

  return generateStoreMetadata(store, path, awaitedSearchParams);
}
