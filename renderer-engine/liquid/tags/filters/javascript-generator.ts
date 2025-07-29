import { FilterHandler, PaginationHandler, ProductRenderer, UiManager, UrlManager } from './modules';
import { FiltersOptions } from './types';

export class FiltersJavaScriptGenerator {
  static generateScript(storeId: string, options: FiltersOptions = {}): string {
    const containerSelector = options.cssClass ? `.${options.cssClass}` : '.auto-filters';
    const productGridSelector = options.productRenderer || '.product-grid';
    const noResultsMessage = options.noResultsMessage || 'No se encontraron productos con estos filtros';
    const loadingMessage = options.loadingMessage || 'Filtrando productos...';
    const productsPerPage = options.productsPerPage || 50;

    return `
      <script>
        (function() {
          class AutoFilters {
            constructor(storeId) {
              this.storeId = storeId;
              this.container = document.querySelector('${containerSelector}[data-store-id="' + storeId + '"]');
              this.productGridSelector = '${productGridSelector}';
              this.noResultsMessage = '${noResultsMessage}';
              this.loadingMessage = '${loadingMessage}';
              this.productsPerPage = ${productsPerPage};
              this.currentFilters = {};
              this.init();
            }

            init() {
              this.bindEvents();
              this.loadFiltersFromURL();

              // Configurar paginación inicial
              this.updatePaginationUI({ prevToken: null, nextToken: null });

              // Solo cargar productos si hay filtros activos (no solo token de paginación)
              if (this.hasActiveFilters()) {
                this.loadInitialProducts();
              }
            }

            async loadInitialProducts() {
              await this.applyFilters();
            }

            async applyFilters() {
              this.showLoading();
              this.updateFiltersFromUI();

              // Determinar si estamos aplicando nuevos filtros o navegando
              const urlParams = new URLSearchParams(window.location.search);
              const currentToken = urlParams.get('token');
              const hasNewFilters = this.hasNewFiltersApplied();

              // Si hay nuevos filtros, resetear token (volver a página 1)
              if (hasNewFilters) {
                this.removeTokenFromURL();
              } else {
                this.updateURL();
              }

              const params = new URLSearchParams(this.currentFilters);

              // Agregar límite de productos por página
              params.append('limit', this.productsPerPage.toString());

              // Agregar token de paginación solo si no estamos aplicando nuevos filtros
              if (currentToken && !hasNewFilters) {
                params.append('token', currentToken);
              }

              try {
                const response = await fetch('/api/stores/' + this.storeId + '/products/filter?' + params);
                const data = await response.json();

                if (data.products) {
                  this.replaceExistingProducts(data.products);

                  // Actualizar la URL con el nuevo token si existe
                  if (data.pagination && data.pagination.nextToken) {
                    this.updateURLWithToken(data.pagination.nextToken);
                  } else {
                    // Remover token si no hay más páginas
                    this.removeTokenFromURL();
                  }

                  // Actualizar UI de paginación
                  if (data.pagination) {
                    this.updatePaginationUI(data.pagination);
                  }

                  console.log('Filtros aplicados:', this.currentFilters);
                  console.log('Productos encontrados:', data.products.length);
                  console.log('Paginación:', data.pagination);
                }
              } catch (error) {
                console.error('Error applying filters:', error);
                this.showError('Error cargando productos: ' + error.message);
              } finally {
                this.hideLoading();
              }
            }

            ${FilterHandler.generateScript()}
            ${UrlManager.generateScript()}
            ${ProductRenderer.generateScript()}
            ${UiManager.generateScript()}
            ${PaginationHandler.generateScript()}
          }

          // Auto-initialize when DOM is ready
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
              new AutoFilters('${storeId}');
            });
          } else {
            new AutoFilters('${storeId}');
          }
        })();
      </script>
    `;
  }
}
