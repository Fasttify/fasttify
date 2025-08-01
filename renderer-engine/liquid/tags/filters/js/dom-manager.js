/**
 * Gestor de elementos del DOM para el sistema de filtros
 */
export class DOMManager {
  constructor(cssClass) {
    this.cssClass = cssClass;
    this.elements = {
      container: null,
      filtersContainer: null,
      loadingIndicator: null,
      clearButton: null,
      filterInputs: [],
    };
  }

  /**
   * Encuentra todos los elementos necesarios del DOM
   */
  findElements() {
    this.elements.container = document.querySelector('.' + this.cssClass);
    if (!this.elements.container) {
      console.error('Not found filters container with class:', this.cssClass);
      return false;
    }

    this.elements.filtersContainer = this.elements.container.querySelector('.' + this.cssClass + '__container');
    this.elements.loadingIndicator = this.elements.container.querySelector('.' + this.cssClass + '__loading');
    this.elements.clearButton = this.elements.container.querySelector('.' + this.cssClass + '__clear-btn');
    this.elements.filterInputs = this.elements.container.querySelectorAll('[data-filter]');

    return true;
  }

  /**
   * Encuentra el contenedor de productos
   */
  findProductsContainer() {
    const containerById = document.getElementById('products-container');
    if (containerById) {
      return containerById;
    }

    const selectors = [
      '[data-products]',
      '.product-grid',
      '.products-grid',
      '.product-list',
      '.products-container',
      '.collection-products',
      '.products',
    ];

    for (const selector of selectors) {
      const container = document.querySelector(selector);
      if (container) {
        return container;
      }
    }

    console.warn('Not found products container:', {
      byId: document.getElementById('products-container'),
      byDataAttr: document.querySelector('[data-products]'),
      byClass: document.querySelector('.product-grid'),
      allProducts: document.querySelectorAll('[class*="product"]'),
    });
    return null;
  }

  /**
   * Encuentra la paginación
   */
  findPagination() {
    return document.querySelector('.custom-pagination');
  }

  /**
   * Obtiene los elementos del DOM
   */
  getElements() {
    return this.elements;
  }

  /**
   * Verifica si el contenedor existe
   */
  hasContainer() {
    return this.elements.container !== null;
  }
}
