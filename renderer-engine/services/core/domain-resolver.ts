import { cacheManager } from '@/renderer-engine/services/core/cache';
import type { Store, TemplateError } from '@/renderer-engine/types';
import { cookiesClient } from '@/utils/server/AmplifyServer';

class DomainResolver {
  private static instance: DomainResolver;

  private constructor() {}

  public static getInstance(): DomainResolver {
    if (!DomainResolver.instance) {
      DomainResolver.instance = new DomainResolver();
    }
    return DomainResolver.instance;
  }

  /**
   * Resuelve dominio a store con cache optimizado
   */
  public async resolveDomain(domain: string): Promise<Store | null> {
    const cacheKey = `domain_${domain}`;
    const cached = cacheManager.getCached(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      let { data: stores } = await cookiesClient.models.UserStore.listUserStoreByCustomDomain({
        customDomain: domain,
      });

      if (!stores?.length) {
        const { data: defaultStores } = await cookiesClient.models.UserStore.listUserStoreByDefaultDomain({
          defaultDomain: domain,
        });
        stores = defaultStores;
      }

      if (!stores?.length) {
        // Cache negativo por 5 minutos
        cacheManager.setCached(cacheKey, null, cacheManager.getDataTTL('search'));
        return null;
      }

      const store = stores[0] as unknown as Store;

      cacheManager.setCached(cacheKey, store, cacheManager.getDomainTTL());
      return store;
    } catch {
      // Cache negativo por 1 minuto en caso de error
      cacheManager.setCached(cacheKey, null, cacheManager.getDataTTL('cart'));
      return null;
    }
  }

  /**
   * Resuelve dominio a store activa o lanza error
   */
  public async resolveStoreByDomain(domain: string): Promise<Store> {
    const store = await this.resolveDomain(domain);

    if (!store) {
      const error: TemplateError = {
        type: 'STORE_NOT_FOUND',
        message: `No store found for domain: ${domain}`,
        statusCode: 404,
      };
      throw error;
    }

    if (!store.storeStatus) {
      const error: TemplateError = {
        type: 'STORE_NOT_ACTIVE',
        message: `Store is not active for domain: ${domain}`,
        statusCode: 402,
      };
      throw error;
    }

    return store;
  }

  /**
   * Invalida cache para dominio específico
   */
  public invalidateCache(domain: string): void {
    cacheManager.invalidateDomainCache(domain);
  }
}

export const domainResolver = DomainResolver.getInstance();

export { DomainResolver };
