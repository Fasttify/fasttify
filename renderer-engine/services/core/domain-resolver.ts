import { cookiesClient } from '@/utils/AmplifyServer';
import type { Store, TemplateError } from '@/renderer-engine/types';
import { cacheManager } from '@/renderer-engine/services/core/cache-manager';

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
    // Fast path: check cache first
    const cacheKey = `domain_${domain}`;
    const cached = cacheManager.getCached(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      // Query Amplify
      const { data: stores } = await cookiesClient.models.UserStore.listUserStoreByCustomDomain({
        customDomain: domain,
      });

      if (!stores?.length) {
        // Cache negative result for 5 minutes
        cacheManager.setCached(cacheKey, null, 5 * 60 * 1000);
        return null;
      }

      const store = stores[0] as Store;
      // Cache positive result
      cacheManager.setCached(cacheKey, store, cacheManager.DOMAIN_CACHE_TTL);
      return store;
    } catch {
      // Cache negative result on error
      cacheManager.setCached(cacheKey, null, 60 * 1000); // 1 minute
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

    // Check if store is active
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

// Export singleton instance
export const domainResolver = DomainResolver.getInstance();

// Export class for testing
export { DomainResolver };
