import type { PageRenderOptions } from '@/renderer-engine/types/template';

/**
 * Tipo para matchers de rutas
 */
export type RouteMatcher = {
  pattern: RegExp;
  handler: (match: RegExpMatchArray) => PageRenderOptions;
};

/**
 * Matchers declarativos para rutas de tienda
 * Organizados por categorías para mejor mantenimiento
 */
export const routeMatchers: RouteMatcher[] = [
  // ===== RUTAS PRINCIPALES =====
  {
    pattern: /^\/$/,
    handler: () => ({ pageType: 'index' }),
  },

  // ===== PRODUCTOS =====
  // Producto en colección (estilo Shopify): /collections/handle/products/handle
  {
    pattern: /^\/collections\/([^\/]+)\/products\/([^\/]+)$/,
    handler: (match) => ({
      pageType: 'product',
      handle: match[2], // handle del producto
      collectionHandle: match[1], // handle de la colección para contexto
    }),
  },
  // Producto: /products/handle
  {
    pattern: /^\/products\/([^\/]+)$/,
    handler: (match) => ({
      pageType: 'product',
      handle: match[1],
    }),
  },

  // ===== COLECCIONES =====
  {
    pattern: /^\/collections\/([^\/]+)$/,
    handler: (match) => ({
      pageType: 'collection',
      handle: match[1],
    }),
  },

  // ===== PÁGINAS ESTÁTICAS =====
  {
    pattern: /^\/policies$/,
    handler: () => ({ pageType: 'policies' }),
  },
  {
    pattern: /^\/pages\/([^\/]+)$/,
    handler: (match) => ({
      pageType: 'page',
      handle: match[1],
    }),
  },

  // ===== BLOG =====
  {
    pattern: /^\/blogs\/([^\/]+)$/,
    handler: (match) => ({
      pageType: 'blog',
      handle: match[1],
    }),
  },

  // ===== RUTAS ESPECIALES =====
  {
    pattern: /^\/search$/,
    handler: () => ({ pageType: 'search' }),
  },
  {
    pattern: /^\/cart$/,
    handler: () => ({ pageType: 'cart' }),
  },
  {
    pattern: /^\/404$/,
    handler: () => ({ pageType: '404' }),
  },

  // ===== CASOS DE COMPATIBILIDAD =====
  {
    pattern: /^\/collections$/,
    handler: () => ({ pageType: 'collection' }),
  },
  {
    pattern: /^\/products$/,
    handler: () => ({ pageType: 'product' }),
  },
];

/**
 * Convierte un path a opciones usando matchers declarativos
 */
export function pathToRenderOptions(path: string): PageRenderOptions {
  // Buscar primer matcher que coincida
  for (const { pattern, handler } of routeMatchers) {
    const match = path.match(pattern);
    if (match) {
      return handler(match);
    }
  }

  // Fallback para paths no reconocidos
  return { pageType: '404' };
}
