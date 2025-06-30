import type { PageRenderOptions } from '@/renderer-engine/types/template'

/**
 * Tipo para builders de contexto por página
 */
type PageContextBuilder = (
  loadedData: Record<string, any>,
  options: PageRenderOptions
) => Record<string, any>

/**
 * Builders declarativos para cada tipo de página
 */
const pageContextBuilders: Record<string, PageContextBuilder> = {
  index: () => ({
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

  if (builder) {
    return builder(loadedData, options)
  }

  // Fallback para tipos no definidos
  return {
    template: options.pageType,
    page_title: options.pageType.charAt(0).toUpperCase() + options.pageType.slice(1),
  }
}
