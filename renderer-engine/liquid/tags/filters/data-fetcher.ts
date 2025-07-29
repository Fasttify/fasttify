import { logger } from '@/renderer-engine/lib/logger';
import type { AvailableFilters } from './types';

export class FiltersDataFetcher {
  /**
   * Extrae el límite de productos por página desde la configuración del template
   */
  static extractProductsPerPage(storeTemplate: any): number {
    try {
      logger.info('Extracting products_per_page from template:', JSON.stringify(storeTemplate, null, 2));

      // Buscar en la estructura correcta según product.json
      if (storeTemplate?.templates?.product?.sections) {
        const sections = storeTemplate.templates.product.sections;
        logger.info('Searching in templates.product.sections:', sections);

        // Buscar en todas las secciones
        for (const sectionId in sections) {
          const sectionConfig = sections[sectionId];
          if (!sectionConfig) continue;

          const settings = sectionConfig.settings;
          if (settings) {
            logger.info(`Checking section ${sectionId} settings:`, settings);

            // Buscar en configuración con id
            if (settings.id === 'products_per_page' && settings.default !== undefined) {
              logger.info('Found products_per_page in id/default:', settings.default);
              return Number(settings.default);
            }

            // Buscar products_per_page directamente en settings
            if (settings.products_per_page !== undefined) {
              logger.info('Found products_per_page in settings:', settings.products_per_page);
              return Number(settings.products_per_page);
            }
          }
        }
      }

      // Fallback: buscar en la estructura directa del template
      if (storeTemplate?.sections) {
        const sections = storeTemplate.sections;
        logger.info('Searching in direct sections:', sections);

        for (const sectionId in sections) {
          const sectionConfig = sections[sectionId];
          if (!sectionConfig) continue;

          const settings = sectionConfig.settings;
          if (settings) {
            logger.info(`Checking direct section ${sectionId} settings:`, settings);

            // Buscar en configuración con id
            if (settings.id === 'products_per_page' && settings.default !== undefined) {
              logger.info('Found products_per_page in direct sections id/default:', settings.default);
              return Number(settings.default);
            }

            // Buscar products_per_page directamente en settings
            if (settings.products_per_page !== undefined) {
              logger.info('Found products_per_page in direct sections settings:', settings.products_per_page);
              return Number(settings.products_per_page);
            }
          }
        }
      }

      logger.warn('No products_per_page found in template, using default: 50');
      return 50; // Valor por defecto si no se encuentra
    } catch (error) {
      logger.warn('Error extracting products_per_page from template:', error);
      return 50; // Valor por defecto en caso de error
    }
  }

  /**
   * Obtiene los filtros disponibles desde la API
   */
  static async getAvailableFilters(storeId: string, productsPerPage: number = 50): Promise<AvailableFilters> {
    try {
      const response = await fetch(`/api/stores/${storeId}/products/filter?limit=${productsPerPage}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.availableFilters || FiltersDataFetcher.getFallbackFilters();
    } catch (error) {
      logger.warn('Error fetching available filters:', error);
      return FiltersDataFetcher.getFallbackFilters();
    }
  }

  /**
   * Filtros de respaldo en caso de error
   */
  static getFallbackFilters(): AvailableFilters {
    return {
      categories: [],
      tags: [],
      priceRange: { min: 0, max: 1000000 },
      sortOptions: [
        { value: 'created_at_desc', label: 'Más recientes' },
        { value: 'created_at_asc', label: 'Más antiguos' },
        { value: 'price_asc', label: 'Precio: menor a mayor' },
        { value: 'price_desc', label: 'Precio: mayor a menor' },
      ],
    };
  }
}
