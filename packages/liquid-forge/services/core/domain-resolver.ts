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

import { cacheManager, getDomainCacheKey } from './cache';
import { logger } from '../../lib/logger';
import type { Store, TemplateError } from '../../types';
import { cookiesClient } from '@/utils/server/AmplifyServer';

/**
 * TTL para cache negativo cuando no se encuentra un dominio
 */
const NEGATIVE_CACHE_TTL_NOT_FOUND = 300; // 5 minutos

/**
 * TTL para cache negativo cuando ocurre un error
 */
const NEGATIVE_CACHE_TTL_ERROR = 60; // 1 minuto

/**
 * Códigos de estado HTTP para errores de dominio
 */
const HTTP_STATUS = {
  NOT_FOUND: 404,
  PAYMENT_REQUIRED: 402,
} as const;

/**
 * Servicio singleton para resolver dominios a tiendas.
 * Implementa caché optimizado y búsqueda paralela para máximo rendimiento.
 *
 * @class DomainResolver
 * @example
 * ```typescript
 * const store = await domainResolver.resolveDomain('example.com');
 * if (store) {
 *   console.log(`Tienda encontrada: ${store.id}`);
 * }
 * ```
 */
class DomainResolver {
  private static instance: DomainResolver;

  private constructor() {}

  /**
   * Obtiene la instancia única del DomainResolver
   *
   * @returns {DomainResolver} Instancia singleton del resolver
   */
  public static getInstance(): DomainResolver {
    if (!DomainResolver.instance) {
      DomainResolver.instance = new DomainResolver();
    }
    return DomainResolver.instance;
  }

  /**
   * Resuelve un dominio a su tienda correspondiente con caché optimizado.
   * Busca en paralelo en dominios personalizados y dominios por defecto.
   *
   * @param {string} domain - Dominio a resolver (ej: 'mitienda.com')
   * @returns {Promise<Store | null>} Tienda encontrada o null si no existe
   *
   * @example
   * ```typescript
   * const store = await domainResolver.resolveDomain('example.com');
   * if (store) {
   *   console.log('Tienda encontrada');
   * }
   * ```
   */
  public async resolveDomain(domain: string): Promise<Store | null> {
    const cachedStore = this.getCachedStore(domain);
    if (cachedStore !== undefined) {
      return cachedStore;
    }

    try {
      const store = await this.fetchStoreByDomain(domain);
      this.cacheStoreResult(domain, store);
      return store;
    } catch (error) {
      this.handleResolutionError(domain, error);
      return null;
    }
  }

  /**
   * Resuelve un dominio a una tienda activa o lanza un error.
   * Valida que la tienda exista y esté activa.
   *
   * @param {string} domain - Dominio a resolver
   * @returns {Promise<Store>} Tienda activa encontrada
   * @throws {TemplateError} Si la tienda no existe o no está activa
   *
   * @example
   * ```typescript
   * try {
   *   const store = await domainResolver.resolveStoreByDomain('example.com');
   *   console.log('Tienda activa:', store.id);
   * } catch (error) {
   *   console.error('Error:', error.message);
   * }
   * ```
   */
  public async resolveStoreByDomain(domain: string): Promise<Store> {
    const store = await this.resolveDomain(domain);

    this.validateStoreExists(store, domain);
    this.validateStoreIsActive(store, domain);

    return store;
  }

  /**
   * Invalida el caché para un dominio específico.
   * Útil cuando se actualiza la configuración de una tienda.
   *
   * @param {string} domain - Dominio cuyo caché se debe invalidar
   *
   * @example
   * ```typescript
   * domainResolver.invalidateCache('example.com');
   * ```
   */
  public invalidateCache(domain: string): void {
    cacheManager.invalidateDomainCache(domain);
  }

  /**
   * Obtiene una tienda del caché si existe
   *
   * @private
   * @param {string} domain - Dominio a buscar en caché
   * @returns {Store | null | undefined} Store si existe en caché, undefined si no está cacheado
   */
  private getCachedStore(domain: string): Store | null | undefined {
    const cacheKey = getDomainCacheKey(domain);
    const cached = cacheManager.getCached(cacheKey);

    if (cached !== null) {
      return cached;
    }

    return undefined;
  }

