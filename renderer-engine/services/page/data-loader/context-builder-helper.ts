import type { PageRenderOptions } from '@/renderer-engine/types/template'

/**
 * Construye el contextData específico para el tipo de página.
 */
export async function buildContextData(
  storeId: string,
  options: PageRenderOptions,
  loadedData: Record<string, any>
): Promise<Record<string, any>> {
  const contextData: Record<string, any> = {
    template: options.pageType,
  }

  switch (options.pageType) {
    case 'index':
      contextData.page_title = 'Inicio'
      break
    case 'product':
      if (loadedData.product) {
        contextData.product = loadedData.product
        contextData.page_title = loadedData.product.name
      } else {
        contextData.page_title = 'Productos'
      }
      break
    case 'collection':
      if (loadedData.collection) {
        contextData.collection = loadedData.collection
        contextData.page_title = loadedData.collection.title
      } else {
        contextData.page_title = 'Colección'
      }
      break
    case 'cart':
      contextData.page_title = 'Carrito de Compras'
      if (loadedData.cart) {
        contextData.cart = loadedData.cart
      }
      break
    case '404':
      contextData.page_title = 'Página No Encontrada'
      contextData.error_message = 'La página que buscas no existe'
      break
    default:
      contextData.page_title =
        options.pageType.charAt(0).toUpperCase() + options.pageType.slice(1)
      break
  }

  return contextData
}
