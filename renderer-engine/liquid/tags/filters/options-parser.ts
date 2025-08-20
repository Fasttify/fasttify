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

import { FilterConfig } from './types';

export class FilterOptionsParser {
  /**
   * Parsea los argumentos del tag Liquid y los convierte en configuración
   */
  static parse(args: string[], storeId: string, productsPerPage: number): FilterConfig {
    const config: FilterConfig = {
      storeId,
      productsPerPage,
      // Valores por defecto
      cssClass: 'custom-filters',
      style: 'sidebar',
      title: 'Filtros',
      showCounts: true,
      showPriceRange: true,
      showSortOptions: true,
      showClearButton: true,
      autoApply: true,
      debounceMs: 500,
      infiniteScroll: true,
      noResultsMessage: 'No se encontraron productos con estos filtros',
      loadingMessage: 'Cargando productos...',
      clearFiltersText: 'Limpiar filtros',
      productGridSelector: '.product-grid[data-infinite-scroll="true"]',
      paginationSelector: '.product-grid-paginated',
      preserveState: true,
    };

    // Procesar argumentos
    for (const arg of args) {
      this.applyConfigValue(config, arg);
    }

    return config;
  }

  /**
   * Aplica un valor de configuración basado en el argumento
   */
  private static applyConfigValue(config: FilterConfig, arg: string): void {
    const [key, value] = arg.split('=');

    if (!key || !value) return;

    switch (key.trim()) {
      // Personalización de UI
      case 'css_class':
        config.cssClass = value.trim();
        break;
      case 'style':
        if (['sidebar', 'horizontal', 'modal', 'dropdown'].includes(value.trim())) {
          config.style = value.trim() as any;
        }
        break;
      case 'title':
        config.title = value.trim();
        break;

      // Opciones de visualización
      case 'show_counts':
        config.showCounts = value.trim() === 'true';
        break;
      case 'show_price_range':
        config.showPriceRange = value.trim() === 'true';
        break;
      case 'show_sort_options':
        config.showSortOptions = value.trim() === 'true';
        break;
      case 'show_clear_button':
        config.showClearButton = value.trim() === 'true';
        break;

      // Límites
      case 'max_categories':
        config.maxCategories = parseInt(value.trim());
        break;
      case 'max_tags':
        config.maxTags = parseInt(value.trim());
        break;
      case 'max_vendors':
        config.maxVendors = parseInt(value.trim());
        break;
      case 'max_collections':
        config.maxCollections = parseInt(value.trim());
        break;

      // Comportamiento
      case 'auto_apply':
        config.autoApply = value.trim() === 'true';
        break;
      case 'debounce_ms':
        config.debounceMs = parseInt(value.trim());
        break;
      case 'infinite_scroll':
        config.infiniteScroll = value.trim() === 'true';
        break;

      // Mensajes
      case 'no_results_message':
        config.noResultsMessage = value.trim();
        break;
      case 'loading_message':
        config.loadingMessage = value.trim();
        break;
      case 'clear_filters_text':
        config.clearFiltersText = value.trim();
        break;

      // Selectores CSS
      case 'product_grid_selector':
        config.productGridSelector = value.trim();
        break;
      case 'pagination_selector':
        config.paginationSelector = value.trim();
        break;

      // Plantillas personalizadas
      case 'product_template':
        config.productTemplate = value.trim();
        break;
      case 'filter_template':
        config.filterTemplate = value.trim();
        break;

      // Estado
      case 'preserve_state':
        config.preserveState = value.trim() === 'true';
        break;
    }
  }

  /**
   * Valida la configuración y aplica valores por defecto si es necesario
   */
  static validate(config: FilterConfig): FilterConfig {
    // Asegurar valores mínimos
    if (!config.debounceMs || config.debounceMs < 100) {
      config.debounceMs = 500;
    }

    if (!config.productsPerPage || config.productsPerPage < 1) {
      config.productsPerPage = 50;
    }

    // Asegurar límites razonables
    if (config.maxCategories && config.maxCategories > 50) {
      config.maxCategories = 50;
    }

    if (config.maxTags && config.maxTags > 100) {
      config.maxTags = 100;
    }

    if (config.maxVendors && config.maxVendors > 50) {
      config.maxVendors = 50;
    }

    if (config.maxCollections && config.maxCollections > 50) {
      config.maxCollections = 50;
    }

    // Forzar infinite scroll para filtros
    config.infiniteScroll = true;

    return config;
  }
}
