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
};

const cacheTTLs: Record<PageType, number> = {
  index: 30 * 60 * 1000, // 30 minutos
  product: 60 * 60 * 1000, // 1 hora
  collection: 45 * 60 * 1000, // 45 minutos
  page: 24 * 60 * 60 * 1000, // 24 horas
  blog: 2 * 60 * 60 * 1000, // 2 horas
  article: 4 * 60 * 60 * 1000, // 4 horas
  policies: 24 * 60 * 60 * 1000, // 24 horas
  search: 10 * 60 * 1000, // 10 minutos
  cart: 0, // Sin caché para cart (siempre fresco)
  '404': 24 * 60 * 60 * 1000, // 24 horas
};

/**
 * Obtiene la ruta del template según el tipo de página
 */
function getTemplatePath(pageType: PageType): string {
  return templatePaths[pageType] || `templates/${pageType}.json`;
}

/**
 * Obtiene el TTL de caché según el tipo de página
 */
function getCacheTTL(pageType: PageType): number {
  return cacheTTLs[pageType] || 30 * 60 * 1000;
}

export const pageConfig = {
  getTemplatePath,
  getCacheTTL,
};
