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

import { cacheManager } from '@/liquid-forge/services/core/cache';
import type { PageType } from '@/liquid-forge/types/template';

const templatePaths: Record<PageType, string> = {
  index: 'templates/index.json',
  product: 'templates/product.json',
  collection: 'templates/collection.json',
  page: 'templates/page.json',
  blog: 'templates/blog.json',
  article: 'templates/article.json',
  policies: 'templates/policies.json',
  search: 'templates/search.json',
  cart: 'templates/cart.json',
  '404': 'templates/404.json',
  checkout_start: 'templates/checkout_start.json',
  checkout: 'templates/checkout.json',
};

/**
 * Obtiene la ruta del template según el tipo de página
 */
function getTemplatePath(pageType: PageType): string {
  return templatePaths[pageType] || `templates/${pageType}.json`;
}

/**
 * Obtiene el TTL de caché según el tipo de página
 * Usa el nuevo sistema híbrido simplificado
 */
function getCacheTTL(pageType: PageType): number {
  return cacheManager.getPageTTL(pageType);
}

export const pageConfig = {
  getTemplatePath,
  getCacheTTL,
};
