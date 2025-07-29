export class UrlManager {
  private currentFilters: any;
  private productsPerPage: number;

  constructor(currentFilters: any, productsPerPage: number) {
    this.currentFilters = currentFilters;
    this.productsPerPage = productsPerPage;
  }

  updateURL(): void {
    const params = new URLSearchParams();

    // Agregar filtros activos
    Object.entries(this.currentFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    // Agregar límite de productos por página
    params.append('limit', this.productsPerPage.toString());

    // Mantener el token de paginación si existe
    const urlParams = new URLSearchParams(window.location.search);
    const currentToken = urlParams.get('token');
    if (currentToken) {
      params.append('token', currentToken);
    }

    const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.pushState({}, '', newURL);
  }

  updateURLWithToken(token: string): void {
    const params = new URLSearchParams();

    // Agregar filtros activos
    Object.entries(this.currentFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    // Agregar límite de productos por página
    params.append('limit', this.productsPerPage.toString());

    // Agregar el nuevo token
    if (token) {
      params.append('token', token);
    }

    const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.pushState({}, '', newURL);
  }

  removeTokenFromURL(): void {
    const params = new URLSearchParams();

    // Agregar filtros activos
    Object.entries(this.currentFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    // Agregar límite de productos por página
    params.append('limit', this.productsPerPage.toString());

    const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.pushState({}, '', newURL);
  }

  static generateScript(): string {
    return `
      updateURL() {
        const params = new URLSearchParams();

        // Agregar filtros activos
        Object.entries(this.currentFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });

        // Agregar límite de productos por página
        params.append('limit', this.productsPerPage.toString());

        // Mantener el token de paginación si existe
        const urlParams = new URLSearchParams(window.location.search);
        const currentToken = urlParams.get('token');
        if (currentToken) {
          params.append('token', currentToken);
        }

        const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.pushState({}, '', newURL);
      }

      updateURLWithToken(token) {
        const params = new URLSearchParams();

        // Agregar filtros activos
        Object.entries(this.currentFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });

        // Agregar límite de productos por página
        params.append('limit', this.productsPerPage.toString());

        // Agregar el nuevo token
        if (token) {
          params.append('token', token);
        }

        const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.pushState({}, '', newURL);
      }

      removeTokenFromURL() {
        const params = new URLSearchParams();

        // Agregar filtros activos
        Object.entries(this.currentFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });

        // Agregar límite de productos por página
        params.append('limit', this.productsPerPage.toString());

        const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.pushState({}, '', newURL);
      }
    `;
  }
}
