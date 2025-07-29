export class PaginationHandler {
  private productsPerPage: number;
  private currentFilters: any;
  private storeId: string;

  constructor(productsPerPage: number, currentFilters: any, storeId: string) {
    this.productsPerPage = productsPerPage;
    this.currentFilters = currentFilters;
    this.storeId = storeId;
  }

  loadNextPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const nextToken = urlParams.get('token');

    if (nextToken) {
      // Mantener filtros actuales y agregar token de siguiente página
      const params = new URLSearchParams();

      // Agregar filtros activos
      Object.entries(this.currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      // Agregar límite de productos por página
      params.append('limit', this.productsPerPage.toString());

      // Agregar token de siguiente página
      params.append('token', nextToken);

      const newURL = window.location.pathname + '?' + params.toString();
      window.history.pushState({}, '', newURL);

      // Retornar true para indicar que se debe aplicar filtros
      return true;
    }
    return false;
  }

  loadPreviousPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const prevToken = urlParams.get('prevToken');

    if (prevToken) {
      // Mantener filtros actuales y agregar token de página anterior
      const params = new URLSearchParams();

      // Agregar filtros activos
      Object.entries(this.currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      // Agregar límite de productos por página
      params.append('limit', this.productsPerPage.toString());

      // Agregar token de página anterior
      params.append('token', prevToken);

      const newURL = window.location.pathname + '?' + params.toString();
      window.history.pushState({}, '', newURL);

      // Retornar true para indicar que se debe aplicar filtros
      return true;
    }
    return false;
  }

  updatePaginationUI(pagination: any, hasActiveFilters: boolean) {
    const liquidPagination = document.querySelector('.liquid-pagination');
    const jsPagination = document.querySelector('.js-pagination');
    const prevButton = document.querySelector('.js-prev-page') as HTMLButtonElement;
    const nextButton = document.querySelector('.js-next-page') as HTMLButtonElement;

    if (hasActiveFilters) {
      // Ocultar paginación de Liquid, mostrar la de JavaScript
      if (liquidPagination) liquidPagination.classList.add('hidden');
      if (jsPagination) jsPagination.classList.remove('hidden');

      // Actualizar botones
      if (prevButton) {
        prevButton.disabled = !pagination.prevToken;
      }

      if (nextButton) {
        nextButton.disabled = !pagination.nextToken;
      }
    } else {
      // Mostrar paginación de Liquid, ocultar la de JavaScript
      if (liquidPagination) liquidPagination.classList.remove('hidden');
      if (jsPagination) jsPagination.classList.add('hidden');
    }
  }

  static generateScript(): string {
    return `
      loadNextPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const nextToken = urlParams.get('token');

        if (nextToken) {
          // Mantener filtros actuales y agregar token de siguiente página
          const params = new URLSearchParams();

          // Agregar filtros activos
          Object.entries(this.currentFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              params.append(key, value.toString());
            }
          });

          // Agregar límite de productos por página
          params.append('limit', this.productsPerPage.toString());

          // Agregar token de siguiente página
          params.append('token', nextToken);

          const newURL = window.location.pathname + '?' + params.toString();
          window.history.pushState({}, '', newURL);

          this.applyFilters();
        }
      }

      loadPreviousPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const prevToken = urlParams.get('prevToken');

        if (prevToken) {
          // Mantener filtros actuales y agregar token de página anterior
          const params = new URLSearchParams();

          // Agregar filtros activos
          Object.entries(this.currentFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              params.append(key, value.toString());
            }
          });

          // Agregar límite de productos por página
          params.append('limit', this.productsPerPage.toString());

          // Agregar token de página anterior
          params.append('token', prevToken);

          const newURL = window.location.pathname + '?' + params.toString();
          window.history.pushState({}, '', newURL);

          this.applyFilters();
        }
      }

      updatePaginationUI(pagination) {
        const liquidPagination = document.querySelector('.liquid-pagination');
        const jsPagination = document.querySelector('.js-pagination');
        const prevButton = document.querySelector('.js-prev-page');
        const nextButton = document.querySelector('.js-next-page');

        if (this.hasActiveFilters()) {
          // Ocultar paginación de Liquid, mostrar la de JavaScript
          if (liquidPagination) liquidPagination.classList.add('hidden');
          if (jsPagination) jsPagination.classList.remove('hidden');

          // Actualizar botones
          if (prevButton) {
            prevButton.disabled = !pagination.prevToken;
          }

          if (nextButton) {
            nextButton.disabled = !pagination.nextToken;
          }
        } else {
          // Mostrar paginación de Liquid, ocultar la de JavaScript
          if (liquidPagination) liquidPagination.classList.remove('hidden');
          if (jsPagination) jsPagination.classList.add('hidden');
        }
      }
    `;
  }
}
