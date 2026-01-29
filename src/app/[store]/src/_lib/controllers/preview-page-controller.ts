import { getCachedRenderResult } from '@/app/[store]/src/lib/store-page-utils';

interface PreviewPageProps {
  domain: string;
  path: string;
  searchParams: Record<string, string | string[] | undefined>;
}

/**
 * Controlador para manejar las páginas de preview del Theme Studio
 * Renderiza directamente usando el dominio sin pasar por resolveDomainFromParam
 */
export class PreviewPageController {
  async handle(props: PreviewPageProps) {
    const { domain, path, searchParams } = props;

    // Validar que el dominio no sea "preview"
    if (!domain || domain === 'preview' || domain.startsWith('preview.')) {
      throw new Error('Invalid domain for preview. Domain must be provided.');
    }

    // Decodificar el dominio si viene codificado
    const decodedDomain = decodeURIComponent(domain);

    // Validar que el dominio decodificado tenga el formato correcto
    if (!decodedDomain.includes('.')) {
      throw new Error(`Invalid domain format: ${decodedDomain}`);
    }

    // Renderizar directamente usando el dominio
    const result = await getCachedRenderResult(decodedDomain, path, searchParams);

    return {
      html: result.html,
      metadata: result.metadata,
    };
  }
}
