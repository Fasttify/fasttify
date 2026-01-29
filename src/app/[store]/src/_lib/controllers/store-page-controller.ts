import { logger } from '@fasttify/liquid-forge';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { DomainService } from '@/app/[store]/src/_lib/services/domain.service';
import { StoreTrackingService } from '@/app/[store]/src/_lib/services/store-tracking.service';
import { getCachedRenderResult, isAssetPath } from '@/app/[store]/src/lib/store-page-utils';
import { HEADER_NAMES, URL_CONFIG, ERROR_TYPES, HTTP_STATUS } from '@/app/[store]/src/_lib/constants/store.constants';

interface StorePageProps {
  params: Promise<{ store: string }>;
  searchParams: Promise<{ path?: string; [key: string]: string | string[] | undefined }>;
}

/**
 * Controlador para manejar el renderizado de páginas de tiendas
 * Contiene toda la lógica de negocio, dejando page.tsx limpio
 */
export class StorePageController {
  private domainService: DomainService;
  private storeTrackingService: StoreTrackingService;

  constructor() {
    this.domainService = new DomainService();
    this.storeTrackingService = new StoreTrackingService();
  }

  /**
   * Maneja la petición de renderizado de una página de tienda
   */
  async handle(props: StorePageProps) {
    const requestHeaders = await headers();

    // Obtener hostname
    const hostname = this.getHostname(requestHeaders);
    const { PORT_SEPARATOR } = URL_CONFIG;
    const cleanHostname = hostname?.split(PORT_SEPARATOR)[0] || '';

    // Validar dominio principal
    if (this.domainService.isMainDomain(cleanHostname)) {
      notFound();
    }

    const { store } = await props.params;
    const awaitedSearchParams = await props.searchParams;
    const path = awaitedSearchParams.path || '/';

    // Validar si el parámetro store es un asset común (favicon.ico, robots.txt, etc.)
    if (this.domainService.isCommonAsset(store)) {
      notFound();
    }

    // Validar path de assets
    if (isAssetPath(path)) {
      notFound();
    }

    // Resolver dominio
    const domain = this.domainService.resolveDomainFromParam(store);

    try {
      // Renderizar página
      const result = await getCachedRenderResult(domain, path, awaitedSearchParams);

      // Trackear vista de forma asíncrona
      await this.trackStoreView(domain, path, cleanHostname, requestHeaders);

      return { html: result.html };
    } catch (error: any) {
      // Si es 404 de tienda no encontrada, lanzar notFound
      if (error.type === ERROR_TYPES.STORE_NOT_FOUND && error.statusCode === HTTP_STATUS.NOT_FOUND) {
        notFound();
      }

      // Re-lanzar el error para que page.tsx lo maneje
      throw error;
    }
  }

  /**
   * Obtiene el hostname desde los headers
   */
  private getHostname(requestHeaders: Headers): string {
    const { X_ORIGINAL_HOST, CF_CONNECTING_IP, X_FORWARDED_HOST, HOST } = HEADER_NAMES;

    const xOriginalHost = requestHeaders.get(X_ORIGINAL_HOST);

    return (
      xOriginalHost ||
      (requestHeaders.get(CF_CONNECTING_IP)
        ? requestHeaders.get(X_FORWARDED_HOST) || requestHeaders.get(HOST) || ''
        : requestHeaders.get(HOST) || '')
    );
  }

  /**
   * Trackea la vista de la tienda
   */
  private async trackStoreView(domain: string, path: string, hostname: string, requestHeaders: Headers): Promise<void> {
    try {
      const { PROTOCOL } = URL_CONFIG;
      const headersObj = Object.fromEntries(requestHeaders.entries());
      const fullUrl = `${PROTOCOL}${hostname}${path}`;

      await this.storeTrackingService.trackStoreView(domain, path, headersObj, fullUrl);
    } catch (error) {
      // El tracking falla silenciosamente para no afectar el renderizado
      logger.error(`[StorePageController] Error in tracking for ${domain}`, error, 'StorePageController');
    }
  }
}
