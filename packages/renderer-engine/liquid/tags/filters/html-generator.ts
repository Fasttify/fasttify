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

import { AvailableFilters, FilterConfig } from './types';

export class FilterHtmlGenerator {
  /**
   * Genera el HTML estático para el sistema de filtros
   */
  static generate(config: FilterConfig, availableFilters: AvailableFilters): string {
    const cssClass = config.cssClass || 'product-filters';
    const style = config.style || 'sidebar';

    return `
      <div class="${cssClass} ${cssClass}--${style}" data-store-id="${config.storeId}">
        ${this.generateFiltersContainer(config, availableFilters)}
        ${this.generateLoadingIndicator(config)}
      </div>
    `;
  }

  /**
   * Genera el contenedor principal de filtros
   */
  private static generateFiltersContainer(config: FilterConfig, availableFilters: AvailableFilters): string {
    const cssClass = config.cssClass || 'product-filters';

    return `
      <div class="${cssClass}__container">
        <div class="${cssClass}__header">
          <h3 class="${cssClass}__title">${config.title || 'Filtros'}</h3>
          ${config.showClearButton ? this.generateClearButton(config) : ''}
        </div>

        <div class="${cssClass}__filters">
          ${config.showSortOptions ? this.generateSortFilter(config, availableFilters) : ''}
          ${config.showPriceRange ? this.generatePriceFilter(config, availableFilters) : ''}
          ${this.generateCategoriesFilter(config, availableFilters)}
          ${this.generateTagsFilter(config, availableFilters)}
          ${availableFilters.vendors && availableFilters.vendors.length > 0 ? this.generateVendorsFilter(config, availableFilters) : ''}
          ${availableFilters.collections && availableFilters.collections.length > 0 ? this.generateCollectionsFilter(config, availableFilters) : ''}
        </div>
      </div>
    `;
  }

  /**
   * Genera el filtro de ordenamiento
   */
  private static generateSortFilter(config: FilterConfig, availableFilters: AvailableFilters): string {
    const cssClass = config.cssClass || 'product-filters';

    if (!availableFilters.sortOptions || availableFilters.sortOptions.length === 0) {
      return '';
    }

    const options = availableFilters.sortOptions
      .map((option) => `<option value="${option.value}">${option.label}</option>`)
      .join('');

    return `
      <div class="${cssClass}__filter-group">
        <label class="${cssClass}__filter-label">Ordenar por</label>
        <select class="${cssClass}__filter-select" data-filter="sort">
          <option value="">Seleccionar orden</option>
          ${options}
        </select>
      </div>
    `;
  }

