// Re-exportar todos los filtros desde sus módulos específicos
export { baseFilters } from './filters/base-filters'
export { moneyFilters } from './filters/money-filters'
export { ecommerceFilters } from './filters/ecommerce-filters'
export { htmlFilters } from './filters/html-filters'
export { cartFilters } from './filters/cart-filters'

// Importar todos los filtros para el array principal
import { baseFilters } from './filters/base-filters'
import { moneyFilters } from './filters/money-filters'
import { ecommerceFilters } from './filters/ecommerce-filters'
import { htmlFilters } from './filters/html-filters'
import { cartFilters } from './filters/cart-filters'

import type { LiquidFilter } from '@/renderer-engine/types'

/**
 * Array con todos los filtros para registrar en el motor Liquid
 */
export const allFilters: LiquidFilter[] = [
  ...baseFilters,
  ...moneyFilters,
  ...ecommerceFilters,
  ...htmlFilters,
  ...cartFilters,
]

// Mantener compatibilidad hacia atrás
export const ecommerceFiltersLegacy = allFilters
