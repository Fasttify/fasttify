// Re-exportar todos los filtros desde sus módulos específicos
export { baseFilters } from '@/renderer-engine/liquid/filters/base-filters'
export { moneyFilters } from '@/renderer-engine/liquid/filters/money-filters'
export { ecommerceFilters } from '@/renderer-engine/liquid/filters/ecommerce-filters'
export { htmlFilters } from '@/renderer-engine/liquid/filters/html-filters'
export { cartFilters } from '@/renderer-engine/liquid/filters/cart-filters'
export { dataAccessFilters } from '@/renderer-engine/liquid/filters/data-access-filters'

// Importar todos los filtros para el array principal
import { baseFilters } from '@/renderer-engine/liquid/filters/base-filters'
import { moneyFilters } from '@/renderer-engine/liquid/filters/money-filters'
import { ecommerceFilters } from '@/renderer-engine/liquid/filters/ecommerce-filters'
import { htmlFilters } from '@/renderer-engine/liquid/filters/html-filters'
import { cartFilters } from '@/renderer-engine/liquid/filters/cart-filters'
import { dataAccessFilters } from '@/renderer-engine/liquid/filters/data-access-filters'

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
  ...dataAccessFilters,
]

// Mantener compatibilidad hacia atrás
export const ecommerceFiltersLegacy = allFilters
