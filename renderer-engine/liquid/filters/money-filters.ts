import type { LiquidFilter } from '@/renderer-engine/types'

/**
 * Filtro para formatear precios con moneda
 */
export const moneyFilter: LiquidFilter = {
  name: 'money',
  filter: (amount: number | string, format?: string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

    if (isNaN(numAmount)) {
      return '$0.00'
    }

    // Formato por defecto o personalizado
    const defaultFormat = '${{amount}}'
    const actualFormat = format || defaultFormat

    // Formatear el número con separadores de miles
    const formattedAmount = new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount)

    return actualFormat.replace('{{amount}}', formattedAmount)
  },
}

/**
 * Filtro para formatear precios sin decimales
 */
export const moneyWithoutCurrencyFilter: LiquidFilter = {
  name: 'money_without_currency',
  filter: (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

    if (isNaN(numAmount)) {
      return '0.00'
    }

    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount)
  },
}

/**
 * Filtro para formatear precios en centavos
 */
export const moneyWithoutDecimalFilter: LiquidFilter = {
  name: 'money_without_decimal',
  filter: (amount: number | string, format?: string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

    if (isNaN(numAmount)) {
      return '$0'
    }

    const defaultFormat = '${{amount}}'
    const actualFormat = format || defaultFormat

    const formattedAmount = new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount)

    return actualFormat.replace('{{amount}}', formattedAmount)
  },
}

/**
 * Filtro para convertir centavos a pesos
 */
export const centsToPriceFilter: LiquidFilter = {
  name: 'cents_to_price',
  filter: (cents: number | string): number => {
    const numCents = typeof cents === 'string' ? parseFloat(cents) : cents

    if (isNaN(numCents)) {
      return 0
    }

    return numCents / 100
  },
}

export const moneyFilters: LiquidFilter[] = [
  moneyFilter,
  moneyWithoutCurrencyFilter,
  moneyWithoutDecimalFilter,
  centsToPriceFilter,
]
