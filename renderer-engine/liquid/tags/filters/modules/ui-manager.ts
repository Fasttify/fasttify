export class UiManager {
  private container: Element;
  private productGridSelector: string;
  private loadingMessage: string;

  constructor(container: Element, productGridSelector: string, loadingMessage: string) {
    this.container = container;
    this.productGridSelector = productGridSelector;
    this.loadingMessage = loadingMessage;
  }

  bindEvents(
    applyFiltersCallback: () => void,
    loadPreviousPageCallback: () => void,
    loadNextPageCallback: () => void
  ): void {
    // Price inputs
    this.container.querySelectorAll('.price-input').forEach((input, index) => {
      (input as HTMLInputElement).addEventListener('input', this.debounce(applyFiltersCallback, 500) as EventListener);
    });

    // Availability checkbox
    const availabilityCheckbox = this.container.querySelector('.availability-filter');
    if (availabilityCheckbox) {
      availabilityCheckbox.addEventListener('change', applyFiltersCallback);
    }

    // Sort select
    const sortSelect = this.container.querySelector('.sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', applyFiltersCallback);
    }

    // Pagination buttons
    const prevButton = document.querySelector('.js-prev-page') as HTMLButtonElement;
    const nextButton = document.querySelector('.js-next-page') as HTMLButtonElement;

    if (prevButton) {
      prevButton.addEventListener('click', loadPreviousPageCallback);
    }

    if (nextButton) {
      nextButton.addEventListener('click', loadNextPageCallback);
    }
  }

  showLoading(): void {
    const existingGrid = document.querySelector(this.productGridSelector);
    if (existingGrid) {
      // Añadir clase de loading al grid existente
      existingGrid.classList.add('filtering-loading');
      const loadingOverlay = document.createElement('div');
      loadingOverlay.className = 'filters-loading-overlay';
      loadingOverlay.innerHTML = '<div class="loading-spinner">' + this.loadingMessage + '</div>';
      existingGrid.appendChild(loadingOverlay);
    }
  }

  hideLoading(): void {
    const existingGrid = document.querySelector(this.productGridSelector);
    if (existingGrid) {
      existingGrid.classList.remove('filtering-loading');
      const loadingOverlay = existingGrid.querySelector('.filters-loading-overlay');
      if (loadingOverlay) {
        loadingOverlay.remove();
      }
    }
  }

  showError(message: string): void {
    const existingGrid = document.querySelector(this.productGridSelector);
    if (existingGrid) {
      existingGrid.innerHTML = `<div class="grid__item--full"><p style="color: red; text-align: center; padding: 2rem;">${message}</p></div>`;
    }
  }

  private debounce(func: Function, wait: number): Function {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static generateScript(): string {
    return `
      bindEvents() {
        // Price inputs
        this.container.querySelectorAll('.price-input').forEach((input, index) => {
          input.addEventListener('input', this.debounce(() => this.applyFilters(), 500));
        });

        // Availability checkbox
        const availabilityCheckbox = this.container.querySelector('.availability-filter');
        if (availabilityCheckbox) {
          availabilityCheckbox.addEventListener('change', () => this.applyFilters());
        }

        // Sort select
        const sortSelect = this.container.querySelector('.sort-select');
        if (sortSelect) {
          sortSelect.addEventListener('change', () => this.applyFilters());
        }

        // Pagination buttons
        const prevButton = document.querySelector('.js-prev-page');
        const nextButton = document.querySelector('.js-next-page');

        if (prevButton) {
          prevButton.addEventListener('click', () => this.loadPreviousPage());
        }

        if (nextButton) {
          nextButton.addEventListener('click', () => this.loadNextPage());
        }
      }

      showLoading() {
        const existingGrid = document.querySelector(this.productGridSelector);
        if (existingGrid) {
          // Añadir clase de loading al grid existente
          existingGrid.classList.add('filtering-loading');
          const loadingOverlay = document.createElement('div');
          loadingOverlay.className = 'filters-loading-overlay';
          loadingOverlay.innerHTML = '<div class="loading-spinner">' + this.loadingMessage + '</div>';
          existingGrid.appendChild(loadingOverlay);
        }
      }

      hideLoading() {
        const existingGrid = document.querySelector(this.productGridSelector);
        if (existingGrid) {
          existingGrid.classList.remove('filtering-loading');
          const loadingOverlay = existingGrid.querySelector('.filters-loading-overlay');
          if (loadingOverlay) {
            loadingOverlay.remove();
          }
        }
      }

      showError(message) {
        const existingGrid = document.querySelector(this.productGridSelector);
        if (existingGrid) {
          existingGrid.innerHTML = \`<div class="grid__item--full"><p style="color: red; text-align: center; padding: 2rem;">\${message}</p></div>\`;
        }
      }

      debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
          const later = () => {
            clearTimeout(timeout);
            func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
        };
      }
    `;
  }
}
