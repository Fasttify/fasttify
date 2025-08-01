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
