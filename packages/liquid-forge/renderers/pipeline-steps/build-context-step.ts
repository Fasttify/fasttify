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

import type { RenderingData } from '../dynamic-page-renderer';
import { contextBuilder } from '../../services/rendering/global-context';

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
