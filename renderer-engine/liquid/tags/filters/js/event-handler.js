/**
 * Manejador de eventos para el sistema de filtros
 */
export class EventHandler {
  constructor(filterState, filterAPI, productRenderer, domManager, filterUtils) {
    this.filterState = filterState;
    this.filterAPI = filterAPI;
    this.productRenderer = productRenderer;
    this.domManager = domManager;
    this.filterUtils = filterUtils;
    this.elements = domManager.getElements();
    this.filterConfig = null; // Se establecerá después
  }

  /**
   * Vincula todos los eventos necesarios
   */
  bindEvents() {
    if (!this.domManager.hasContainer()) {
      console.error('No container found, cannot bind events');
      return;
    }

    this.bindFilterInputs();
    this.bindClearButton();
    this.bindScrollEvent();
  }

  /**
   * Vincula eventos a los inputs de filtro
   */
  bindFilterInputs() {
    this.elements.filterInputs.forEach((input) => {
      if (input.type === 'checkbox') {
        input.addEventListener('change', this.handleFilterChange.bind(this));
      } else if (input.type === 'select-one') {
        input.addEventListener('change', this.handleFilterChange.bind(this));
      } else if (input.type === 'number') {
        const debounceDelay = this.filterConfig?.debounceDelay || 300;
        input.addEventListener('input', this.filterUtils.debounce(this.handleFilterChange.bind(this), debounceDelay));
      }
    });
  }

  /**
   * Vincula evento al botón de limpiar
   */
  bindClearButton() {
    if (this.elements.clearButton) {
      this.elements.clearButton.addEventListener('click', this.clearFilters.bind(this));
    }
  }

  /**
   * Vincula evento de scroll para infinite scroll
   */
  bindScrollEvent() {
    if (this.filterConfig?.infiniteScroll) {
      window.addEventListener('scroll', this.filterUtils.debounce(this.handleScroll.bind(this), 100));
    }
  }

  /**
   * Maneja cambios en los filtros
   */
  handleFilterChange() {
    this.filterState.updateFromDOM(this.elements.filterInputs);
    this.filterState.updateProperty('nextToken', null);
    this.filterState.updateProperty('hasMore', true);
    this.filterState.updateProperty('allProducts', []);
    this.applyFilters();
  }

  /**
   * Maneja el scroll para infinite scroll
   */
  handleScroll() {
    if (
      !this.filterConfig?.infiniteScroll ||
      this.filterState.getProperty('isLoading') ||
      !this.filterState.getProperty('hasMore')
    ) {
      return;
    }

    if (!this.filterState.hasActiveFilters()) {
      return;
    }

    const scrollThreshold = this.filterConfig?.scrollThreshold || 100;
    if (this.filterUtils.isNearBottom(scrollThreshold)) {
      this.applyFilters();
    }
  }

  /**
   * Aplica los filtros actuales
   */
  async applyFilters() {
    if (this.filterState.getProperty('isLoading')) return;

    this.filterUtils.showLoading(this.elements.loadingIndicator, true);
    this.filterState.updateProperty('isLoading', true);

    try {
      const data = await this.filterAPI.fetchFilteredProducts(this.filterState.getState());

      const productsContainer = this.domManager.findProductsContainer();
      const pagination = this.domManager.findPagination();

      if (!this.filterState.getProperty('nextToken')) {
        const noResultsMessage = this.filterConfig?.noResultsMessage || 'No se encontraron productos';
        this.productRenderer.replaceProducts(data.products, productsContainer, noResultsMessage);
        this.filterUtils.togglePagination(pagination, false);
      } else {
        this.productRenderer.appendProducts(data.products, productsContainer);
      }

      this.filterState.updateProperty('hasMore', data.pagination && data.pagination.hasMore);
      this.filterState.updateProperty('nextToken', data.pagination && data.pagination.nextToken);

      const params = this.filterAPI.buildFilterParams(this.filterState.getState());
      this.filterUtils.updateURL(params);

      // Emitir evento personalizado
      this.filterUtils.emitEvent('filters:applied', {
        categories: this.filterState.getProperty('categories'),
        tags: this.filterState.getProperty('tags'),
        vendors: this.filterState.getProperty('vendors'),
        collections: this.filterState.getProperty('collections'),
        priceMin: this.filterState.getProperty('priceMin'),
        priceMax: this.filterState.getProperty('priceMax'),
        sort: this.filterState.getProperty('sort'),
        products: data.products,
        pagination: data.pagination,
      });
    } catch (error) {
      console.error('Error applying filters:', error);
      const productsContainer = this.domManager.findProductsContainer();
      const errorMessage = this.filterConfig?.errorMessage || 'Error cargando productos';
      this.filterUtils.showError(productsContainer, errorMessage);
    } finally {
      this.filterUtils.showLoading(this.elements.loadingIndicator, false);
      this.filterState.updateProperty('isLoading', false);
    }
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters() {
    this.elements.filterInputs.forEach((input) => {
      if (input.type === 'checkbox') {
        input.checked = false;
      } else {
        input.value = '';
      }
    });

    this.filterState.reset();

    const cleanPath = this.filterUtils.clearURL();
    const pagination = this.domManager.findPagination();
    this.filterUtils.togglePagination(pagination, true);

    window.location.href = cleanPath;

    // Emitir evento personalizado
    this.filterUtils.emitEvent('filters:cleared');
  }

  /**
   * Establece la configuración del filtro
   */
  setFilterConfig(config) {
    this.filterConfig = config;
  }
}
