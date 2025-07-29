import { FiltersOptions } from './types';
import { FiltersOptionsParser } from './options-parser';

export class FiltersHtmlRenderer {
  static generateStaticHTML(storeId: string, options: FiltersOptions): string {
    const style = options.style || 'sidebar';
    const cssClass = options.cssClass || 'auto-filters';

    // Usar template personalizado si se proporciona
    if (options.customTemplate) {
      return this.generateCustomTemplate(storeId, options);
    }

    return `
      <div class="${cssClass} ${cssClass}--${style}" data-store-id="${storeId}">
        <div class="${cssClass}__controls">
          <h3 class="${cssClass}__title">Filtros</h3>

          <div class="filters-row">
            ${this.generatePriceFilterGroup(options)}
            ${this.generateAvailabilityFilterGroup(options)}
            ${this.generateSortFilterGroup(options)}
          </div>
        </div>
      </div>

      ${this.generateCSS(options)}
    `;
  }

  private static generateCustomTemplate(storeId: string, options: FiltersOptions): string {
    // Permitir templates completamente personalizados
    let template = options.customTemplate || '';

    // Reemplazar variables en el template
    template = template.replace(/\{\{storeId\}\}/g, storeId);
    template = template.replace(/\{\{cssClass\}\}/g, options.cssClass || 'auto-filters');
    template = template.replace(/\{\{style\}\}/g, options.style || 'sidebar');

    return template + this.generateCSS(options);
  }

  private static generatePriceFilterGroup(options: FiltersOptions): string {
    const cssClass = options.cssClass || 'auto-filters';

    return `
      <div class="filter-group filter-group--inline">
        <label>Precio:</label>
        <input type="number" placeholder="Mín" class="price-input price-input--min">
        <span>-</span>
        <input type="number" placeholder="Máx" class="price-input price-input--max">
      </div>
    `;
  }

  private static generateAvailabilityFilterGroup(options: FiltersOptions): string {
    return `
      <div class="filter-group filter-group--inline">
        <label class="filter-checkbox-label">
          <input type="checkbox" class="availability-filter"> Solo disponibles
        </label>
      </div>
    `;
  }

  private static generateSortFilterGroup(options: FiltersOptions): string {
    return `
      <div class="filter-group filter-group--inline">
        <label>Ordenar:
          <select class="sort-select">
            <option value="createdAt">Más recientes</option>
            <option value="price">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="name">Nombre A-Z</option>
          </select>
        </label>
      </div>
    `;
  }

  private static generateCSS(options: FiltersOptions): string {
    const cssClass = options.cssClass || 'auto-filters';

    // Si hay CSS personalizado, usarlo
    if (options.customTemplate && !options.cssClass) {
      return ''; // No generar CSS si hay template personalizado sin cssClass
    }

    return `
      <style>
        .${cssClass} {
          margin-bottom: 2rem;
          border-bottom: 1px solid #eee;
          padding-bottom: 1rem;
        }

        .${cssClass}__controls {
          background: #f9f9f9;
          padding: 1rem;
          border-radius: 8px;
        }

        .${cssClass}__title {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .filters-row {
          display: flex;
          gap: 2rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-group label {
          font-size: 0.9rem;
          font-weight: 500;
          margin: 0;
        }

        .price-input {
          width: 80px;
          padding: 0.4rem 0.6rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .sort-select {
          padding: 0.4rem 0.6rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .filter-checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .filtering-loading {
          position: relative;
          opacity: 0.6;
          pointer-events: none;
        }

        .filters-loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .loading-spinner {
          padding: 1rem 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          font-size: 0.9rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .filters-row {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .filter-group {
            justify-content: space-between;
          }

          .price-input,
          .sort-select {
            flex: 1;
            max-width: none;
          }
        }
      </style>
    `;
  }

  // Métodos para generar CSS para diferentes frameworks
  static generateBootstrapCSS(options: FiltersOptions): string {
    return `
      <style>
        .auto-filters .filter-group {
          margin-bottom: 1rem;
        }
        .auto-filters .price-input,
        .auto-filters .sort-select {
          border-radius: 0.375rem;
          border: 1px solid #ced4da;
          padding: 0.375rem 0.75rem;
        }
        .auto-filters .btn {
          padding: 0.375rem 0.75rem;
          margin-bottom: 0.5rem;
          border: 1px solid transparent;
          border-radius: 0.375rem;
        }
        .auto-filters .form-check-label {
          margin-bottom: 0;
        }
      </style>
    `;
  }

  static generateTailwindCSS(options: FiltersOptions): string {
    return `
      <style>
        .auto-filters .filter-group {
          @apply mb-4;
        }
        .auto-filters .price-input,
        .auto-filters .sort-select {
          @apply border border-gray-300 rounded-md px-3 py-2 text-sm;
        }
        .auto-filters .filter-checkbox-label {
          @apply flex items-center space-x-2 text-sm;
        }
      </style>
    `;
  }
}
