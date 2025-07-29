import { TagToken } from 'liquidjs';
import { FiltersOptions } from './types';

export class FiltersOptionsParser {
  static parse(tagToken: TagToken): FiltersOptions {
    const options: FiltersOptions = {};
    const args = tagToken.args?.trim() || '';

    if (!args) return options;

    // Parse simple options like: style: 'sidebar', max_categories: 10
    const optionPairs = args.split(',').map((pair) => pair.trim());

    for (const pair of optionPairs) {
      const [key, value] = pair.split(':').map((s) => s.trim());

      if (key && value) {
        const cleanKey = key.replace(/['"]/g, '');
        const cleanValue = value.replace(/['"]/g, '');

        switch (cleanKey) {
          case 'style':
            options.style = cleanValue as 'sidebar' | 'horizontal' | 'modal';
            break;
          case 'max_categories':
            options.maxCategories = parseInt(cleanValue) || 10;
            break;
          case 'max_tags':
            options.maxTags = parseInt(cleanValue) || 15;
            break;
          case 'only':
            options.only = cleanValue.split('|').map((s) => s.trim());
            break;
          case 'except':
            options.except = cleanValue.split('|').map((s) => s.trim());
            break;
          // Nuevas opciones de personalización
          case 'css_class':
          case 'cssClass':
            options.cssClass = cleanValue;
            break;
          case 'custom_template':
          case 'customTemplate':
            options.customTemplate = cleanValue;
            break;
          case 'product_renderer':
          case 'productRenderer':
            options.productRenderer = cleanValue;
            break;
          case 'no_results_message':
          case 'noResultsMessage':
            options.noResultsMessage = cleanValue;
            break;
          case 'loading_message':
          case 'loadingMessage':
            options.loadingMessage = cleanValue;
            break;
        }
      }
    }

    return options;
  }

  static shouldInclude(filterType: string, options: FiltersOptions): boolean {
    if (options.only) {
      return options.only.includes(filterType);
    }

    if (options.except) {
      return !options.except.includes(filterType);
    }

    return true;
  }
}
