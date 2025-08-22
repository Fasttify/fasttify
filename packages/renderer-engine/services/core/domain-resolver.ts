/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { cacheManager, getDomainCacheKey } from '@/renderer-engine/services/core/cache';
import { logger } from '@/renderer-engine/lib/logger';
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
    const cacheKey = getDomainCacheKey(domain);
    const cached = cacheManager.getCached(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      let resolvedStore: Store | null = null;

      // 1. Intentar resolver por customDomain en StoreCustomDomain
      const { data: customDomains } = await cookiesClient.models.StoreCustomDomain.listStoreCustomDomainByCustomDomain(
        {
          customDomain: domain,
        },
        {
          selectionSet: ['store.*'], // Carga ansiosa de la tienda relacionada
        }
      );

      if (customDomains?.length) {
        resolvedStore = customDomains[0].store as unknown as Store;
      }

      // 2. Si no se encuentra por customDomain, intentar resolver por defaultDomain en UserStore
      if (!resolvedStore) {
        const { data: defaultStores } = await cookiesClient.models.UserStore.listUserStoreByDefaultDomain({
          defaultDomain: domain,
        });
        if (defaultStores?.length) {
          resolvedStore = defaultStores[0] as unknown as Store;
        }
      }

      if (!resolvedStore) {
        // Cache negativo por 5 minutos
        cacheManager.setCached(cacheKey, null, cacheManager.getDataTTL('search'));
        return null;
      }

      cacheManager.setCached(cacheKey, resolvedStore, cacheManager.getDomainTTL());
      return resolvedStore;
    } catch (error) {
      logger.error('Error resolving domain:', error, 'DomainResolver');
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
