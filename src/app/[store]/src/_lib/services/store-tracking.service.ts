import { storeViewsTracker, logger, domainResolver } from '@fasttify/liquid-forge';

/**
 * Servicio para manejar el tracking de vistas de tiendas
 */
export class StoreTrackingService {
  /**
   * Captura y registra una vista de la tienda de forma asíncrona
   */
  async trackStoreView(domain: string, path: string, headers: Record<string, string>, fullUrl: string): Promise<void> {
    try {
      const storeRecord = await domainResolver.resolveStoreByDomain(domain);
      const realStoreId = storeRecord.storeId;

      const viewData = storeViewsTracker.captureStoreView(realStoreId, path, headers, fullUrl);

      // Trackear de forma asíncrona (fire and forget)
      storeViewsTracker.trackStoreView(viewData).catch((trackError) => {
        logger.error(`Failed to track store view for ${realStoreId}`, trackError, 'StoreTrackingService');
      });
    } catch (trackError) {
      logger.error(`Error capturing store view for ${domain}`, trackError, 'StoreTrackingService');
    }
  }
}
