import { Context, Emitter, Tag } from 'liquidjs';
import { FilterConfig, FilterSystem } from './index';

/**
 * Tag de Liquid para el sistema de filtros modular
 *
 * Uso:
 * {% filters store_id: "123", style: "sidebar", title: "Filtros" %}
 *   <!-- Contenido opcional -->
 * {% endfilters %}
 */
export class FiltersTag extends Tag {
  name = 'filters';
  description = 'Sistema de filtros modular con scroll infinito';

  async render(ctx: Context, emitter: Emitter): Promise<unknown> {
    try {
      // Extraer parámetros del tag
      const params = this.extractParams(this.token);

      // Obtener storeId del contexto o parámetros
      const storeId = params.store_id || (ctx.getSync(['store']) as any)?.id || ctx.getSync(['storeId']);

      if (!storeId) {
        console.error('Error: storeId not found in context');
        return this.renderError('Store ID not found');
      }

      // Crear configuración
      const config: FilterConfig = {
        ...FilterSystem.getDefaultConfig(storeId),
        ...this.parseConfig(params),
      };

      // Validar configuración
      if (!FilterSystem.validateConfig(config)) {
        return this.renderError('Invalid filter configuration');
      }

      // Generar sistema de filtros
      const filterHtml = await FilterSystem.generate(config);

      return filterHtml;
    } catch (error) {
      console.error('Error in filters tag:', error);
      return this.renderError('Error loading filters');
    }
  }

  /**
   * Extrae parámetros del token del tag
   */
  private extractParams(token: any): Record<string, any> {
    const params: Record<string, any> = {};

    if (!token.args) return params;

    // Parsear argumentos del tag usando regex para manejar comillas
    const argsRegex = /(\w+):\s*("([^"]*)"|'([^']*)'|(\S+))/g;
    let match;

    while ((match = argsRegex.exec(token.args)) !== null) {
      const key = match[1];
      const quotedValue = match[2];
      const doubleQuotedValue = match[3];
      const singleQuotedValue = match[4];
      const unquotedValue = match[5];

      // Obtener el valor correcto (priorizar comillas dobles, luego simples, luego sin comillas)
      const value =
        doubleQuotedValue !== undefined
          ? doubleQuotedValue
          : singleQuotedValue !== undefined
            ? singleQuotedValue
            : unquotedValue;

      // Convertir tipos
      if (value === 'true') {
        params[key] = true;
      } else if (value === 'false') {
        params[key] = false;
      } else if (!isNaN(Number(value))) {
        params[key] = Number(value);
      } else {
        params[key] = value;
      }
    }
    return params;
  }

  /**
   * Parsea la configuración desde los parámetros
   */
  private parseConfig(params: Record<string, any>): Partial<FilterConfig> {
    const config: Partial<FilterConfig> = {};

    // Mapear parámetros a configuración
    if (params.style) config.style = params.style;
    if (params.title) config.title = params.title;
    if (params.css_class) config.cssClass = params.css_class;
    if (params.cssClass) config.cssClass = params.cssClass;
    if (params.products_per_page) config.productsPerPage = params.products_per_page;

    // Opciones de visualización
    if (params.show_counts !== undefined) config.showCounts = params.show_counts;
    if (params.show_price_range !== undefined) config.showPriceRange = params.show_price_range;
    if (params.show_sort_options !== undefined) config.showSortOptions = params.show_sort_options;
    if (params.show_clear_button !== undefined) config.showClearButton = params.show_clear_button;

    // Límites
    if (params.max_categories) config.maxCategories = params.max_categories;
    if (params.max_tags) config.maxTags = params.max_tags;
    if (params.max_vendors) config.maxVendors = params.max_vendors;
    if (params.max_collections) config.maxCollections = params.max_collections;

    // Comportamiento
    if (params.infinite_scroll !== undefined) config.infiniteScroll = params.infinite_scroll;
    if (params.scroll_threshold) config.scrollThreshold = params.scroll_threshold;
    if (params.debounce_delay) config.debounceDelay = params.debounce_delay;

    // Mensajes
    if (params.loading_message) config.loadingMessage = params.loading_message;
    if (params.no_results_message) config.noResultsMessage = params.no_results_message;
    if (params.error_message) config.errorMessage = params.error_message;
    if (params.clear_filters_text) config.clearFiltersText = params.clear_filters_text;

    return config;
  }

  /**
   * Renderiza un mensaje de error
   */
  private renderError(message: string): string {
    return `
      <div class="filters-error">
        <p>Error loading filters: ${message}</p>
      </div>
      <style>
        .filters-error {
          padding: 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 4px;
          color: #dc2626;
          margin: 1rem 0;
        }
      </style>
    `;
  }
}
