export class FilterHandler {
  private container: Element;

  constructor(container: Element) {
    this.container = container;
  }

  hasActiveFilters(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return (
      urlParams.has('price_min') ||
      urlParams.has('price_max') ||
      urlParams.has('availability') ||
      urlParams.has('sort_by') ||
      urlParams.has('category') ||
      urlParams.has('featured')
    );
    // NOTA: No incluimos 'token' porque es solo para paginación, no un filtro
  }

  hasNewFiltersApplied(): boolean {
    // Comparar filtros actuales con los de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentFilters = {
      price_min: urlParams.get('price_min'),
      price_max: urlParams.get('price_max'),
      availability: urlParams.get('availability'),
      sort_by: urlParams.get('sort_by'),
      category: urlParams.get('category'),
      featured: urlParams.get('featured'),
    };

    // Obtener filtros del UI
    const uiFilters = this.getFiltersFromUI();

    // Comparar si hay diferencias
    return JSON.stringify(currentFilters) !== JSON.stringify(uiFilters);
  }

  updateFiltersFromUI(): any {
    const currentFilters: any = {};

    // Price filters
    const priceInputs = this.container.querySelectorAll('.price-input');
    if (priceInputs[0] && (priceInputs[0] as HTMLInputElement).value) {
      currentFilters.price_min = (priceInputs[0] as HTMLInputElement).value;
    }
    if (priceInputs[1] && (priceInputs[1] as HTMLInputElement).value) {
      currentFilters.price_max = (priceInputs[1] as HTMLInputElement).value;
    }

    // Availability
    const availabilityCheckbox = this.container.querySelector('.availability-filter') as HTMLInputElement;
    if (availabilityCheckbox && availabilityCheckbox.checked) {
      currentFilters.availability = 'in_stock';
    }

    // Sort
    const sortSelect = this.container.querySelector('.sort-select') as HTMLSelectElement;
    if (sortSelect && sortSelect.value && sortSelect.value !== 'createdAt') {
      currentFilters.sort_by = sortSelect.value;
    }

    // NOTA: No incluimos token aquí porque se maneja por separado
    // El token se resetea automáticamente cuando se aplican nuevos filtros
    return currentFilters;
  }

  loadFiltersFromURL(): void {
    const urlParams = new URLSearchParams(window.location.search);

    // Cargar filtros de precio desde URL
    const priceMin = urlParams.get('price_min');
    const priceMax = urlParams.get('price_max');
    if (priceMin) {
      const priceMinInput = this.container.querySelector('.price-input--min') as HTMLInputElement;
      if (priceMinInput) priceMinInput.value = priceMin;
    }
    if (priceMax) {
      const priceMaxInput = this.container.querySelector('.price-input--max') as HTMLInputElement;
      if (priceMaxInput) priceMaxInput.value = priceMax;
    }

    // Cargar disponibilidad desde URL
    const availability = urlParams.get('availability');
    if (availability === 'in_stock') {
      const availabilityCheckbox = this.container.querySelector('.availability-filter') as HTMLInputElement;
      if (availabilityCheckbox) availabilityCheckbox.checked = true;
    }

    // Cargar ordenamiento desde URL
    const sortBy = urlParams.get('sort_by');
    if (sortBy) {
      const sortSelect = this.container.querySelector('.sort-select') as HTMLSelectElement;
      if (sortSelect) sortSelect.value = sortBy;
    }
  }

  private getFiltersFromUI(): any {
    const uiFilters: any = {};
    const priceInputs = this.container.querySelectorAll('.price-input');
    if (priceInputs[0] && (priceInputs[0] as HTMLInputElement).value) {
      uiFilters.price_min = (priceInputs[0] as HTMLInputElement).value;
    }
    if (priceInputs[1] && (priceInputs[1] as HTMLInputElement).value) {
      uiFilters.price_max = (priceInputs[1] as HTMLInputElement).value;
    }

    const availabilityCheckbox = this.container.querySelector('.availability-filter') as HTMLInputElement;
    if (availabilityCheckbox && availabilityCheckbox.checked) {
      uiFilters.availability = 'in_stock';
    }

    const sortSelect = this.container.querySelector('.sort-select') as HTMLSelectElement;
    if (sortSelect && sortSelect.value && sortSelect.value !== 'createdAt') {
      uiFilters.sort_by = sortSelect.value;
    }

    return uiFilters;
  }

  static generateScript(): string {
    return `
      hasActiveFilters() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.has('price_min') ||
               urlParams.has('price_max') ||
               urlParams.has('availability') ||
               urlParams.has('sort_by') ||
               urlParams.has('category') ||
               urlParams.has('featured');
        // NOTA: No incluimos 'token' porque es solo para paginación, no un filtro
      }

      hasNewFiltersApplied() {
        // Comparar filtros actuales con los de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const currentFilters = {
          price_min: urlParams.get('price_min'),
          price_max: urlParams.get('price_max'),
          availability: urlParams.get('availability'),
          sort_by: urlParams.get('sort_by'),
          category: urlParams.get('category'),
          featured: urlParams.get('featured')
        };

        // Obtener filtros del UI
        const uiFilters = {};
        const priceInputs = this.container.querySelectorAll('.price-input');
        if (priceInputs[0] && priceInputs[0].value) {
          uiFilters.price_min = priceInputs[0].value;
        }
        if (priceInputs[1] && priceInputs[1].value) {
          uiFilters.price_max = priceInputs[1].value;
        }

        const availabilityCheckbox = this.container.querySelector('.availability-filter');
        if (availabilityCheckbox && availabilityCheckbox.checked) {
          uiFilters.availability = 'in_stock';
        }

        const sortSelect = this.container.querySelector('.sort-select');
        if (sortSelect && sortSelect.value && sortSelect.value !== 'createdAt') {
          uiFilters.sort_by = sortSelect.value;
        }

        // Comparar si hay diferencias
        return JSON.stringify(currentFilters) !== JSON.stringify(uiFilters);
      }

      updateFiltersFromUI() {
        this.currentFilters = {};

        // Price filters
        const priceInputs = this.container.querySelectorAll('.price-input');
        if (priceInputs[0] && priceInputs[0].value) {
          this.currentFilters.price_min = priceInputs[0].value;
        }
        if (priceInputs[1] && priceInputs[1].value) {
          this.currentFilters.price_max = priceInputs[1].value;
        }

        // Availability
        const availabilityCheckbox = this.container.querySelector('.availability-filter');
        if (availabilityCheckbox && availabilityCheckbox.checked) {
          this.currentFilters.availability = 'in_stock';
        }

        // Sort
        const sortSelect = this.container.querySelector('.sort-select');
        if (sortSelect && sortSelect.value && sortSelect.value !== 'createdAt') {
          this.currentFilters.sort_by = sortSelect.value;
        }

        // NOTA: No incluimos token aquí porque se maneja por separado
        // El token se resetea automáticamente cuando se aplican nuevos filtros
      }

      loadFiltersFromURL() {
        const urlParams = new URLSearchParams(window.location.search);

        // Cargar filtros de precio desde URL
        const priceMin = urlParams.get('price_min');
        const priceMax = urlParams.get('price_max');
        if (priceMin) {
          const priceMinInput = this.container.querySelector('.price-input--min');
          if (priceMinInput) priceMinInput.value = priceMin;
        }
        if (priceMax) {
          const priceMaxInput = this.container.querySelector('.price-input--max');
          if (priceMaxInput) priceMaxInput.value = priceMax;
        }

        // Cargar disponibilidad desde URL
        const availability = urlParams.get('availability');
        if (availability === 'in_stock') {
          const availabilityCheckbox = this.container.querySelector('.availability-filter');
          if (availabilityCheckbox) availabilityCheckbox.checked = true;
        }

        // Cargar ordenamiento desde URL
        const sortBy = urlParams.get('sort_by');
        if (sortBy) {
          const sortSelect = this.container.querySelector('.sort-select');
          if (sortSelect) sortSelect.value = sortBy;
        }
      }
    `;
  }
}
