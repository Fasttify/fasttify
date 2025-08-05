import { FilterConfig } from './types';

export class FilterJavaScriptGenerator {
  /**
   * Genera el JavaScript para el sistema de filtros
   */
  static generate(config: FilterConfig): string {
    const cssClass = config.cssClass || 'product-filters';
    const storeId = config.storeId;

    const filterConfig = this.buildFilterConfig(config, cssClass, storeId);
    const scriptContent = this.buildScriptContent(filterConfig);

    return `<script type="module">${scriptContent}</script>`;
  }

  /**
   * Construye la configuración del filtro
   */
  private static buildFilterConfig(config: FilterConfig, cssClass: string, storeId: string): string {
    const configObject = {
      cssClass: cssClass,
      storeId: storeId,
      apiEndpoint: `/api/stores/${storeId}/products/filter`,
      infiniteScroll: config.infiniteScroll ?? true,
      scrollThreshold: config.scrollThreshold ?? 500,
      scrollThresholdPercentage: config.scrollThresholdPercentage ?? 20,
      debounceDelay: config.debounceDelay ?? 300,
      loadingMessage: config.loadingMessage ?? 'Cargando productos...',
      noResultsMessage: config.noResultsMessage ?? 'No se encontraron productos',
      errorMessage: config.errorMessage ?? 'Error cargando productos',
      title: config.title ?? 'Filtros',
      showCounts: config.showCounts !== false,
      showPriceRange: config.showPriceRange !== false,
      showSortOptions: config.showSortOptions !== false,
      showClearButton: config.showClearButton !== false,
      maxCategories: config.maxCategories ?? 10,
      maxTags: config.maxTags ?? 15,
      maxVendors: config.maxVendors ?? 8,
      maxCollections: config.maxCollections ?? 6,
      clearFiltersText: config.clearFiltersText ?? 'Limpiar filtros',
    };

    return JSON.stringify(configObject, null, 2);
  }

  /**
   * Construye el contenido del script
   */
  private static buildScriptContent(filterConfig: string): string {
    return `
      import { initFilterSystem } from 'https://cdn.fasttify.com/assets/filter-main.js';
      const FILTER_CONFIG = ${filterConfig};
      initFilterSystem(FILTER_CONFIG);
    `;
  }
}
