/**
 * Sistema principal de filtros
 */
import { DOMManager } from 'https://cdn.fasttify.com/assets/dom-manager.js';
import { EventHandler } from 'https://cdn.fasttify.com/assets/event-handler.js';
import { FilterAPI } from 'https://cdn.fasttify.com/assets/filter-api.js';
import { createFilterConfig } from 'https://cdn.fasttify.com/assets/filter-config.js';
import { FilterStateManager } from 'https://cdn.fasttify.com/assets/filter-state.js';
import { PriceSlider } from 'https://cdn.fasttify.com/assets/price-slider.js';
import { ProductRenderer } from 'https://cdn.fasttify.com/assets/product-renderer.js';
import { URLLoader } from 'https://cdn.fasttify.com/assets/url-loader.js';
import { FilterUtils } from 'https://cdn.fasttify.com/assets/utils.js';

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
  init() {
    if (!this.domManager.findElements()) {
      console.error('Filter system initialization failed');
      return false;
    }

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
export function initFilterSystem(config) {
  const filterSystem = FilterSystem.create(config);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => filterSystem.init());
  } else {
    filterSystem.init();
  }

  return filterSystem;
}
