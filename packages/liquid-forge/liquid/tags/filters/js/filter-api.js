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

/**
 * Gestor de API para el sistema de filtros
 */
export class FilterAPI {
  constructor(apiEndpoint) {
    this.apiEndpoint = apiEndpoint;
  }

  /**
   * Construye los parámetros de filtro para la API
   */
  buildFilterParams(filterState) {
    const params = {
      limit: 50,
    };

    if (filterState.nextToken) {
      params.token = filterState.nextToken;
    }

    if (filterState.sort) {
      params.sort_by = filterState.sort;
    }

    if (filterState.priceMin) {
      params.price_min = filterState.priceMin;
    }

    if (filterState.priceMax) {
      params.price_max = filterState.priceMax;
    }

    if (filterState.categories.length > 0) {
      params.categories = filterState.categories.join(',');
    }

    if (filterState.tags.length > 0) {
      params.tags = filterState.tags.join(',');
    }

    if (filterState.vendors.length > 0) {
      params.vendors = filterState.vendors.join(',');
    }

    if (filterState.collections.length > 0) {
      params.collections = filterState.collections.join(',');
    }

    return params;
  }

  /**
   * Realiza la llamada a la API para obtener productos filtrados
   */
  async fetchFilteredProducts(filterState) {
    const params = this.buildFilterParams(filterState);
    const url = this.apiEndpoint + '?' + new URLSearchParams(params);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error in server response');
    }

    const data = await response.json();
    return data;
  }

  /**
   * Construye la URL completa para la API
   */
  buildURL(params) {
    return this.apiEndpoint + '?' + new URLSearchParams(params);
  }
}
