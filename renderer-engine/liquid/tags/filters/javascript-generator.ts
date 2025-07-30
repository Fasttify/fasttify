import { FilterConfig } from './types';

export class FilterJavaScriptGenerator {
  /**
   * Genera el JavaScript para el sistema de filtros
   */
  static generate(config: FilterConfig): string {
    const cssClass = config.cssClass || 'product-filters';
    const storeId = config.storeId;

    return `
      <script>
        (function() {
          'use strict';

          // Configuración del filtro
          const FILTER_CONFIG = {
            cssClass: '${cssClass}',
            storeId: '${storeId}',
            apiEndpoint: '/api/stores/${storeId}/products/filter',
            infiniteScroll: ${config.infiniteScroll || true},
            scrollThreshold: ${config.scrollThreshold || 100},
            debounceDelay: ${config.debounceDelay || 300},
            loadingMessage: '${config.loadingMessage || 'Cargando productos...'}',
            noResultsMessage: '${config.noResultsMessage || 'No se encontraron productos'}',
            errorMessage: '${config.errorMessage || 'Error cargando productos'}',
            title: '${config.title || 'Filtros'}',
            showCounts: ${config.showCounts !== false},
            showPriceRange: ${config.showPriceRange !== false},
            showSortOptions: ${config.showSortOptions !== false},
            showClearButton: ${config.showClearButton !== false},
            maxCategories: ${config.maxCategories || 10},
            maxTags: ${config.maxTags || 15},
            maxVendors: ${config.maxVendors || 8},
            maxCollections: ${config.maxCollections || 6},
            clearFiltersText: '${config.clearFiltersText || 'Limpiar filtros'}'
          };

          // Estado del filtro
          let filterState = {
            sort: '',
            priceMin: '',
            priceMax: '',
            categories: [],
            tags: [],
            vendors: [],
            collections: [],
            nextToken: null,
            hasMore: true,
            isLoading: false,
            allProducts: []
          };

          // Elementos del DOM
          let elements = {
            container: null,
            filtersContainer: null,
            loadingIndicator: null,
            clearButton: null,
            filterInputs: []
          };

          // Inicialización
          function init() {
            findElements();
            bindEvents();
            loadFiltersFromURL();
          }

          // Encontrar elementos del DOM
          function findElements() {
            elements.container = document.querySelector('.' + FILTER_CONFIG.cssClass);
            if (!elements.container) {
              console.error('Not found filters container');
              return;
            }

            elements.filtersContainer = elements.container.querySelector('.' + FILTER_CONFIG.cssClass + '__container');
            elements.loadingIndicator = elements.container.querySelector('.' + FILTER_CONFIG.cssClass + '__loading');
            elements.clearButton = elements.container.querySelector('.' + FILTER_CONFIG.cssClass + '__clear-btn');
            elements.filterInputs = elements.container.querySelectorAll('[data-filter]');
          }

          // Vincular eventos
          function bindEvents() {
            if (!elements.container) return;

            elements.filterInputs.forEach(input => {
              if (input.type === 'checkbox') {
                input.addEventListener('change', handleFilterChange);
              } else if (input.type === 'select-one') {
                input.addEventListener('change', handleFilterChange);
              } else if (input.type === 'number') {
                input.addEventListener('input', debounce(handleFilterChange, FILTER_CONFIG.debounceDelay));
              }
            });

            if (elements.clearButton) {
              elements.clearButton.addEventListener('click', clearFilters);
            }

            if (FILTER_CONFIG.infiniteScroll) {
              window.addEventListener('scroll', debounce(handleScroll, 100));
            }
          }

          // Manejar cambios en filtros
          function handleFilterChange() {
            updateFilterState();
            filterState.nextToken = null;
            filterState.hasMore = true;
            filterState.allProducts = [];
            applyFilters();
          }

          // Actualizar estado de filtros desde el DOM
          function updateFilterState() {
            const newState = {
              sort: '',
              priceMin: '',
              priceMax: '',
              categories: [],
              tags: [],
              vendors: [],
              collections: []
            };

            elements.filterInputs.forEach(input => {
              const filterType = input.getAttribute('data-filter');
              const value = input.value;

              if (input.type === 'checkbox') {
                if (input.checked) {
                  switch (filterType) {
                    case 'category':
                      newState.categories.push(value);
                      break;
                    case 'tag':
                      newState.tags.push(value);
                      break;
                    case 'vendor':
                      newState.vendors.push(value);
                      break;
                    case 'collection':
                      newState.collections.push(value);
                      break;
                  }
                }
              } else if (input.type === 'select-one') {
                if (filterType === 'sort') {
                  newState.sort = value;
                }
              } else if (input.type === 'number') {
                if (filterType === 'price-min') {
                  newState.priceMin = value;
                } else if (filterType === 'price-max') {
                  newState.priceMax = value;
                }
              }
            });

            filterState = { ...filterState, ...newState };
          }

          // Aplicar filtros
          async function applyFilters() {
            if (filterState.isLoading) return;

            showLoading(true);
            filterState.isLoading = true;

            try {
              const params = buildFilterParams();
              const url = FILTER_CONFIG.apiEndpoint + '?' + new URLSearchParams(params);

              const response = await fetch(url);
              if (!response.ok) {
                throw new Error('Error in server response');
              }

              const data = await response.json();

              if (!filterState.nextToken) {
                replaceProducts(data.products);
                togglePagination(false);
              } else {
                appendProducts(data.products);
              }

              filterState.hasMore = data.pagination && data.pagination.hasMore;
              filterState.nextToken = data.pagination && data.pagination.nextToken;

              updateURL(params);

              // Emitir evento personalizado
              const event = new CustomEvent('filters:applied', {
                detail: {
                  categories: filterState.categories,
                  tags: filterState.tags,
                  vendors: filterState.vendors,
                  collections: filterState.collections,
                  priceMin: filterState.priceMin,
                  priceMax: filterState.priceMax,
                  sort: filterState.sort,
                  products: data.products,
                  pagination: data.pagination
                }
              });
              document.dispatchEvent(event);

            } catch (error) {
              console.error('Error applying filters:', error);
              showError(FILTER_CONFIG.errorMessage);
            } finally {
              showLoading(false);
              filterState.isLoading = false;
            }
          }

          // Construir parámetros de filtro
          function buildFilterParams() {
            const params = {
              limit: 50
            };

            if (filterState.nextToken) {
              params.token = filterState.nextToken;
            }

            if (filterState.sort) {
              params.sort_by = filterState.sort;
            }

            if (filterState.priceMin) {
              params.price_min = filterState.priceMin;
            }

            if (filterState.priceMax) {
              params.price_max = filterState.priceMax;
            }

            if (filterState.categories.length > 0) {
              params.categories = filterState.categories.join(',');
            }

            if (filterState.tags.length > 0) {
              params.tags = filterState.tags.join(',');
            }

            if (filterState.vendors.length > 0) {
              params.vendors = filterState.vendors.join(',');
            }

            if (filterState.collections.length > 0) {
              params.collections = filterState.collections.join(',');
            }

            return params;
          }

          // Reemplazar productos en el DOM
          function replaceProducts(products) {
            const productsContainer = findProductsContainer();
            if (!productsContainer) return;

            if (!products || products.length === 0) {
              productsContainer.innerHTML = '<p class="no-products">' + FILTER_CONFIG.noResultsMessage + '</p>';
              return;
            }

            const productsHTML = products.map(product => renderProduct(product)).join('');
            productsContainer.innerHTML = productsHTML;
          }

          // Agregar productos al final
          function appendProducts(products) {
            const productsContainer = findProductsContainer();
            if (!productsContainer || !products || products.length === 0) return;

            const productsHTML = products.map(product => renderProduct(product)).join('');
            productsContainer.insertAdjacentHTML('beforeend', productsHTML);
          }

          // Encontrar contenedor de productos
          function findProductsContainer() {
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
              '.products'
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
              allProducts: document.querySelectorAll('[class*="product"]')
            });
            return null;
          }

          // Renderizar producto individual
          function renderProduct(product) {
            const existingProduct = document.querySelector('.product-card');
            if (existingProduct) {
              const clone = existingProduct.cloneNode(true);

              clone.setAttribute('data-product-id', product.id);

              const image = clone.querySelector('.product-image');
              if (image && product.images && product.images.length > 0) {
                image.src = product.images[0].url;
                image.alt = product.name;
              }

              const title = clone.querySelector('.product-title');
              if (title) {
                title.textContent = product.name;
              }

              const priceElement = clone.querySelector('.price-current');
              if (priceElement) {
                priceElement.textContent = formatMoney(product.price);
              }

              const comparePriceElement = clone.querySelector('.price-compare');
              if (comparePriceElement && product.compareAtPrice) {
                comparePriceElement.textContent = formatMoney(product.compareAtPrice);
              }

              const link = clone.querySelector('.product-link');
              if (link) {
                link.href = '/products/' + product.id;
              }

              const cartButton = clone.querySelector('[onclick*="addProductToCart"]');
              if (cartButton) {
                cartButton.setAttribute('onclick', \`addProductToCart('\${product.id}', 1)\`);
              }

              return clone.outerHTML;
            }

            return \`
              <div class="product-card" data-product-id="\${product.id}">
                <div class="product-image-wrapper">
                  <a href="/products/\${product.id}" class="product-link">
                    <img class="product-image" src="\${product.images?.[0]?.url || ''}" alt="\${product.name}">
                  </a>
                </div>
                <div class="product-info">
                  <h3 class="product-title">\${product.name}</h3>
                  <div class="product-price">
                    <span class="price-current">\${formatMoney(product.price)}</span>
                    \${product.compareAtPrice ? '<span class="price-compare">' + formatMoney(product.compareAtPrice) + '</span>' : ''}
                  </div>
                </div>
              </div>
            \`;
          }

          // Usar la función global de formateo de moneda
          function formatMoney(amount) {
            if (!amount) return '';
            return window.formatMoney ? window.formatMoney(amount) : amount.toString();
          }

          // Manejar scroll infinito
          function handleScroll() {
            if (!FILTER_CONFIG.infiniteScroll || filterState.isLoading || !filterState.hasMore) {
              return;
            }

            const hasActiveFilters = filterState.sort ||
                                   filterState.priceMin ||
                                   filterState.priceMax ||
                                   filterState.categories.length > 0 ||
                                   filterState.tags.length > 0 ||
                                   filterState.vendors.length > 0 ||
                                   filterState.collections.length > 0;

            if (!hasActiveFilters) {
              return;
            }

            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            if (scrollTop + windowHeight >= documentHeight - FILTER_CONFIG.scrollThreshold) {
              applyFilters();
            }
          }

          // Limpiar filtros
          function clearFilters() {
            elements.filterInputs.forEach(input => {
              if (input.type === 'checkbox') {
                input.checked = false;
              } else {
                input.value = '';
              }
            });

            filterState = {
              sort: '',
              priceMin: '',
              priceMax: '',
              categories: [],
              tags: [],
              vendors: [],
              collections: [],
              nextToken: null,
              hasMore: true,
              isLoading: false,
              allProducts: []
            };

            const url = new URL(window.location);
            url.searchParams.delete('limit');
            url.searchParams.delete('sort_by');
            url.searchParams.delete('price_min');
            url.searchParams.delete('price_max');
            url.searchParams.delete('categories');
            url.searchParams.delete('tags');
            url.searchParams.delete('vendors');
            url.searchParams.delete('collections');

            togglePagination(true);
            window.location.href = url.pathname;

            // Emitir evento personalizado
            const event = new CustomEvent('filters:cleared');
            document.dispatchEvent(event);
          }

          // Mostrar/ocultar loading
          function showLoading(show) {
            if (elements.loadingIndicator) {
              elements.loadingIndicator.style.display = show ? 'flex' : 'none';
            }

            // Emitir evento de loading
            const event = new CustomEvent('filters:loading', {
              detail: { loading: show }
            });
            document.dispatchEvent(event);
          }

          // Mostrar error
          function showError(message) {
            const productsContainer = findProductsContainer();
            if (productsContainer) {
              productsContainer.innerHTML = '<p class="error-message">' + message + '</p>';
            }
          }

          // Actualizar URL (sin incluir token)
          function updateURL(params) {
            const url = new URL(window.location);

            url.searchParams.delete('limit');
            url.searchParams.delete('token');
            url.searchParams.delete('sort_by');
            url.searchParams.delete('price_min');
            url.searchParams.delete('price_max');
            url.searchParams.delete('categories');
            url.searchParams.delete('tags');
            url.searchParams.delete('vendors');
            url.searchParams.delete('collections');

            Object.entries(params).forEach(([key, value]) => {
              if (value !== undefined && value !== '' && key !== 'token') {
                url.searchParams.set(key, value);
              }
            });

            window.history.replaceState({}, '', url);
          }

          // Función debounce
          function debounce(func, wait) {
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

          // Cargar filtros desde URL al inicio
          function loadFiltersFromURL() {
            const url = new URL(window.location);
            let hasFilters = false;

            const sort = url.searchParams.get('sort_by');
            if (sort) {
              const sortSelect = elements.container.querySelector('[data-filter="sort"]');
              if (sortSelect) {
                sortSelect.value = sort;
                filterState.sort = sort;
                hasFilters = true;
              }
            }

            const priceMin = url.searchParams.get('price_min');
            const priceMax = url.searchParams.get('price_max');
            if (priceMin) {
              const priceMinInput = elements.container.querySelector('[data-filter="price-min"]');
              if (priceMinInput) {
                priceMinInput.value = priceMin;
                filterState.priceMin = priceMin;
                hasFilters = true;
              }
            }
            if (priceMax) {
              const priceMaxInput = elements.container.querySelector('[data-filter="price-max"]');
              if (priceMaxInput) {
                priceMaxInput.value = priceMax;
                filterState.priceMax = priceMax;
                hasFilters = true;
              }
            }

            const loadMultipleFilter = (paramName, filterType) => {
              const values = url.searchParams.get(paramName);
              if (values) {
                const valueArray = values.split(',');
                valueArray.forEach(value => {
                  const checkbox = elements.container.querySelector(\`[data-filter="\${filterType}"][value="\${value}"]\`);
                  if (checkbox) {
                    checkbox.checked = true;
                    filterState[filterType + 's'].push(value);
                    hasFilters = true;
                  }
                });
              }
            };

            loadMultipleFilter('categories', 'category');
            loadMultipleFilter('tags', 'tag');
            loadMultipleFilter('vendors', 'vendor');
            loadMultipleFilter('collections', 'collection');

            if (hasFilters) {
              togglePagination(false);
              applyFilters();
            }
          }

          // Función para ocultar/mostrar paginación
          function togglePagination(show) {
            const pagination = document.querySelector('.custom-pagination');
            if (pagination) {
              pagination.style.display = show ? '' : 'none';
            }
          }

          // Inicializar cuando el DOM esté listo
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
          } else {
            init();
          }

        })();
      </script>
    `;
  }
}
