// Re-exportar todos los filtros desde sus módulos específicos
export { baseFilters } from './filters/base-filters';
export { cartFilters } from './filters/cart-filters';
export { dataAccessFilters } from './filters/data-access-filters';
export { ecommerceFilters } from './filters/ecommerce-filters';
export { htmlFilters } from './filters/html-filters';
export { moneyFilters } from './filters/money-filters';

// Importar todos los filtros para el array principal
import { baseFilters } from './filters/base-filters';
import { cartFilters } from './filters/cart-filters';
import { dataAccessFilters } from './filters/data-access-filters';
import { ecommerceFilters } from './filters/ecommerce-filters';
import { htmlFilters } from './filters/html-filters';
import { moneyFilters } from './filters/money-filters';

import type { LiquidFilter } from '../types';

/**
 * Array con todos los filtros para registrar en el motor Liquid
 */
export const allFilters: LiquidFilter[] = [
  ...baseFilters,
  ...moneyFilters,
  ...ecommerceFilters,
  ...htmlFilters,
  ...cartFilters,
  ...dataAccessFilters,
];

export const ecommerceFiltersLegacy = allFilters;
