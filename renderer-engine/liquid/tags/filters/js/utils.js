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
   * Verifica si el scroll está cerca del final usando múltiples criterios
   */
  static isNearBottom(threshold = 500, thresholdPercentage = 20) {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPosition = scrollTop + windowHeight;

    // Criterio 1: Distancia en píxeles desde el final
    const pixelThreshold = documentHeight - threshold;
    const isNearBottomByPixels = scrollPosition >= pixelThreshold;

    // Criterio 2: Porcentaje del viewport desde el final
    const percentageThreshold = documentHeight - windowHeight * (thresholdPercentage / 100);
    const isNearBottomByPercentage = scrollPosition >= percentageThreshold;

    // Criterio 3: Si estamos en el último 25% del documento
    const lastQuarterThreshold = documentHeight * 0.75;
    const isInLastQuarter = scrollPosition >= lastQuarterThreshold;

    // Criterio 4: Si el usuario ha scrolleado más del 80% del contenido
    const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
    const isNearBottomByScrollPercentage = scrollPercentage >= 80;

    // Criterio 5: Si estamos a menos de 2 viewports del final
    const viewportThreshold = documentHeight - windowHeight * 2;
    const isNearBottomByViewport = scrollPosition >= viewportThreshold;

    // Retornar true si cualquiera de los criterios se cumple
    return (
      isNearBottomByPixels ||
      isNearBottomByPercentage ||
      isInLastQuarter ||
      isNearBottomByScrollPercentage ||
      isNearBottomByViewport
    );
  }
}
