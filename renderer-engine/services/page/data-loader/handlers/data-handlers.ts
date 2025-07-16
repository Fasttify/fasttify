import { logger } from '@/renderer-engine/lib/logger';
import { dataFetcher } from '@/renderer-engine/services/fetchers/data-fetcher';
import type { DataLoadOptions, DataRequirement } from '@/renderer-engine/services/templates/template-analyzer';
import type { PageRenderOptions } from '@/renderer-engine/types/template';

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
      limit: options.limit || 20,
      nextToken: options.nextToken,
    });
  },

  collection_products: async (storeId, options) => {
    return await dataFetcher.getFeaturedProducts(storeId, options.limit || 8);
  },

  collections: async (storeId, options) => {
    const collectionsResult = await dataFetcher.getStoreCollections(storeId, {
      limit: options.limit || 10,
      nextToken: options.nextToken,
    });
    return collectionsResult.collections;
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
          limit: options.limit || 8,
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
        limit: (options.limit || 4) + 1, // Uno extra para filtrar el actual
      });

      return productsResult.products
        .filter((p) => p.id !== currentProduct.id && p.category === currentProduct.category)
        .slice(0, options.limit || 4);
    }

    // Fallback: productos aleatorios
    const productsResult = await dataFetcher.getStoreProducts(storeId, {
      limit: (options.limit || 4) + 1,
    });

    return productsResult.products.filter((p) => p.id !== currentProduct.id).slice(0, options.limit || 4);
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

  cart: async (storeId) => {
    const cart = await dataFetcher.getCart(storeId);
    return dataFetcher.transformCartToContext(cart);
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
      limit: options.limit || 10,
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
