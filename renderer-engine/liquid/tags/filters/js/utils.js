/**
 * Utilidades para el sistema de filtros
 */
export class FilterUtils {
  /**
   * Función debounce para optimizar llamadas
   */
  static debounce(func, wait) {
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

  /**
   * Actualiza la URL sin incluir token
   */
  static updateURL(params) {
    const url = new URL(window.location);

    // Limpiar parámetros existentes
    const paramsToDelete = [
      'limit',
      'token',
      'sort_by',
      'price_min',
      'price_max',
      'categories',
      'tags',
      'vendors',
      'collections',
    ];

    paramsToDelete.forEach((param) => {
      url.searchParams.delete(param);
    });

    // Agregar nuevos parámetros
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && key !== 'token') {
        url.searchParams.set(key, value);
      }
    });

    window.history.replaceState({}, '', url);
  }

  /**
   * Limpia la URL de todos los parámetros de filtro
   */
  static clearURL() {
    const url = new URL(window.location);
    const paramsToDelete = [
      'limit',
      'sort_by',
      'price_min',
      'price_max',
      'categories',
      'tags',
      'vendors',
      'collections',
    ];

    paramsToDelete.forEach((param) => {
      url.searchParams.delete(param);
    });

    return url.pathname;
  }

  /**
   * Emite un evento personalizado
   */
  static emitEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  /**
   * Muestra u oculta el indicador de carga
   */
  static showLoading(loadingIndicator, show) {
    if (loadingIndicator) {
      loadingIndicator.style.display = show ? 'flex' : 'none';
    }
  }

  /**
   * Muestra un mensaje de error
   */
  static showError(container, message) {
    if (container) {
      container.innerHTML = `<p class="error-message">${message}</p>`;
    }
  }

  /**
   * Oculta o muestra la paginación
   */
  static togglePagination(pagination, show) {
    if (pagination) {
      pagination.style.display = show ? '' : 'none';
    }
  }

  /**
   * Verifica si el scroll está cerca del final
   */
  static isNearBottom(threshold = 100) {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    return scrollTop + windowHeight >= documentHeight - threshold;
  }
}
