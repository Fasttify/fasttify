import { cacheManager } from '@/renderer-engine/services/core/cache';
import type { PageType } from '@/renderer-engine/types/template';

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
