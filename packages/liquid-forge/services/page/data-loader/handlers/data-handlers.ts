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

import { logger } from '../../../../lib/logger';
import { checkoutFetcher } from '../../../fetchers/checkout';
import { dataFetcher } from '../../../fetchers/data-fetcher';
import type { DataLoadOptions, DataRequirement } from '../../../templates/analysis/template-analyzer';
import type { PageRenderOptions } from '../../../../types/template';

/**
 * Tipo para las funciones handlers de datos
 */
export type DataHandler = (storeId: string, options: DataLoadOptions, pageOptions: PageRenderOptions) => Promise<any>;

/**
 * Handlers declarativos para cada tipo de datos
 */
export const dataHandlers: Record<DataRequirement, DataHandler> = {
  products: async (storeId, options) => {
    return await dataFetcher.getStoreProducts(storeId, {
      limit: options.limit || 50,
      nextToken: options.nextToken,
    });
  },

  collection_products: async (storeId, options) => {
    return await dataFetcher.getFeaturedProducts(storeId, options.limit || 50);
  },

  collections: async (storeId, options) => {
    const collectionsResult = await dataFetcher.getStoreCollections(storeId, {
      limit: options.limit || 50,
      nextToken: options.nextToken,
    });
    return collectionsResult;
  },

  // Nuevos handlers para acceso específico por handle
  specific_collection: async (storeId, options) => {
    if (!options.handles || options.handles.length === 0) {
      return {};
    }

    const specificCollections: Record<string, any> = {};

    // Cargar todas las colecciones primero para buscar por handle
    const collectionsResult = await dataFetcher.getStoreCollections(storeId);

    // Para cada handle solicitado, buscar la colección correspondiente
    for (const handle of options.handles) {
      const collectionRef = collectionsResult.collections.find(
        (c) => c.slug === handle || c.title.toLowerCase().replace(/\s+/g, '-') === handle || c.id === handle
      );

      if (collectionRef) {
        // Cargar la colección completa con productos
        const collection = await dataFetcher.getCollection(storeId, collectionRef.id);
        if (collection) {
          specificCollections[handle] = collection;
        }
      }
    }

    return specificCollections;
  },

  specific_product: async (storeId, options) => {
    if (!options.handles || options.handles.length === 0) {
      return {};
    }

    const specificProducts: Record<string, any> = {};

    // Para cada handle solicitado, buscar el producto
    for (const handle of options.handles) {
      const product = await dataFetcher.getProduct(storeId, handle);
      if (product) {
        specificProducts[handle] = product;
      }
    }

    return specificProducts;
  },

  products_by_collection: async (storeId, options) => {
    if (!options.handles || options.handles.length === 0) {
      return {};
    }

    const productsByCollection: Record<string, any[]> = {};

    // Cargar todas las colecciones para buscar por handle
    const collectionsResult = await dataFetcher.getStoreCollections(storeId);

    for (const handle of options.handles) {
      const collectionRef = collectionsResult.collections.find(
        (c) => c.slug === handle || c.title.toLowerCase().replace(/\s+/g, '-') === handle || c.id === handle
      );

      if (collectionRef) {
        const collection = await dataFetcher.getCollection(storeId, collectionRef.id, {
          limit: options.limit || 50,
        });
        if (collection) {
          productsByCollection[handle] = collection.products;
        }
      }
    }

    return productsByCollection;
  },

  related_products: async (storeId, options, pageOptions) => {
    // Este handler necesita el producto actual del contexto de la página
    if (!pageOptions.productId && !pageOptions.handle) {
      return [];
    }

    const currentProduct = await dataFetcher.getProduct(storeId, pageOptions.productId || pageOptions.handle!);

    if (!currentProduct) {
      return [];
    }

    // Obtener productos de la misma categoría
    if (currentProduct.category) {
      const productsResult = await dataFetcher.getStoreProducts(storeId, {
        limit: (options.limit || 50) + 1, // Uno extra para filtrar el actual
      });

      return productsResult.products
        .filter((p) => p.id !== currentProduct.id && p.category === currentProduct.category)
        .slice(0, options.limit || 50);
    }

    // Fallback: productos aleatorios
    const productsResult = await dataFetcher.getStoreProducts(storeId, {
      limit: (options.limit || 50) + 1,
    });

    return productsResult.products.filter((p) => p.id !== currentProduct.id).slice(0, options.limit || 50);
  },

  product: async (storeId, options, pageOptions) => {
    if (pageOptions.productId || pageOptions.handle) {
      const productId = pageOptions.productId || pageOptions.handle!;
      return await dataFetcher.getProduct(storeId, productId);
    }
    return null;
  },

  collection: async (storeId, options, pageOptions) => {
    if (pageOptions.collectionId) {
      return await dataFetcher.getCollection(storeId, pageOptions.collectionId, options);
    } else if (pageOptions.handle) {
      const collectionsResult = await dataFetcher.getStoreCollections(storeId);
      const collectionRef = collectionsResult.collections.find(
        (c) => c.slug === pageOptions.handle || c.title.toLowerCase().replace(/\s+/g, '-') === pageOptions.handle
      );
      if (collectionRef) {
        return await dataFetcher.getCollection(storeId, collectionRef.id, options);
      }
    }
    return null;
  },

  linklists: async (storeId) => {
    return await dataFetcher.getStoreNavigationMenus(storeId);
  },

  shop: async () => {
    return null;
  },

  specific_page: async (storeId, options) => {
    if (!options.handles || options.handles.length === 0) {
      return {};
    }

    const specificPages: Record<string, any> = {};

    // Para cada handle solicitado, buscar la página
    for (const handle of options.handles) {
      const page = await dataFetcher.getPageBySlug(storeId, handle);
      if (page) {
        specificPages[handle] = page;
      }
    }

    return specificPages;
  },

  pages: async (storeId, options) => {
    const pagesResult = await dataFetcher.getVisibleStorePages(storeId, {
      limit: options.limit || 50,
      nextToken: options.nextToken,
    });
    return pagesResult.pages;
  },

  page: async (storeId, pageOptions) => {
    if (pageOptions.handle) {
      return await dataFetcher.getPageBySlug(storeId, pageOptions.handle);
    }
    return null;
  },

  policies: async (storeId) => {
    return await dataFetcher.getPoliciesPages(storeId);
  },

  blog: async (storeId, options) => {
    // Handler para blog, podría implementarse según necesidades
    return null;
  },

  pagination: async () => {
    // Pagination se maneja a nivel de template/request, no es un dato per se
    return null;
  },

  checkout: async (storeId, options, pageOptions) => {
    if (!pageOptions.checkoutToken) {
      logger.warn('Checkout handler called without checkoutToken', undefined, 'DataHandlers');
      return null;
    }

    try {
      const checkoutSession = await checkoutFetcher.getSessionByToken(pageOptions.checkoutToken);

      if (!checkoutSession) {
        logger.warn(`Checkout session not found for token: ${pageOptions.checkoutToken}`, undefined, 'DataHandlers');
        return null;
      }

      // Validar la sesión antes de transformar
      if (!checkoutFetcher.validateSession(checkoutSession)) {
        logger.warn(
          `Checkout session validation failed for token: ${pageOptions.checkoutToken}`,
          undefined,
          'DataHandlers'
        );
        return null;
      }

      // Transformar la sesión a formato compatible con Liquid
      return checkoutFetcher.transformSessionToContext(checkoutSession);
    } catch (error) {
      logger.error('Error loading checkout data', error, 'DataHandlers');
      return null;
    }
  },

  checkout_confirmation: async (storeId, options, pageOptions) => {
    if (!pageOptions.checkoutToken) {
      logger.warn('Checkout confirmation handler called without checkoutToken', undefined, 'DataHandlers');
      return null;
    }

    try {
      // Para la confirmación, necesitamos obtener los datos del checkout completado
      // Esto podría ser una sesión marcada como completada o datos de una orden
      const checkoutSession = await checkoutFetcher.getSessionByToken(pageOptions.checkoutToken);

      if (!checkoutSession) {
        logger.warn(`Checkout session not found for token: ${pageOptions.checkoutToken}`, undefined, 'DataHandlers');
        return null;
      }

      // Validación específica para confirmación - acepta sesiones completadas
      if (!checkoutSession.token || !checkoutSession.storeId) {
        logger.warn('Invalid checkout session: missing required fields', undefined, 'DataHandlers');
        return null;
      }

      if (checkoutSession.status !== 'completed' && checkoutSession.status !== 'open') {
        logger.warn(
          `Checkout session not available for confirmation, status: ${checkoutSession.status}`,
          undefined,
          'DataHandlers'
        );
        return null;
      }

      if (checkoutSession.expiresAt && new Date(checkoutSession.expiresAt) < new Date()) {
        logger.warn(`Checkout session ${checkoutSession.token} has expired`);
        return null;
      }

      // Transformar la sesión a formato compatible con Liquid
      const context = checkoutFetcher.transformSessionToContext(checkoutSession);

      // Agregar información específica de confirmación
      return {
        ...context,
        confirmation: {
          order_number: checkoutSession.sessionId || `ORD-${checkoutSession.token}`,
          completed_at: checkoutSession.updatedAt || new Date().toISOString(),
          payment_status: 'pending', // Esto se puede mejorar cuando se implemente el sistema de pagos
          shipping_status: 'pending',
        },
      };
    } catch (error) {
      logger.error('Error loading checkout confirmation data', error, 'DataHandlers');
      return null;
    }
  },
};

/**
 * Carga un tipo específico de datos usando handlers declarativos.
 */
export async function loadSpecificData(
  storeId: string,
  dataType: DataRequirement,
  options: DataLoadOptions,
  pageOptions: PageRenderOptions
): Promise<any> {
  const handler = dataHandlers[dataType];

  if (!handler) {
    logger.warn(`Unknown data type: ${dataType}`, undefined, 'DynamicDataLoader');
    return null;
  }

  return await handler(storeId, options, pageOptions);
}
