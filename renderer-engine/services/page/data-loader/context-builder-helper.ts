import type { PageRenderOptions } from '@/renderer-engine/types/template'

/**
 * Tipo para builders de contexto por página
 */
type PageContextBuilder = (
  loadedData: Record<string, any>,
  options: PageRenderOptions
) => Record<string, any>

/**
 * Crea un proxy para acceso dinámico a colecciones por handle
 */
function createCollectionsProxy(
  storeId: string,
  collectionsMap: Record<string, any> = {}
): any {
  return new Proxy(collectionsMap, {
    get: (target, prop: string | symbol) => {
      if (typeof prop === 'symbol') {
        return undefined
      }

      // Propiedades especiales del objeto
      if (prop === 'length' || prop === 'toString' || prop === 'valueOf') {
        return target[prop as keyof typeof target]
      }

      // Buscar colección por handle en el mapa cargado
      return target[prop] || null
    },

    has: () => true,
    ownKeys: () => Object.keys(collectionsMap),
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
  })
}

/**
 * Crea un proxy para acceso dinámico a productos por handle
 */
function createProductsProxy(
  storeId: string,
  productsMap: Record<string, any> = {}
): any {
  return new Proxy(productsMap, {
    get: (target, prop: string | symbol) => {
      if (typeof prop === 'symbol') {
        return undefined
      }

      if (prop === 'length' || prop === 'toString' || prop === 'valueOf') {
        return target[prop as keyof typeof target]
      }

      return target[prop] || null
    },

    has: () => true,
    ownKeys: () => Object.keys(productsMap),
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
  })
}

/**
 * Builders declarativos para cada tipo de página
 */
const pageContextBuilders: Record<string, PageContextBuilder> = {
  index: loadedData => ({
    template: 'index',
    page_title: 'Inicio',
  }),

  product: loadedData => {
    const baseContext: Record<string, any> = {
      template: 'product',
      page_title: 'Productos',
    }

    if (loadedData.product) {
      baseContext.product = loadedData.product
      baseContext.page_title = loadedData.product.name
    }

    // Agregar productos relacionados si existen
    if (loadedData.related_products) {
      baseContext.related_products = loadedData.related_products
    }

    return baseContext
  },

  collection: loadedData => {
    const baseContext: Record<string, any> = {
      template: 'collection',
      page_title: 'Colección',
    }

    if (loadedData.collection) {
      baseContext.collection = loadedData.collection
      baseContext.page_title = loadedData.collection.title
    }

    return baseContext
  },

  cart: loadedData => {
    const baseContext: Record<string, any> = {
      template: 'cart',
      page_title: 'Carrito de Compras',
    }

    if (loadedData.cart) {
      baseContext.cart = loadedData.cart
    }

    return baseContext
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

  page: (loadedData, options) => ({
    template: 'page',
    page_title: options.handle
      ? options.handle.charAt(0).toUpperCase() + options.handle.slice(1)
      : 'Página',
  }),

  blog: (loadedData, options) => ({
    template: 'blog',
    page_title: options.handle
      ? options.handle.charAt(0).toUpperCase() + options.handle.slice(1)
      : 'Blog',
  }),
}

/**
 * Construye el contextData específico para el tipo de página usando builders declarativos.
 */
export async function buildContextData(
  storeId: string,
  options: PageRenderOptions,
  loadedData: Record<string, any>
): Promise<Record<string, any>> {
  const builder = pageContextBuilders[options.pageType]

  let contextData: Record<string, any> = {}

  if (builder) {
    contextData = builder(loadedData, options)
  } else {
    // Fallback para tipos no definidos
    contextData = {
      template: options.pageType,
      page_title: options.pageType.charAt(0).toUpperCase() + options.pageType.slice(1),
    }
  }

  // Inyectar objetos proxy para acceso dinámico por handle
  if (loadedData.collections_map && Object.keys(loadedData.collections_map).length > 0) {
    contextData.collections = createCollectionsProxy(storeId, loadedData.collections_map)
  }

  if (loadedData.products_map && Object.keys(loadedData.products_map).length > 0) {
    contextData.products_by_handle = createProductsProxy(storeId, loadedData.products_map)
  }

  // Inyectar productos por colección si existen
  if (
    loadedData.collection_products_map &&
    Object.keys(loadedData.collection_products_map).length > 0
  ) {
    // Extender el proxy de collections para incluir productos
    const collectionsWithProducts = { ...loadedData.collections_map }

    Object.entries(loadedData.collection_products_map).forEach(([handle, products]) => {
      if (collectionsWithProducts[handle]) {
        collectionsWithProducts[handle] = {
          ...collectionsWithProducts[handle],
          products: products,
        }
      } else {
        // Crear un objeto de colección básico con solo productos
        collectionsWithProducts[handle] = {
          products: products,
          title: handle.charAt(0).toUpperCase() + handle.slice(1),
          handle: handle,
        }
      }
    })

    contextData.collections = createCollectionsProxy(storeId, collectionsWithProducts)
  }

  return contextData
}
