import DevAutoReloadScript from '@/app/[store]/src/components/DevAutoReloadScript';
import { StorePageController } from '@/app/[store]/src/_lib/controllers/store-page-controller';
import { StoreMetadataController } from '@/app/[store]/src/_lib/controllers/store-metadata-controller';
import { isAssetPath } from '@/app/[store]/src/lib/store-page-utils';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

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
 *
 * Esta página solo orquesta la llamada al controller, delegando toda la lógica
 */
export default async function StorePage(props: StorePageProps) {
  const controller = new StorePageController();

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
  const { path } = await props.searchParams;

  if (path && isAssetPath(path)) {
    return {
      title: 'Asset',
      description: 'Static asset',
    };
  }

  const controller = new StoreMetadataController();
  return controller.handle(props);
}
