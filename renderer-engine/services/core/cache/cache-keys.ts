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

// Utilidad centralizada para generación de claves de caché
// Usar siempre estas funciones para set/get/invalidate caché

/**
 * Productos
 */
export function getProductCacheKey(storeId: string, productIdOrHandle: string) {
  return `product_${storeId}_${productIdOrHandle}`;
}

export function getProductsCacheKey(storeId: string, limit: number, nextToken?: string) {
  return `products_${storeId}_${limit}_${nextToken || 'first'}`;
}

export function getFeaturedProductsCacheKey(storeId: string, limit: number) {
  return `featured_products_${storeId}_${limit}`;
}

export function getProductHandleMapCacheKey(storeId: string) {
  return `product_handle_map_${storeId}`;
}

/**
 * Colecciones
 */
export function getCollectionCacheKey(storeId: string, collectionId: string, limit?: number, nextToken?: string) {
  return `collection_${storeId}_${collectionId}_${limit || 'def'}_${nextToken || 'first'}`;
}

export function getCollectionsCacheKey(storeId: string, limit: number, nextToken?: string) {
  return `collections_${storeId}_${limit}_${nextToken || 'first'}`;
}

/**
 * Páginas
 */
export function getPageCacheKey(storeId: string, pageId: string) {
  return `page_${storeId}_${pageId}`;
}

export function getPagesCacheKey(storeId: string) {
  return `pages_${storeId}`;
}

/**
 * Navegación
 */
export function getNavigationCacheKey(storeId: string) {
  return `navigation_${storeId}`;
}

/**
 * Menú de navegación específico por handle
 */
export function getNavigationMenuCacheKey(storeId: string, handle: string) {
  return `navigation_menu_${storeId}_${handle}`;
}

/**
 * Plantillas
 */
export function getTemplateCacheKey(storeId: string, templatePath: string) {
  return `template_${storeId}_${templatePath}`;
}

export function getCompiledTemplateCacheKey(storeId: string, templatePath: string) {
  return `compiled_template_${storeId}_${templatePath}`;
}

/**
 * Assets
 */
export function getAssetCacheKey(storeId: string, assetPath: string) {
  return `asset_${storeId}_${assetPath}`;
}

/**
 * Dominios
 */
export function getDomainCacheKey(domain: string) {
  return `domain_${domain}`;
}

/**
 * Búsqueda de productos
 */
export function getSearchProductsCacheKey(storeId: string, q: string, limit: number) {
  return `search_products_${storeId}_${q}_${limit}`;
}

// Agregar aquí más funciones según se necesiten para otros tipos de datos
