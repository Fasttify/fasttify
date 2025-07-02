import type { LiquidFilter } from '@/renderer-engine/types';

/**
 * Filtro para obtener una colección específica por handle desde el contexto
 * Uso: {{ 'mi-coleccion' | collection_by_handle }}
 * Los datos ya deben estar cargados por el sistema de detección automática
 */
export const collectionByHandleFilter: LiquidFilter = {
  name: 'collection_by_handle',
  filter: function (handle: string, context?: any): any {
    if (!handle || typeof handle !== 'string') {
      return null;
    }

    // Buscar en el contexto de collections
    const collections = context?.collections;
    if (collections && typeof collections === 'object') {
      return collections[handle] || null;
    }

    return null;
  },
};

/**
 * Filtro para obtener un producto específico por handle desde el contexto
 * Uso: {{ 'mi-producto' | product_by_handle }}
 */
export const productByHandleFilter: LiquidFilter = {
  name: 'product_by_handle',
  filter: function (handle: string, context?: any): any {
    if (!handle || typeof handle !== 'string') {
      return null;
    }

    const products = context?.products_by_handle;
    if (products && typeof products === 'object') {
      return products[handle] || null;
    }

    return null;
  },
};

/**
 * Filtro para obtener productos de una colección específica
 * Uso: {{ 'mi-coleccion' | products_from_collection }}
 */
export const productsFromCollectionFilter: LiquidFilter = {
  name: 'products_from_collection',
  filter: function (handle: string, context?: any): any[] {
    if (!handle || typeof handle !== 'string') {
      return [];
    }

    const collections = context?.collections;
    if (collections && typeof collections === 'object') {
      const collection = collections[handle];
      return collection?.products || [];
    }

    return [];
  },
};

/**
 * Filtro para formatear una lista de productos como JSON para JavaScript
 * Uso: {{ products | products_to_json }}
 */
export const productsToJsonFilter: LiquidFilter = {
  name: 'products_to_json',
  filter: function (products: any[]): string {
    if (!Array.isArray(products)) {
      return '[]';
    }

    try {
      // Limpiar los productos para incluir solo datos esenciales
      const cleanProducts = products.map((product) => ({
        id: product.id,
        name: product.name || product.title,
        price: product.price,
        url: product.url,
        image: product.featured_image || (product.images && product.images[0]?.url),
        available: product.quantity > 0,
      }));

      return JSON.stringify(cleanProducts);
    } catch (error) {
      return '[]';
    }
  },
};

/**
 * Filtro para obtener productos relacionados (debe estar ya cargado en el contexto)
 * Uso: {{ related_products | limit: 4 }}
 */
export const limitFilter: LiquidFilter = {
  name: 'limit',
  filter: function (array: any[], limit: number): any[] {
    if (!Array.isArray(array)) {
      return [];
    }

    const maxLimit = Math.max(0, Math.min(50, limit || 10));
    return array.slice(0, maxLimit);
  },
};

export const dataAccessFilters: LiquidFilter[] = [
  collectionByHandleFilter,
  productByHandleFilter,
  productsFromCollectionFilter,
  productsToJsonFilter,
  limitFilter,
];
