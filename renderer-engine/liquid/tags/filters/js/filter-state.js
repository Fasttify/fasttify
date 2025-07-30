import { INITIAL_FILTER_STATE } from 'https://cdn.fasttify.com/assets/filter-config.js';

/**
 * Gestor del estado del filtro
 */
export class FilterStateManager {
  constructor() {
    this.state = { ...INITIAL_FILTER_STATE };
  }

  /**
   * Actualiza el estado de filtros desde el DOM
   */
  updateFromDOM(filterInputs) {
    const newState = {
      sort: '',
      priceMin: '',
      priceMax: '',
      categories: [],
      tags: [],
      vendors: [],
      collections: [],
    };

    filterInputs.forEach((input) => {
      const filterType = input.getAttribute('data-filter');
      const value = input.value;

      if (input.type === 'checkbox') {
        if (input.checked) {
          switch (filterType) {
            case 'category':
              newState.categories.push(value);
              break;
            case 'tag':
              newState.tags.push(value);
              break;
            case 'vendor':
              newState.vendors.push(value);
              break;
            case 'collection':
              newState.collections.push(value);
              break;
          }
        }
      } else if (input.type === 'select-one') {
        if (filterType === 'sort') {
          newState.sort = value;
        }
      } else if (input.type === 'number') {
        if (filterType === 'price-min') {
          newState.priceMin = value;
        } else if (filterType === 'price-max') {
          newState.priceMax = value;
        }
      }
    });

    this.state = { ...this.state, ...newState };
  }

  /**
   * Resetea el estado a los valores iniciales
   */
  reset() {
    this.state = { ...INITIAL_FILTER_STATE };
  }

  /**
   * Verifica si hay filtros activos
   */
  hasActiveFilters() {
    return (
      this.state.sort ||
      this.state.priceMin ||
      this.state.priceMax ||
      this.state.categories.length > 0 ||
      this.state.tags.length > 0 ||
      this.state.vendors.length > 0 ||
      this.state.collections.length > 0
    );
  }

  /**
   * Obtiene el estado actual
   */
  getState() {
    return this.state;
  }

  /**
   * Actualiza una propiedad específica del estado
   */
  updateProperty(key, value) {
    this.state[key] = value;
  }

  /**
   * Obtiene una propiedad específica del estado
   */
  getProperty(key) {
    return this.state[key];
  }
}
