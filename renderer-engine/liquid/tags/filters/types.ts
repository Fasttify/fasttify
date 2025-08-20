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
 * Tipos para el sistema de filtros modular
 */

// Tipos básicos para filtros
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface PriceRange {
  min: number;
  max: number;
  currentMin?: number;
  currentMax?: number;
}

export interface SortOption {
  value: string;
  label: string;
}

// Filtros disponibles desde la API
export interface AvailableFilters {
  categories: FilterOption[];
  tags: FilterOption[];
  vendors: FilterOption[];
  collections: FilterOption[];
  priceRange: PriceRange;
  sortOptions: SortOption[];
  availability?: FilterOption[];
  colors?: FilterOption[];
}

// Filtros aplicados por el usuario
export interface AppliedFilters {
  categories?: string[];
  tags?: string[];
  vendors?: string[];
  collections?: string[];
  priceMin?: number;
  priceMax?: number;
  sortBy?: string;
}

// Configuración del sistema de filtros
export interface FilterConfig {
  // Identificación
  storeId: string;
  productsPerPage: number;

  // Personalización de UI
  cssClass?: string;
  style?: 'sidebar' | 'horizontal' | 'modal' | 'dropdown';
  title?: string;

  // Opciones de visualización
  showCounts?: boolean;
  showPriceRange?: boolean;
  showSortOptions?: boolean;
  showClearButton?: boolean;
  showAvailabilityFilter?: boolean;
  showColorFilter?: boolean;

  // Límites
  maxCategories?: number;
  maxTags?: number;
  maxVendors?: number;
  maxCollections?: number;
  maxColors?: number;

  // Comportamiento
  autoApply?: boolean;
  debounceMs?: number;
  debounceDelay?: number;
  infiniteScroll?: boolean;
  scrollThreshold?: number;
  scrollThresholdPercentage?: number;

  // Mensajes
  noResultsMessage?: string;
  loadingMessage?: string;
  clearFiltersText?: string;
  errorMessage?: string;

  // Selectores CSS
  productGridSelector?: string;
  paginationSelector?: string;

  // Plantillas personalizadas
  productTemplate?: string;
  filterTemplate?: string;

  // Estado
  preserveState?: boolean;
}

// Respuesta de la API de filtros
export interface FilterResponse {
  products: Product[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
    totalResults: number;
  };
  totalCount: number;
  filters_applied: any[];
  available_filters: {
    categories: string[];
    tags: string[];
    price_range: {
      min: number;
      max: number;
    };
    sort_options: SortOption[];
    vendors?: string[];
    collections?: string[];
  };
}

// Estructura de producto
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  category: string;
  images: ProductImage[];
  status: string;
  slug?: string;
  featured?: boolean;
  tags: string;
  createdAt: string;
  updatedAt: string;
  vendor?: string;
  sales_count: number;
}

export interface ProductImage {
  url: string;
  alt: string;
}

// Eventos del sistema de filtros
export interface FilterEvent {
  type: 'filter_changed' | 'filters_cleared' | 'products_loaded' | 'loading_started' | 'loading_finished' | 'error';
  data?: any;
}

// Estado del sistema de filtros
export interface FilterState {
  appliedFilters: AppliedFilters;
  isLoading: boolean;
  hasMore: boolean;
  currentOffset: number;
  totalResults: number;
  products: Product[];
}
