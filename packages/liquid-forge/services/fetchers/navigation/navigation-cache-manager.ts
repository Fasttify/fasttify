/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { cacheManager, getNavigationCacheKey, getNavigationMenuCacheKey } from '@/liquid-forge/services/core/cache';
import type { NavigationMenusResponse, ProcessedNavigationMenu } from './types/navigation-types';

export class NavigationCacheManager {
  /**
   * Obtiene datos del caché para menús de navegación
   */
  public getCachedMenus(storeId: string): NavigationMenusResponse | null {
    const cacheKey = getNavigationCacheKey(storeId);
    return cacheManager.getCached(cacheKey);
  }

  /**
   * Obtiene datos del caché para un menú específico
   */
  public getCachedMenu(storeId: string, handle: string): ProcessedNavigationMenu | null {
    const cacheKey = getNavigationMenuCacheKey(storeId, handle);
    return cacheManager.getCached(cacheKey);
  }

  /**
   * Guarda en caché la respuesta de menús de navegación
   */
  public setCachedMenus(storeId: string, data: NavigationMenusResponse): void {
    const cacheKey = getNavigationCacheKey(storeId);
    cacheManager.setCached(cacheKey, data, cacheManager.getDataTTL('navigation'));
  }

  /**
   * Guarda en caché un menú específico
   */
  public setCachedMenu(storeId: string, handle: string, data: ProcessedNavigationMenu): void {
    const cacheKey = getNavigationMenuCacheKey(storeId, handle);
    cacheManager.setCached(cacheKey, data, cacheManager.getDataTTL('navigation'));
  }

  /**
   * Invalida el caché de menús de navegación para una tienda
   */
  public invalidateStoreCache(storeId: string): void {
    cacheManager.invalidateStoreCache(storeId);
  }

  /**
   * Invalida el caché de un menú específico
   */
  public invalidateMenuCache(storeId: string, handle: string): void {
    const cacheKey = getNavigationMenuCacheKey(storeId, handle);
    cacheManager.invalidateTemplateCache(cacheKey);
  }
}

export const navigationCacheManager = new NavigationCacheManager();
