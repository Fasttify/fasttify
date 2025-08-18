import type { RenderingData } from '@/renderer-engine/renderers/dynamic-page-renderer';
import { contextBuilder } from '@/renderer-engine/services/rendering/global-context';

/**
 * Helper para exponer solo propiedades definidas
 */
function exposeIfDefined(target: any, source: Record<string, any>, keys: string[]) {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      target[key] = source[key];
    }
  }
}

/**
 * Paso 5: Construir contexto de renderizado
 */
export async function buildContextStep(data: RenderingData): Promise<RenderingData> {
  const context = await contextBuilder.createRenderContext(
    data.store!,
    data.pageData!.products,
    data.storeTemplate!,
    data.pageData!.cartData,
    data.navigationMenus,
    data.pageData!.contextData.checkout // Pasar datos de checkout si existen
  );

  // Combinar datos dinámicos
  Object.assign(context, data.pageData!.contextData);

  // Exponer variables opcionales de paginación y búsqueda
  exposeIfDefined(
    context,
    {
      next_token: data.pageData!.nextToken,
      current_token: data.searchParams.token,
      search_products_limit: data.pageData?.searchProductsLimit,
    },
    ['next_token', 'current_token', 'search_products_limit']
  );

  // Construir searchParams y request
  const searchParams = new URLSearchParams(Object.entries(data.searchParams).map(([key, value]) => [key, value]));
  if (data.options.searchTerm) {
    searchParams.set('q', data.options.searchTerm);
  }
  (context as any).request = { searchParams };

  return { ...data, context };
}
