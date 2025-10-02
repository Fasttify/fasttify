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

import type { PageRenderOptions } from '@/liquid-forge/types/template';

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
    pattern: /^\/search(?:\?q=(.*))?$/,
    handler: (match) => ({
      pageType: 'search',
      searchTerm: match[1],
    }),
  },
  {
    pattern: /^\/cart$/,
    handler: () => ({ pageType: 'cart' }),
  },
  {
    pattern: /^\/404$/,
    handler: () => ({ pageType: '404' }),
  },

  // ===== CHECKOUT =====
  {
    pattern: /^\/checkouts\/start$/,
    handler: () => ({ pageType: 'checkout_start' }),
  },
  {
    pattern: /^\/checkouts\/cn\/([a-zA-Z0-9_-]+)\/confirmation$/,
    handler: (match) => ({
      pageType: 'checkout_confirmation',
      checkoutToken: match[1],
    }),
  },
  {
    pattern: /^\/checkouts\/cn\/([a-zA-Z0-9_-]+)$/,
    handler: (match) => ({
      pageType: 'checkout',
      checkoutToken: match[1],
    }),
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
