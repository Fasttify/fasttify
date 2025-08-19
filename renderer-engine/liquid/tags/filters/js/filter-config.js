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
 * Configuración por defecto para el sistema de filtros
 */
export const DEFAULT_FILTER_CONFIG = {
  infiniteScroll: true,
  scrollThreshold: 500,
  scrollThresholdPercentage: 20,
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
