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

  try {
    const result = await controller.handle(props);

    return (
      <>
        <div dangerouslySetInnerHTML={{ __html: result.html }} />
        {process.env.NODE_ENV === 'development' && <DevAutoReloadScript />}
      </>
    );
  } catch (error: any) {
    // Si hay HTML de error disponible, renderizarlo
    if (error.html) {
      return <div dangerouslySetInnerHTML={{ __html: error.html }} />;
    }

    // Re-lanzar otros errores
    throw error;
  }
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
