import { dataFetcher } from '@/renderer-engine/services/fetchers/data-fetcher';
import { AvailableFilters } from './types';

export class FilterDataFetcher {
  /**
   * Obtiene los filtros disponibles usando el DataFetcher del motor
   */
  static async getAvailableFilters(storeId: string): Promise<AvailableFilters> {
    try {
      // Obtener una muestra de productos para extraer filtros disponibles
      const productsResponse = await dataFetcher.getStoreProducts(storeId, { limit: 50 });
      const products = productsResponse.products;

      if (!products || products.length === 0) {
        console.warn('No products found to extract filters');
        return this.getFallbackFilters();
      }

      // Extraer filtros disponibles de los productos
      const availableFilters = this.extractFiltersFromProducts(products);

      return availableFilters;
    } catch (error) {
      console.warn('Error getting available filters, using fallback:', error);
      return this.getFallbackFilters();
    }
  }

  /**
   * Extrae filtros disponibles de una lista de productos
   */
  private static extractFiltersFromProducts(products: any[]): AvailableFilters {
    const categories = new Set<string>();
    const tags = new Set<string>();
    const vendors = new Set<string>();
    const prices: number[] = [];

    // Extraer datos de cada producto
    products.forEach((product, index) => {
      if (product.category) {
        categories.add(product.category);
      }

      if (product.tags && product.tags !== '[]') {
        try {
          const parsedTags = JSON.parse(product.tags);
          if (Array.isArray(parsedTags)) {
            parsedTags.forEach((tag: string) => tags.add(tag));
          }
        } catch (e) {
          // Si no es JSON válido, tratar como string simple
          if (typeof product.tags === 'string' && product.tags.trim()) {
            tags.add(product.tags.trim());
          }
        }
      }

      if (product.vendor) {
        vendors.add(product.vendor);
      }

      if (product.price && typeof product.price === 'number') {
        prices.push(product.price);
      }
    });

    // Calcular rango de precios
    const priceRange = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 100000,
      currentMin: undefined,
      currentMax: undefined,
    };

    // Convertir Sets a arrays de FilterOption
    const categoriesArray = Array.from(categories).map((cat) => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: 0,
    }));

    const tagsArray = Array.from(tags).map((tag) => ({
      value: tag,
      label: tag.charAt(0).toUpperCase() + tag.slice(1),
      count: 0,
    }));

    const vendorsArray = Array.from(vendors).map((vendor) => ({
      value: vendor,
      label: vendor.charAt(0).toUpperCase() + vendor.slice(1),
      count: 0,
    }));

    const result = {
      categories: categoriesArray,
      tags: tagsArray,
      vendors: vendorsArray,
      collections: [], // Las colecciones se manejan por separado
      priceRange,
      sortOptions: [
        { value: 'createdAt', label: 'Más recientes' },
        { value: 'createdAt_desc', label: 'Más antiguos' },
        { value: 'price', label: 'Precio: menor a mayor' },
        { value: 'price_desc', label: 'Precio: mayor a menor' },
        { value: 'name', label: 'Nombre A-Z' },
        { value: 'name_desc', label: 'Nombre Z-A' },
        { value: 'best_selling', label: 'Más vendidos' },
        { value: 'featured', label: 'Destacados' },
      ],
    };

    return result;
  }

  /**
   * Filtros de fallback cuando la API no está disponible
   */
  private static getFallbackFilters(): AvailableFilters {
    return {
      categories: [
        { value: 'ropa', label: 'Ropa', count: 0 },
        { value: 'accesorios', label: 'Accesorios', count: 0 },
        { value: 'calzado', label: 'Calzado', count: 0 },
      ],
      tags: [
        { value: 'nuevo', label: 'Nuevo', count: 0 },
        { value: 'oferta', label: 'Oferta', count: 0 },
        { value: 'destacado', label: 'Destacado', count: 0 },
        { value: 'popular', label: 'Popular', count: 0 },
        { value: 'tendencia', label: 'Tendencia', count: 0 },
      ],
      vendors: [
        { value: 'marca1', label: 'Marca 1', count: 0 },
        { value: 'marca2', label: 'Marca 2', count: 0 },
      ],
      collections: [
        { value: 'coleccion1', label: 'Colección 1', count: 0 },
        { value: 'coleccion2', label: 'Colección 2', count: 0 },
      ],
      priceRange: {
        min: 0,
        max: 100000,
        currentMin: undefined,
        currentMax: undefined,
      },
      sortOptions: [
        { value: 'createdAt', label: 'Más recientes' },
        { value: 'createdAt_desc', label: 'Más antiguos' },
        { value: 'price', label: 'Precio: menor a mayor' },
        { value: 'price_desc', label: 'Precio: mayor a menor' },
        { value: 'name', label: 'Nombre A-Z' },
        { value: 'name_desc', label: 'Nombre Z-A' },
        { value: 'best_selling', label: 'Más vendidos' },
        { value: 'featured', label: 'Destacados' },
      ],
    };
  }
}
