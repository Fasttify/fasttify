import DevAutoReloadScript from '@/app/[store]/src/components/DevAutoReloadScript';
import { StorePageController } from '@/app/[store]/src/_lib/controllers/store-page-controller';
import { StoreMetadataController } from '@/app/[store]/src/_lib/controllers/store-metadata-controller';
import { PreviewPageController } from '@/app/[store]/src/_lib/controllers/preview-page-controller';
import { isAssetPath } from '@/app/[store]/src/lib/store-page-utils';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface StorePageProps {
  params: Promise<{
    store: string;
  }>;
  searchParams: Promise<{
    domain?: string;
    path?: string;
    [key: string]: string | string[] | undefined;
  }>;
}

/**
 * Página principal de tienda con SSR
 * Maneja todas las rutas de tienda: /, /products/slug, /collections/slug, etc
 * También maneja /preview?domain=... para previews del Theme Studio
 *
 * Esta página solo orquesta la llamada al controller, delegando toda la lógica
 */
export default async function StorePage(props: StorePageProps) {
  const controller = new StorePageController();
  const awaitedParams = await props.params;
  const awaitedSearchParams = await props.searchParams;

  // Si la ruta es /preview, usar el controlador de preview
  if (awaitedParams.store === 'preview' && awaitedSearchParams.domain) {
    const previewController = new PreviewPageController();
    const domainParam = Array.isArray(awaitedSearchParams.domain)
      ? awaitedSearchParams.domain[0]
      : awaitedSearchParams.domain;
    const path = Array.isArray(awaitedSearchParams.path)
      ? awaitedSearchParams.path[0] || '/'
      : awaitedSearchParams.path || '/';

    const result = await previewController.handle({
      domain: domainParam,
      path,
      searchParams: awaitedSearchParams,
    });

    return (
      <>
        {result.html && <div dangerouslySetInnerHTML={{ __html: result.html }} />}
        {process.env.NODE_ENV === 'development' && <DevAutoReloadScript />}
      </>
    );
  }

  // Comportamiento normal para rutas de tienda
  let html: string | null = null;
  let errorHtml: string | null = null;

  try {
    const result = await controller.handle(props);
    html = result.html;
  } catch (error: any) {
    errorHtml = error?.html ?? null;
    if (!errorHtml) throw error;
  }

  if (errorHtml) {
    return <div dangerouslySetInnerHTML={{ __html: errorHtml }} />;
  }

  return (
    <>
      {html && <div dangerouslySetInnerHTML={{ __html: html }} />}
      {process.env.NODE_ENV === 'development' && <DevAutoReloadScript />}
    </>
  );
}

/**
 * Genera metadata SEO para la página
 */
export async function generateMetadata(props: StorePageProps): Promise<Metadata> {
  const awaitedParams = await props.params;
  const awaitedSearchParams = await props.searchParams;
  const { path } = awaitedSearchParams;

  // Si es preview, no generar metadata (devolver valores por defecto)
  if (awaitedParams.store === 'preview') {
    return {
      title: 'Preview',
      description: 'Theme Studio Preview',
    };
  }

  if (path && isAssetPath(path)) {
    return {
      title: 'Asset',
      description: 'Static asset',
    };
  }

  const controller = new StoreMetadataController();
  return controller.handle(props);
}
