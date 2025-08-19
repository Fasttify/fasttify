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

import type { PageRenderOptions } from '@/renderer-engine/types/template';

/**
 * Tipo para builders de contexto por página
 */
type PageContextBuilder = (loadedData: Record<string, any>, options: PageRenderOptions) => Record<string, any>;

/**
 * Crea un proxy para acceso dinámico a colecciones por handle
 */
function createCollectionsProxy(
  storeId: string,
  collectionsMap: Record<string, any> = {},
  collections: any[] = []
): any {
  // Usar el array completo de colecciones si está disponible, sino usar el map
  const collectionsArray = collections.length > 0 ? collections : Object.values(collectionsMap);

  return new Proxy(collectionsArray, {
    get: (target, prop: string | symbol) => {
      if (typeof prop === 'symbol') {
        return target[prop as keyof typeof target];
      }

      // Propiedades del array (length, métodos, etc.)
      if (prop in target) {
        return target[prop as keyof typeof target];
      }

      // Acceso por handle: collections['handle']
      return collectionsMap[prop] || null;
    },

    has: (target, prop) => {
      if (typeof prop === 'symbol') {
        return prop in target;
      }
      // Verificar si existe en el array o en el mapa
      return prop in target || prop in collectionsMap;
    },

    ownKeys: (target) => {
      // Combinar keys del array con handles
      return [...Object.keys(target), ...Object.keys(collectionsMap)];
    },

    getOwnPropertyDescriptor: (target, prop) => {
      if (prop in target) {
        return Object.getOwnPropertyDescriptor(target, prop);
      }
      if (typeof prop === 'string' && prop in collectionsMap) {
        return { enumerable: true, configurable: true, value: collectionsMap[prop] };
      }
      return undefined;
    },
  });
}

/**
 * Crea un proxy para acceso dinámico a productos por handle
 */
function createProductsProxy(storeId: string, productsMap: Record<string, any> = {}): any {
  return new Proxy(productsMap, {
    get: (target, prop: string | symbol) => {
      if (typeof prop === 'symbol') {
        return undefined;
      }

      if (prop === 'length' || prop === 'toString' || prop === 'valueOf') {
        return target[prop as keyof typeof target];
      }

      return target[prop] || null;
    },

    has: () => true,
    ownKeys: () => Object.keys(productsMap),
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
  });
}

/**
 * Crea un proxy para acceso dinámico a páginas por handle
 */
function createPagesProxy(storeId: string, pagesMap: Record<string, any> = {}): any {
  return new Proxy(pagesMap, {
    get: (target, prop: string | symbol) => {
      if (typeof prop === 'symbol') {
        return undefined;
      }

      if (prop === 'length' || prop === 'toString' || prop === 'valueOf') {
        return target[prop as keyof typeof target];
      }

      return target[prop] || null;
    },

    has: () => true,
    ownKeys: () => Object.keys(pagesMap),
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
  });
}

/**
 * Builders declarativos para cada tipo de página
 */
