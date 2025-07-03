import { storeRenderer } from '@/renderer-engine';
import { logger } from '@/renderer-engine/lib/logger';
import { Metadata } from 'next';
import { cache } from 'react';

/**
 * Verifica si el path corresponde a un asset estático para evitar procesarlo como una página de tienda.
 */
export function isAssetPath(path: string): boolean {
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
 * Función cacheada usando React.cache() que persiste entre generateMetadata y StorePage.
 * Esta es la forma oficial de Next.js para compartir datos entre estas funciones.
 */
export const getCachedRenderResult = cache(
  async (domain: string, path: string, searchParams: Promise<Record<string, any>>) => {
    return await storeRenderer.renderPage(domain, path, await searchParams);
  }
);

/**
 * Genera metadata SEO para la página de la tienda.
 * Reutiliza el resultado cacheado de la renderización para evitar trabajo duplicado.
 */
export async function generateStoreMetadata(
  store: string,
  path: string,
  searchParams: Promise<Record<string, any>>
): Promise<Metadata> {
  try {
    const domain = store.includes('.') ? store : `${store}.fasttify.com`;
    const result = await getCachedRenderResult(domain, path, searchParams);
    const { metadata } = result;

    const storeTitle = metadata.title;

    return {
      title: {
        absolute: storeTitle,
        template: '%s',
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
    logger.error(`ERROR generating metadata for ${store}${path}`, error, 'StorePageMetadata');

    const friendlyName = store.includes('.')
      ? store.split('.')[0].charAt(0).toUpperCase() + store.split('.')[0].slice(1)
      : store.charAt(0).toUpperCase() + store.slice(1);

    return {
      title: {
        absolute: `${friendlyName} - Tienda Online`,
        template: '%s',
      },
      description: `Descubre productos únicos en ${friendlyName}. ¡Compra online!`,
    };
  }
}
