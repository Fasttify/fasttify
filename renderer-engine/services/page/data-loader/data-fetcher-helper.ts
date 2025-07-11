import { logger } from '@/renderer-engine/lib/logger';
import { dataFetcher } from '@/renderer-engine/services/fetchers/data-fetcher';
import type {
  DataLoadOptions,
  DataRequirement,
  TemplateAnalysis,
} from '@/renderer-engine/services/templates/template-analyzer';
import type { PageRenderOptions, PaginationInfo } from '@/renderer-engine/types/template';

/**
 * Tipo para las funciones handlers de datos
 */
type DataHandler = (storeId: string, options: DataLoadOptions, pageOptions: PageRenderOptions) => Promise<any>;

/**
 * Tipo para procesadores de respuesta de datos
 */
type ResponseProcessor = (
  data: any,
  dataType: DataRequirement,
  loadedData: Record<string, any>,
  paginationInfo: PaginationInfo
) => void;

/**
 * Handlers declarativos para cada tipo de datos
 */
const dataHandlers: Record<DataRequirement, DataHandler> = {
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
 * Procesadores declarativos para respuestas de datos
 */
const responseProcessors: Record<DataRequirement, ResponseProcessor> = {
  products: (data, dataType, loadedData, paginationInfo) => {
    if (typeof data === 'object' && 'products' in data) {
      loadedData[dataType] = data.products;
      if (data.nextToken) paginationInfo.nextToken = data.nextToken;
      if (data.totalCount) paginationInfo.totalItems = data.totalCount;
    } else {
      loadedData[dataType] = data;
    }
  },

  collections: (data, dataType, loadedData, paginationInfo) => {
    if (typeof data === 'object' && 'collections' in data) {
      loadedData[dataType] = data.collections;
      if (data.nextToken) paginationInfo.nextToken = data.nextToken;
      if (data.totalCount) paginationInfo.totalItems = data.totalCount;
    } else {
      loadedData[dataType] = data;
    }
  },

  collection: (data, dataType, loadedData, paginationInfo) => {
    if (typeof data === 'object' && 'nextToken' in data) {
      loadedData.collection = data;
      if (data.nextToken) paginationInfo.nextToken = data.nextToken;
    } else {
      loadedData[dataType] = data;
    }
  },

  specific_collection: (data, dataType, loadedData) => {
    if (!loadedData.collections_map) {
      loadedData.collections_map = {};
    }
    Object.assign(loadedData.collections_map, data);
  },

  specific_product: (data, dataType, loadedData) => {
    if (!loadedData.products_map) {
      loadedData.products_map = {};
    }
    Object.assign(loadedData.products_map, data);
  },

  products_by_collection: (data, dataType, loadedData) => {
    if (!loadedData.collection_products_map) {
      loadedData.collection_products_map = {};
    }
    Object.assign(loadedData.collection_products_map, data);
  },

  // Para estos tipos, simplemente asignar directamente
  collection_products: (data, dataType, loadedData) => {
    loadedData[dataType] = data;
  },

  product: (data, dataType, loadedData) => {
    loadedData[dataType] = data;
  },

  cart: (data, dataType, loadedData) => {
    loadedData[dataType] = data;
  },

  linklists: (data, dataType, loadedData) => {
    loadedData[dataType] = data;
  },

  shop: (data, dataType, loadedData) => {
    loadedData[dataType] = data;
  },

  page: (data, dataType, loadedData) => {
    loadedData[dataType] = data;
  },

  policies: (data, dataType, loadedData) => {
    loadedData[dataType] = data;
  },

  blog: (data, dataType, loadedData) => {
    loadedData[dataType] = data;
  },

  pagination: (data, dataType, loadedData) => {
    // No hacer nada, la paginación se maneja por separado
  },

  related_products: (data, dataType, loadedData) => {
    loadedData[dataType] = data;
  },

  specific_page: (data, dataType, loadedData) => {
    if (!loadedData.pages_map) {
      loadedData.pages_map = {};
    }
    Object.assign(loadedData.pages_map, data);
  },

  pages: (data, dataType, loadedData, paginationInfo) => {
    if (typeof data === 'object' && 'pages' in data) {
      loadedData[dataType] = data.pages;
      if (data.nextToken) paginationInfo.nextToken = data.nextToken;
      if (data.totalCount) paginationInfo.totalItems = data.totalCount;
    } else {
      loadedData[dataType] = data;
    }
  },
};

/**
 * Carga datos basándose en el análisis de plantillas.
 */
export async function loadDataFromAnalysis(
  storeId: string,
  analysis: TemplateAnalysis,
  options: PageRenderOptions,
  searchParams: Record<string, string>,
  schemaLimit?: number
): Promise<{ loadedData: Record<string, any>; paginationInfo: PaginationInfo }> {
  const loadedData: Record<string, any> = {};
  const paginationInfo: PaginationInfo = {};
  const loadPromises: Promise<void>[] = [];

  for (const [dataType, loadOptions] of analysis.requiredData.entries()) {
    const effectiveLoadOptions = { ...loadOptions };

    // Usar el límite del schema si está presente y el data type es paginable
    if (schemaLimit && (dataType === 'products' || dataType === 'collections' || dataType === 'collection_products')) {
      effectiveLoadOptions.limit = schemaLimit;
    }

    if (searchParams.token) {
      effectiveLoadOptions.nextToken = searchParams.token;
    }

    const promise = loadSpecificData(storeId, dataType, effectiveLoadOptions, options)
      .then((data) => {
        if (data) {
          const processor = responseProcessors[dataType];
          if (processor) {
            processor(data, dataType, loadedData, paginationInfo);
          } else {
            // Fallback para tipos no procesados
            loadedData[dataType] = data;
          }
        }
      })
      .catch((error) => {
        logger.warn(`Failed to load ${dataType}`, error, 'DynamicDataLoader');
      });

    loadPromises.push(promise);
  }

  await Promise.all(loadPromises);
  return { loadedData, paginationInfo };
}

/**
 * Carga un tipo específico de datos usando handlers declarativos.
 */
async function loadSpecificData(
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
