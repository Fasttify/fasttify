import type { LiquidFilter } from '@/renderer-engine/types'

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
 * Filtro image_url - Para imágenes de productos con transformaciones
 */
export const imageUrlFilter: LiquidFilter = {
  name: 'image_url',
  filter: (imageUrl: string, size?: string): string => {
    // Asegurarse de que imageUrl es un string y no está vacío
    if (typeof imageUrl !== 'string' || !imageUrl) {
      return ''
    }

    // Si ya es una URL completa, devolverla como está
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // TODO: Aplicar transformaciones de tamaño si es necesario
      return imageUrl
    }

    // Si es una imagen de producto, construir URL
    // Por ahora devolvemos la URL original
    // TODO: Implementar transformaciones de imagen (resize, crop, etc.)

    const baseImageUrl = '/images'
    const cleanImageUrl = imageUrl.replace(/^\/+/, '')

    let finalUrl = `${baseImageUrl}/${cleanImageUrl}`

    // Aplicar parámetros de tamaño si se especifican
    if (size) {
      // Ejemplos de size: '300x300', 'master', 'large', 'medium', 'small'
      finalUrl += `?size=${size}`
    }

    return finalUrl
  },
}

/**
 * Filtro variant_url - Para URLs de variantes de productos
 */
export const variantUrlFilter: LiquidFilter = {
  name: 'variant_url',
  filter: (product: any, variant: any): string => {
    if (!product || !product.handle) {
      return '#'
    }

    if (!variant || !variant.id) {
      return `/products/${product.handle}`
    }

    return `/products/${product.handle}?variant=${variant.id}`
  },
}

/**
 * Filtro within - Para URLs de colecciones con productos específicos
 */
export const withinFilter: LiquidFilter = {
  name: 'within',
  filter: (productUrl: string, collection: any): string => {
    if (!collection || !collection.handle) {
      return productUrl
    }

    const separator = productUrl.includes('?') ? '&' : '?'
    return `${productUrl}${separator}collection=${collection.handle}`
  },
}

export const ecommerceFilters: LiquidFilter[] = [
  productUrlFilter,
  collectionUrlFilter,
  imgUrlFilter,
  imageUrlFilter,
  variantUrlFilter,
  withinFilter,
]