const pageContextBuilders: Record<string, PageContextBuilder> = {
  index: (loadedData) => ({
    template: 'index',
    page_title: 'Inicio',
  }),

  product: (loadedData) => {
    const baseContext: Record<string, any> = {
      template: 'product',
      page_title: 'Productos',
    };

    if (loadedData.product) {
      baseContext.product = loadedData.product;
      baseContext.page_title = loadedData.product.name;
    }

    // Agregar productos relacionados si existen
    if (loadedData.related_products) {
      baseContext.related_products = loadedData.related_products;
    }

    return baseContext;
  },

  collection: (loadedData) => {
    const baseContext: Record<string, any> = {
      template: 'collection',
      page_title: 'Colecciones',
    };

    if (loadedData.collection) {
      baseContext.collection = loadedData.collection;
      baseContext.page_title = loadedData.collection.title;
    }

    return baseContext;
  },

  cart: (loadedData) => {
    const baseContext: Record<string, any> = {
      template: 'cart',
      page_title: 'Carrito de Compras',
    };

    if (loadedData.cart) {
      baseContext.cart = loadedData.cart;
    }

    return baseContext;
  },

  '404': () => ({
    template: '404',
    page_title: 'Página No Encontrada',
    error_message: 'La página que buscas no existe',
  }),

  search: () => ({
    template: 'search',
    page_title: 'Búsqueda',
  }),

  page: (loadedData, options) => {
    const baseContext: Record<string, any> = {
      template: 'page',
      page_title: options.handle ? options.handle.charAt(0).toUpperCase() + options.handle.slice(1) : 'Página',
    };

    // Si tenemos una página específica cargada, incluirla en el contexto
    if (loadedData.page) {
      baseContext.page = loadedData.page;
      baseContext.page_title = loadedData.page.title;
      baseContext.page_description = loadedData.page.metaDescription || loadedData.page.description;
    }

    return baseContext;
  },

  blog: (loadedData, options) => ({
    template: 'blog',
    page_title: options.handle ? options.handle.charAt(0).toUpperCase() + options.handle.slice(1) : 'Blog',
  }),

  policies: (loadedData, options) => {
    const baseContext: Record<string, any> = {
      template: 'policies',
      page_title: 'Políticas de la Tienda',
    };

    if (loadedData.policies) {
      baseContext.policies = loadedData.policies;
    }

    return baseContext;
  },
  checkout: (loadedData) => {
    const baseContext: Record<string, any> = {
      template: 'checkout',
      page_title: 'Checkout',
    };

    if (loadedData.checkout) {
      baseContext.checkout = loadedData.checkout;
    }

    return baseContext;
  },
  checkout_start: (loadedData) => {
    const baseContext: Record<string, any> = {
      template: 'checkout_start',
      page_title: 'Checkout',
    };

    if (loadedData.checkout) {
      baseContext.checkout = loadedData.checkout;
    }

    return baseContext;
  },
};

/**
 * Construye el contextData específico para el tipo de página usando builders declarativos.
 */
export async function buildContextData(
  storeId: string,
  options: PageRenderOptions,
  loadedData: Record<string, any>
): Promise<Record<string, any>> {
  const builder = pageContextBuilders[options.pageType];

  let contextData: Record<string, any> = {};

  if (builder) {
    contextData = builder(loadedData, options);
  } else {
    // Fallback para tipos no definidos
    contextData = {
      template: options.pageType,
      page_title: options.pageType.charAt(0).toUpperCase() + options.pageType.slice(1),
    };
  }

  // Inyectar objetos proxy para acceso dinámico por handle
  if (loadedData.collections_map && Object.keys(loadedData.collections_map).length > 0) {
    contextData.collections = createCollectionsProxy(storeId, loadedData.collections_map);
  }

  // Si tenemos el array completo de collections, usarlo en lugar del map
  if (loadedData.collections && Array.isArray(loadedData.collections)) {
    // Crear un mapa para acceso por handle usando todas las colecciones
    const allCollectionsMap: Record<string, any> = {};
    loadedData.collections.forEach((collection: any) => {
      if (collection.slug) {
        allCollectionsMap[collection.slug] = collection;
      }
      // También agregar por handle alternativo si existe
      const altHandle = collection.title?.toLowerCase().replace(/\s+/g, '-');
      if (altHandle && altHandle !== collection.slug) {
        allCollectionsMap[altHandle] = collection;
      }
    });

    // Combinar con collections_map si existe
    const finalCollectionsMap = { ...allCollectionsMap, ...loadedData.collections_map };
    contextData.collections = createCollectionsProxy(storeId, finalCollectionsMap, loadedData.collections);
  }

  if (loadedData.products_map && Object.keys(loadedData.products_map).length > 0) {
    contextData.products_by_handle = createProductsProxy(storeId, loadedData.products_map);
  }

  // Inyectar páginas por handle si existen
  if (loadedData.pages_map && Object.keys(loadedData.pages_map).length > 0) {
    contextData.pages = createPagesProxy(storeId, loadedData.pages_map);
  }

  return contextData;
}
