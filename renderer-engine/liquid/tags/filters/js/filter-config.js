/**
 * Configuración por defecto para el sistema de filtros
 */
export const DEFAULT_FILTER_CONFIG = {
  infiniteScroll: true,
  scrollThreshold: 100,
  debounceDelay: 300,
  loadingMessage: 'Cargando productos...',
  noResultsMessage: 'No se encontraron productos',
  errorMessage: 'Error cargando productos',
  title: 'Filtros',
  showCounts: true,
  showPriceRange: true,
  showSortOptions: true,
  showClearButton: true,
  maxCategories: 10,
  maxTags: 15,
  maxVendors: 8,
  maxCollections: 6,
  clearFiltersText: 'Limpiar filtros',
};

/**
 * Estado inicial del filtro
 */
export const INITIAL_FILTER_STATE = {
  sort: '',
  priceMin: '',
  priceMax: '',
  categories: [],
  tags: [],
  vendors: [],
  collections: [],
  nextToken: null,
  hasMore: true,
  isLoading: false,
  allProducts: [],
};

/**
 * Crea la configuración del filtro combinando opciones por defecto con las personalizadas
 */
export function createFilterConfig(customConfig) {
  return {
    ...DEFAULT_FILTER_CONFIG,
    ...customConfig,
  };
}
