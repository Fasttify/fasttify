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
 * Sistema principal de filtros
 */
import { DOMManager } from 'https://cdn.fasttify.com/assets/global-static/dom-manager.js';
import { EventHandler } from 'https://cdn.fasttify.com/assets/global-static/event-handler.js';
import { FilterAPI } from 'https://cdn.fasttify.com/assets/global-static/filter-api.js';
import { createFilterConfig } from 'https://cdn.fasttify.com/assets/global-static/filter-config.js';
import { FilterStateManager } from 'https://cdn.fasttify.com/assets/global-static/filter-state.js';
import { PriceSlider } from 'https://cdn.fasttify.com/assets/global-static/price-slider.js';
import { ProductRenderer } from 'https://cdn.fasttify.com/assets/global-static/product-renderer.js';
import { URLLoader } from 'https://cdn.fasttify.com/assets/global-static/url-loader.js';
import { FilterUtils } from 'https://cdn.fasttify.com/assets/global-static/utils.js';

/**
 * Clase principal del sistema de filtros
 */
export class FilterSystem {
  constructor(config) {
    this.config = createFilterConfig(config);
    this.domManager = new DOMManager(this.config.cssClass);
    this.filterState = new FilterStateManager();
    this.filterAPI = new FilterAPI(this.config.apiEndpoint);
    this.productRenderer = ProductRenderer;
    this.filterUtils = FilterUtils;
    this.urlLoader = URLLoader;
    this.eventHandler = new EventHandler(
      this.filterState,
      this.filterAPI,
      this.productRenderer,
      this.domManager,
      this.filterUtils
    );
    this.priceSlider = null;
  }

  /**
   * Inicializa el sistema de filtros
   */
  async init() {
    if (!this.domManager.findElements()) {
      console.error('Filter system initialization failed');
      return false;
    }

    await this.productRenderer.init(this.config.storeId);

    this.eventHandler.setFilterConfig(this.config);
    this.eventHandler.bindEvents();
    this.initPriceSlider();

    const hasFiltersFromURL = this.urlLoader.loadFiltersFromURL(
      this.domManager.getElements().container,
      this.filterState
    );

    if (hasFiltersFromURL) {
      const pagination = this.domManager.findPagination();
      this.filterUtils.togglePagination(pagination, false);
      this.eventHandler.applyFilters();
    }

    return true;
  }

  /**
   * Inicializa el slider de precios
   */
  initPriceSlider() {
    const priceContainer = this.domManager
      .getElements()
      .container.querySelector(`.${this.config.cssClass}__price-range-container`);
    if (priceContainer) {
      this.priceSlider = new PriceSlider(priceContainer, this.config.cssClass);
      this.priceSlider.init();

      // Escuchar cambios del slider
      priceContainer.addEventListener('priceRange:changed', (e) => {
        const { min, max } = e.detail;
        this.filterState.updateProperty('priceMin', min);
        this.filterState.updateProperty('priceMax', max);
        this.eventHandler.applyFilters();
      });
    }
  }

  /**
   * Obtiene la instancia del sistema de filtros
   */
  static create(config) {
    return new FilterSystem(config);
  }
}

/**
 * Función de inicialización automática
 */
export async function initFilterSystem(config) {
  const filterSystem = FilterSystem.create(config);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => await filterSystem.init());
  } else {
    await filterSystem.init();
  }

  return filterSystem;
}