  /**
   * Genera el filtro de rango de precios
   */
  private static generatePriceFilter(config: FilterConfig, availableFilters: AvailableFilters): string {
    const cssClass = config.cssClass || 'product-filters';
    const priceRange = availableFilters.priceRange;

    if (!priceRange || priceRange.min === priceRange.max) {
      return '';
    }

    return `
      <div class="${cssClass}__filter-group">
        <label class="${cssClass}__filter-label">Precio</label>
        <div class="${cssClass}__price-range-container">
          <div class="${cssClass}__price-range-slider" data-min="${priceRange.min}" data-max="${priceRange.max}">
            <div class="${cssClass}__price-range-track">
              <div class="${cssClass}__price-range-progress"></div>
            </div>
            <div class="${cssClass}__price-range-handle ${cssClass}__price-range-handle--left" data-handle="left" data-value="${priceRange.min}"></div>
            <div class="${cssClass}__price-range-handle ${cssClass}__price-range-handle--right" data-handle="right" data-value="${priceRange.max}"></div>
          </div>
          <div class="${cssClass}__price-range-inputs">
            <div class="${cssClass}__price-input-wrapper">
              <label class="${cssClass}__price-input-label">Mínimo</label>
              <input
                type="text"
                class="${cssClass}__price-input"
                data-filter="price-min"
                placeholder="${priceRange.min}"
                min="${priceRange.min}"
                max="${priceRange.max}"
                value="${priceRange.min}"
                data-placeholder-formatted="${priceRange.min}"
              />
              <span class="${cssClass}__price-display" data-price-display="min"></span>
            </div>
            <div class="${cssClass}__price-input-wrapper">
              <label class="${cssClass}__price-input-label">Máximo</label>
              <input
                type="text"
                class="${cssClass}__price-input"
                data-filter="price-max"
                placeholder="${priceRange.max}"
                min="${priceRange.min}"
                max="${priceRange.max}"
                value="${priceRange.max}"
                data-placeholder-formatted="${priceRange.max}"
              />
              <span class="${cssClass}__price-display" data-price-display="max"></span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Genera el filtro de categorías
   */
  private static generateCategoriesFilter(config: FilterConfig, availableFilters: AvailableFilters): string {
    const cssClass = config.cssClass || 'product-filters';

    if (!availableFilters.categories || availableFilters.categories.length === 0) {
      return '';
    }

    const maxCategories = config.maxCategories || availableFilters.categories.length;
    const categories = availableFilters.categories.slice(0, maxCategories);

    const checkboxes = categories
      .map((category) => {
        const count = config.showCounts && category.count ? ` (${category.count})` : '';
        return `
        <label class="${cssClass}__checkbox-label">
          <input
            type="checkbox"
            class="${cssClass}__checkbox"
            data-filter="category"
            value="${category.value}"
          />
          <span class="${cssClass}__checkbox-text">${category.label}${count}</span>
        </label>
      `;
      })
      .join('');

    return `
      <div class="${cssClass}__filter-group">
        <label class="${cssClass}__filter-label">Categorías</label>
        <div class="${cssClass}__checkboxes">
          ${checkboxes}
        </div>
      </div>
    `;
  }

  /**
   * Genera el filtro de etiquetas
   */
  private static generateTagsFilter(config: FilterConfig, availableFilters: AvailableFilters): string {
    const cssClass = config.cssClass || 'product-filters';

    if (!availableFilters.tags || availableFilters.tags.length === 0) {
      return '';
    }

    const maxTags = config.maxTags || availableFilters.tags.length;
    const tags = availableFilters.tags.slice(0, maxTags);

    const checkboxes = tags
      .map((tag) => {
        const count = config.showCounts && tag.count ? ` (${tag.count})` : '';
        return `
        <label class="${cssClass}__checkbox-label">
          <input
            type="checkbox"
            class="${cssClass}__checkbox"
            data-filter="tag"
            value="${tag.value}"
          />
          <span class="${cssClass}__checkbox-text">${tag.label}${count}</span>
        </label>
      `;
      })
      .join('');

    return `
      <div class="${cssClass}__filter-group">
        <label class="${cssClass}__filter-label">Etiquetas</label>
        <div class="${cssClass}__checkboxes">
          ${checkboxes}
        </div>
      </div>
    `;
  }

  /**
   * Genera el filtro de vendedores
   */
  private static generateVendorsFilter(config: FilterConfig, availableFilters: AvailableFilters): string {
    const cssClass = config.cssClass || 'product-filters';

    if (!availableFilters.vendors || availableFilters.vendors.length === 0) {
      return '';
    }

    const maxVendors = config.maxVendors || availableFilters.vendors.length;
    const vendors = availableFilters.vendors.slice(0, maxVendors);

    const checkboxes = vendors
      .map((vendor) => {
        const count = config.showCounts && vendor.count ? ` (${vendor.count})` : '';
        return `
        <label class="${cssClass}__checkbox-label">
          <input
            type="checkbox"
            class="${cssClass}__checkbox"
            data-filter="vendor"
            value="${vendor.value}"
          />
          <span class="${cssClass}__checkbox-text">${vendor.label}${count}</span>
        </label>
      `;
      })
      .join('');

    return `
      <div class="${cssClass}__filter-group">
        <label class="${cssClass}__filter-label">Vendedores</label>
        <div class="${cssClass}__checkboxes">
          ${checkboxes}
        </div>
      </div>
    `;
  }

  /**
   * Genera el filtro de colecciones
   */
  private static generateCollectionsFilter(config: FilterConfig, availableFilters: AvailableFilters): string {
    const cssClass = config.cssClass || 'product-filters';

    if (!availableFilters.collections || availableFilters.collections.length === 0) {
      return '';
    }

    const maxCollections = config.maxCollections || availableFilters.collections.length;
    const collections = availableFilters.collections.slice(0, maxCollections);

    const checkboxes = collections
      .map((collection) => {
        const count = config.showCounts && collection.count ? ` (${collection.count})` : '';
        return `
        <label class="${cssClass}__checkbox-label">
          <input
            type="checkbox"
            class="${cssClass}__checkbox"
            data-filter="collection"
            value="${collection.value}"
          />
          <span class="${cssClass}__checkbox-text">${collection.label}${count}</span>
        </label>
      `;
      })
      .join('');

    return `
      <div class="${cssClass}__filter-group">
        <label class="${cssClass}__filter-label">Colecciones</label>
        <div class="${cssClass}__checkboxes">
          ${checkboxes}
        </div>
      </div>
    `;
  }

  /**
   * Genera el botón de limpiar filtros
   */
  private static generateClearButton(config: FilterConfig): string {
    const cssClass = config.cssClass || 'product-filters';
    const text = config.clearFiltersText || 'Limpiar filtros';

    return `
      <button class="${cssClass}__clear-btn" type="button">
        ${text}
      </button>
    `;
  }

  /**
   * Genera el indicador de carga
   */
  private static generateLoadingIndicator(config: FilterConfig): string {
    const cssClass = config.cssClass || 'product-filters';
    const message = config.loadingMessage || 'Cargando productos...';

    return `
      <div class="${cssClass}__loading" style="display: none;">
        <div class="${cssClass}__loading-spinner"></div>
        <span class="${cssClass}__loading-text">${message}</span>
      </div>
    `;
  }

  /**
   * Obtiene CSS específico según el estilo
   */
  private static getStyleCSS(style: string, cssClass: string): string {
    switch (style) {
      case 'sidebar':
        return `
          width: 280px;
          position: sticky;
          top: 1rem;
        `;

      case 'horizontal':
        return `
          width: 100%;
          margin-bottom: 1rem;
        `;

      case 'modal':
        return `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1000;
          max-width: 400px;
          width: 90%;
        `;

      case 'dropdown':
        return `
          position: relative;
          width: 100%;
        `;

      default:
        return '';
    }
  }
}
