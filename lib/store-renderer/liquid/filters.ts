import type { LiquidFilter } from '../types'

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
 * Filtro para generar URLs de productos
 */
export const productUrlFilter: LiquidFilter = {
  name: 'product_url',
  filter: (product: any): string => {
    if (!product || !product.handle) {
      return '#'
    }
    return `/products/${product.handle}`
  },
}

/**
 * Filtro para generar URLs de colecciones
 */
export const collectionUrlFilter: LiquidFilter = {
  name: 'collection_url',
  filter: (collection: any): string => {
    if (!collection || !collection.handle) {
      return '#'
    }
    return `/collections/${collection.handle}`
  },
}

/**
 * Filtro para optimizar imágenes (básico, expandible)
 */
export const imgUrlFilter: LiquidFilter = {
  name: 'img_url',
  filter: (url: string, size?: string): string => {
    if (!url) {
      return ''
    }

    // Por ahora devolvemos la URL original
    // TODO: Implementar optimización de imágenes
    return url
  },
}

/**
 * Filtro para crear URLs absolutas
 */
export const urlFilter: LiquidFilter = {
  name: 'url',
  filter: (path: string, domain?: string): string => {
    if (!path) {
      return ''
    }

    // Si ya es una URL absoluta, la devolvemos tal como está
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }

    // Si no hay dominio, devolvemos la ruta relativa
    if (!domain) {
      return path.startsWith('/') ? path : `/${path}`
    }

    // Construir URL absoluta
    const cleanDomain = domain.replace(/\/+$/, '') // Quitar barras al final
    const cleanPath = path.startsWith('/') ? path : `/${path}`

    return `https://${cleanDomain}${cleanPath}`
  },
}

/**
 * Filtro para formatear fechas
 */
export const dateFilter: LiquidFilter = {
  name: 'date',
  filter: (date: string | Date, format?: string): string => {
    let dateObj: Date

    if (typeof date === 'string') {
      dateObj = new Date(date)
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      return ''
    }

    if (isNaN(dateObj.getTime())) {
      return ''
    }

    // Formatos básicos
    switch (format) {
      case '%B %d, %Y':
        return dateObj.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      case '%Y-%m-%d':
        return dateObj.toISOString().split('T')[0]
      case '%d/%m/%Y':
        return dateObj.toLocaleDateString('es-ES')
      default:
        return dateObj.toLocaleDateString('es-ES')
    }
  },
}

/**
 * Filtro para crear handles/slugs SEO-friendly
 */
export const handleizeFilter: LiquidFilter = {
  name: 'handleize',
  filter: (text: string): string => {
    if (!text) {
      return ''
    }

    return text
      .toLowerCase()
      .trim()
      .replace(/[áàäâã]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöôõ]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  },
}

/**
 * Filtro para pluralizar texto
 */
export const pluralizeFilter: LiquidFilter = {
  name: 'pluralize',
  filter: (count: number, singular: string, plural?: string): string => {
    if (count === 1) {
      return singular
    }

    return plural || `${singular}s`
  },
}

/**
 * Filtro para truncar texto
 */
export const truncateFilter: LiquidFilter = {
  name: 'truncate',
  filter: (text: string, length: number = 50, truncateString: string = '...'): string => {
    if (!text || text.length <= length) {
      return text || ''
    }

    return text.substring(0, length - truncateString.length) + truncateString
  },
}

/**
 * Filtro para escapar HTML
 */
export const escapeFilter: LiquidFilter = {
  name: 'escape',
  filter: (text: string): string => {
    if (!text) {
      return ''
    }

    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
  },
}

/**
 * Array con todos los filtros para registrar
 */
export const ecommerceFilters: LiquidFilter[] = [
  moneyFilter,
  moneyWithoutCurrencyFilter,
  productUrlFilter,
  collectionUrlFilter,
  imgUrlFilter,
  urlFilter,
  dateFilter,
  handleizeFilter,
  pluralizeFilter,
  truncateFilter,
  escapeFilter,
]
