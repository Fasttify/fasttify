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

import { FilterDataFetcher } from './data-fetcher';
import { FilterHtmlGenerator } from './html-generator';
import { FilterJavaScriptGenerator } from './javascript-generator';
import { FilterConfig } from './types';

export class FilterSystem {
  /**
   * Genera el sistema completo de filtros
   */
  static async generate(config: FilterConfig): Promise<string> {
    try {
      // Obtener filtros disponibles
      const availableFilters = await FilterDataFetcher.getAvailableFilters(config.storeId);

      // Generar HTML
      const html = FilterHtmlGenerator.generate(config, availableFilters);

      // Generar JavaScript
      const javascript = FilterJavaScriptGenerator.generate(config);

      // Combinar todo
      return html + javascript;
    } catch (error) {
      console.error('Error generating filters:', error);
      return this.generateFallback(config);
    }
  }

  /**
   * Genera un fallback simple si hay errores
   */
  private static generateFallback(config: FilterConfig): string {
    const cssClass = config.cssClass || 'custom-filters';

    return `
      <div class="${cssClass}">
        <div class="${cssClass}__error">
          <p>Error cargando filtros. Por favor, recarga la página.</p>
        </div>
      </div>
      <style>
        .${cssClass}__error {
          padding: 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 4px;
          color: #dc2626;
        }
      </style>
    `;
  }

  /**
   * Valida la configuración del filtro
   */
  static validateConfig(config: FilterConfig): boolean {
    if (!config.storeId) {
      console.error('Error: storeId is required');
      return false;
    }

    if (!config.productsPerPage || config.productsPerPage <= 0) {
      console.error('Error: productsPerPage must be greater than 0');
      return false;
    }

    return true;
  }

  /**
   * Obtiene configuración por defecto
   */
  static getDefaultConfig(storeId: string): FilterConfig {
    return {
      storeId,
      productsPerPage: 20,
      cssClass: 'custom-filters',
      style: 'sidebar',
      title: 'Filtros',
      showCounts: true,
      showPriceRange: true,
      showSortOptions: true,
      showClearButton: true,
      maxCategories: 10,
      maxTags: 15,
      maxVendors: 10,
      maxCollections: 10,
      infiniteScroll: true,
      scrollThreshold: 100,
      debounceDelay: 300,
      loadingMessage: 'Cargando productos...',
      noResultsMessage: 'No se encontraron productos',
      errorMessage: 'Error cargando productos',
      clearFiltersText: 'Limpiar filtros',
    };
  }
}

// Exportar clases individuales para uso directo
export { FilterDataFetcher } from './data-fetcher';
export { FiltersTag } from './filters-tag';
export { FilterHtmlGenerator } from './html-generator';
export { FilterJavaScriptGenerator } from './javascript-generator';
export * from './types';
