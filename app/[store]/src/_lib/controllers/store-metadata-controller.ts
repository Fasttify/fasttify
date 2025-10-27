import { Metadata } from 'next';
import { generateStoreMetadata as generateMetadataUtil } from '@/app/[store]/src/lib/store-page-utils';

interface StoreMetadataProps {
  params: Promise<{ store: string }>;
  searchParams: Promise<{ path?: string; [key: string]: string | string[] | undefined }>;
}

/**
 * Controlador para generar metadata SEO de las páginas de tiendas
 */
export class StoreMetadataController {
  /**
   * Genera metadata SEO para la página
   */
  async handle(props: StoreMetadataProps): Promise<Metadata> {
    const { store } = await props.params;
    const awaitedSearchParams = await props.searchParams;
    const path = awaitedSearchParams.path || '/';

    return generateMetadataUtil(store, path, awaitedSearchParams);
  }
}