  /**
   * Busca una tienda por dominio en la base de datos.
   * Ejecuta búsquedas en paralelo por dominio personalizado y dominio por defecto.
   *
   * @private
   * @param {string} domain - Dominio a buscar
   * @returns {Promise<Store | null>} Tienda encontrada o null
   */
  private async fetchStoreByDomain(domain: string): Promise<Store | null> {
    const [customDomainStore, defaultDomainStore] = await Promise.all([
      this.findStoreByCustomDomain(domain),
      this.findStoreByDefaultDomain(domain),
    ]);

    return customDomainStore ?? defaultDomainStore;
  }

  /**
   * Busca una tienda por su dominio personalizado
   *
   * @private
   * @param {string} domain - Dominio personalizado a buscar
   * @returns {Promise<Store | null>} Tienda encontrada o null
   */
  private async findStoreByCustomDomain(domain: string): Promise<Store | null> {
    const { data: customDomains } = await cookiesClient.models.StoreCustomDomain.listStoreCustomDomainByCustomDomain(
      { customDomain: domain },
      { selectionSet: ['store.*'] }
    );

    return (customDomains?.[0]?.store as unknown as Store) ?? null;
  }

  /**
   * Busca una tienda por su dominio por defecto
   *
   * @private
   * @param {string} domain - Dominio por defecto a buscar
   * @returns {Promise<Store | null>} Tienda encontrada o null
   */
  private async findStoreByDefaultDomain(domain: string): Promise<Store | null> {
    const { data: defaultStores } = await cookiesClient.models.UserStore.listUserStoreByDefaultDomain({
      defaultDomain: domain,
    });

    return (defaultStores?.[0] as unknown as Store) ?? null;
  }

  /**
   * Almacena el resultado de la búsqueda en caché
   *
   * @private
   * @param {string} domain - Dominio a cachear
   * @param {Store | null} store - Tienda a cachear (puede ser null para caché negativo)
   */
  private cacheStoreResult(domain: string, store: Store | null): void {
    const cacheKey = getDomainCacheKey(domain);

    if (store) {
      cacheManager.setCached(cacheKey, store, cacheManager.getDomainTTL());
    } else {
      cacheManager.setCached(cacheKey, null, NEGATIVE_CACHE_TTL_NOT_FOUND);
    }
  }

  /**
   * Maneja errores durante la resolución de dominio
   *
   * @private
   * @param {string} domain - Dominio que causó el error
   * @param {unknown} error - Error capturado
   */
  private handleResolutionError(domain: string, error: unknown): void {
    logger.error('Error resolving domain:', error, 'DomainResolver');

    const cacheKey = getDomainCacheKey(domain);
    cacheManager.setCached(cacheKey, null, NEGATIVE_CACHE_TTL_ERROR);
  }

  /**
   * Valida que una tienda exista
   *
   * @private
   * @param {Store | null} store - Tienda a validar
   * @param {string} domain - Dominio que se intentó resolver
   * @throws {TemplateError} Si la tienda no existe
   */
  private validateStoreExists(store: Store | null, domain: string): asserts store is Store {
    if (!store) {
      const error: TemplateError = {
        type: 'STORE_NOT_FOUND',
        message: `No store found for domain: ${domain}`,
        statusCode: HTTP_STATUS.NOT_FOUND,
      };
      throw error;
    }
  }

  /**
   * Valida que una tienda esté activa
   *
   * @private
   * @param {Store} store - Tienda a validar
   * @param {string} domain - Dominio de la tienda
   * @throws {TemplateError} Si la tienda no está activa
   */
  private validateStoreIsActive(store: Store, domain: string): void {
    if (!store.storeStatus) {
      const error: TemplateError = {
        type: 'STORE_NOT_ACTIVE',
        message: `Store is not active for domain: ${domain}`,
        statusCode: HTTP_STATUS.PAYMENT_REQUIRED,
      };
      throw error;
    }
  }
}

export const domainResolver = DomainResolver.getInstance();

export { DomainResolver };
