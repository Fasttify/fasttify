/**
 * Cargador de filtros desde la URL
 */
export class URLLoader {
  /**
   * Carga los filtros desde los parámetros de la URL
   */
  static loadFiltersFromURL(container, filterState) {
    const url = new URL(window.location);
    let hasFilters = false;

    // Cargar ordenamiento
    const sort = url.searchParams.get('sort_by');
    if (sort) {
      const sortSelect = container.querySelector('[data-filter="sort"]');
      if (sortSelect) {
        sortSelect.value = sort;
        filterState.updateProperty('sort', sort);
        hasFilters = true;
      }
    }

    // Cargar rango de precios
    const priceMin = url.searchParams.get('price_min');
    const priceMax = url.searchParams.get('price_max');

    if (priceMin) {
      const priceMinInput = container.querySelector('[data-filter="price-min"]');
      if (priceMinInput) {
        priceMinInput.value = priceMin;
        filterState.updateProperty('priceMin', priceMin);
        hasFilters = true;
      }
    }

    if (priceMax) {
      const priceMaxInput = container.querySelector('[data-filter="price-max"]');
      if (priceMaxInput) {
        priceMaxInput.value = priceMax;
        filterState.updateProperty('priceMax', priceMax);
        hasFilters = true;
      }
    }

    // Cargar filtros múltiples
    hasFilters = this.loadMultipleFilter(container, filterState, 'categories', 'category') || hasFilters;
    hasFilters = this.loadMultipleFilter(container, filterState, 'tags', 'tag') || hasFilters;
    hasFilters = this.loadMultipleFilter(container, filterState, 'vendors', 'vendor') || hasFilters;
    hasFilters = this.loadMultipleFilter(container, filterState, 'collections', 'collection') || hasFilters;

    return hasFilters;
  }

  /**
   * Carga un filtro múltiple desde la URL
   */
  static loadMultipleFilter(container, filterState, paramName, filterType) {
    const url = new URL(window.location);
    const values = url.searchParams.get(paramName);

    if (!values) return false;

    const valueArray = values.split(',');
    let hasFilters = false;

    valueArray.forEach((value) => {
      const checkbox = container.querySelector(`[data-filter="${filterType}"][value="${value}"]`);
      if (checkbox) {
        checkbox.checked = true;
        const currentArray = filterState.getProperty(filterType + 's');
        currentArray.push(value);
        filterState.updateProperty(filterType + 's', currentArray);
        hasFilters = true;
      }
    });

    return hasFilters;
  }

  /**
   * Obtiene los parámetros de filtro de la URL
   */
  static getURLParams() {
    const url = new URL(window.location);
    return {
      sort: url.searchParams.get('sort_by'),
      priceMin: url.searchParams.get('price_min'),
      priceMax: url.searchParams.get('price_max'),
      categories: url.searchParams.get('categories')?.split(',') || [],
      tags: url.searchParams.get('tags')?.split(',') || [],
      vendors: url.searchParams.get('vendors')?.split(',') || [],
      collections: url.searchParams.get('collections')?.split(',') || [],
    };
  }
}
