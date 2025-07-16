import { contextBuilder } from '@/renderer-engine/services/rendering/global-context';
import type { RenderingData } from '@/renderer-engine/renderers/dynamic-page-renderer';

/**
 * Paso 5: Construir contexto de renderizado
 */
export async function buildContextStep(data: RenderingData): Promise<RenderingData> {
  const context = await contextBuilder.createRenderContext(
    data.store!,
    data.pageData!.products,
    data.storeTemplate!,
    data.pageData!.cartData
  );

  // Combinar datos dinámicos
  Object.assign(context, data.pageData!.contextData);

  // Agregar tokens de paginación
  if (data.pageData!.nextToken) {
    (context as any).next_token = data.pageData!.nextToken;
  }

  if (data.searchParams.token) {
    (context as any).current_token = data.searchParams.token;
  }

  // Agregar objeto request para el tag paginate
  const searchParams = new URLSearchParams(Object.entries(data.searchParams).map(([key, value]) => [key, value]));

  // Añadir searchTerm al searchParams si existe
  if (data.options.searchTerm) {
    searchParams.set('q', data.options.searchTerm);
  }

  (context as any).request = {
    searchParams,
  };

  return { ...data, context };
}
