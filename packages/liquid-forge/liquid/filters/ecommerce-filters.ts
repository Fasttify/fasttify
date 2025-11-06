/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { LiquidFilter } from '../../types';
import { PATH_PATTERNS } from '../../lib/regex-patterns';
import { getCdnUrlForKey } from '@/utils/server/cdn-url';

/**
 * Interfaz para parámetros de optimización de imágenes
 */
interface ImageOptimizationParams {
  size?: string;
  format?: string;
  width?: number;
  height?: number;
}

/**
 * Función para construir URLs de imágenes optimizadas
 */
function buildOptimizedImageUrl(baseUrl: string, params: ImageOptimizationParams): string {
  const queryParams = new URLSearchParams();

  // Agregar formato (webp, auto, etc.)
  if (params.format) {
    queryParams.set('format', params.format);
  }

  // Agregar ancho
  if (params.width) {
    queryParams.set('width', params.width.toString());
  }

  // Agregar alto
  if (params.height) {
    queryParams.set('height', params.height.toString());
  }

  // Agregar tamaño (para compatibilidad con el sistema anterior)
  if (params.size) {
    queryParams.set('size', params.size);
  }

  // Si no hay parámetros, devolver URL original
  if (queryParams.toString() === '') {
    return baseUrl;
  }

  return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * Filtro para generar URLs de productos
 */
export const productUrlFilter: LiquidFilter = {
  name: 'product_url',
  filter: (product: any): string => {
    if (!product || !product.slug) {
      return '#';
    }
    return `/products/${product.slug}`;
  },
};

/**
 * Filtro para generar URLs de colecciones
 */
export const collectionUrlFilter: LiquidFilter = {
  name: 'collection_url',
  filter: (collection: any): string => {
    if (!collection || !collection.slug) {
      return '#';
    }
    return `/collections/${collection.slug}`;
  },
};

/**
 * Filtro para optimizar imágenes con sistema de optimización
 */
export const imgUrlFilter: LiquidFilter = {
  name: 'img_url',
  filter: function (url: string, ...args: any[]): string {
    if (!url) {
      return '';
    }

    // Manejar diferentes formatos de parámetros
    let params: ImageOptimizationParams = {};

    if (args.length === 1) {
      // Caso: img_url: '600x800' (compatibilidad)
      if (typeof args[0] === 'string') {
        params.size = args[0];
      }
      // Caso: img_url: { width: 600, height: 800, format: 'auto' }
      else if (typeof args[0] === 'object' && args[0] !== null) {
        params = args[0];
      }
    } else if (args.length > 1) {
      // Caso: img_url: 'webp', 600, 800 (format, width, height)
      if (typeof args[0] === 'object' && args[0] !== null) {
        params = args[0];
      } else if (args.length === 2) {
        // Caso: img_url: 500, 600 (width, height sin format)
        params = {
          width: args[0],
          height: args[1],
        };
      } else {
        // Caso: img_url: format, width, height, etc.
        params = {
          format: args[0],
          width: args[1],
          height: args[2],
        };
      }
    }

    // Si ya es una URL completa (http/https), aplicar optimizaciones directamente
    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
      return buildOptimizedImageUrl(url, params);
    }

    // Si es un string simple sin protocolo (como 'collection-img'), NO intentar construir URL
    // Estos son fallbacks que no corresponden a imágenes reales en S3
    const cleanImageUrl = url.replace(PATH_PATTERNS.leadingSlash, '');

    // Lista de fallbacks conocidos que no son URLs reales
    const knownFallbacks = ['collection-img', 'product-img', 'placeholder'];

    if (knownFallbacks.includes(cleanImageUrl)) {
      // Si es un fallback conocido, devolver string vacío para que no se renderice la imagen
      return '';
    }

    // Si parece ser una ruta de S3/CDN sin protocolo (contiene / y no es un fallback)
    // Intentar construir la URL del CDN solo si parece ser una ruta válida
    if (cleanImageUrl.includes('/') && !cleanImageUrl.startsWith('/')) {
      // Parece ser una ruta de S3 (ej: "images/storeId/file.jpg" o "products/storeId/file.jpg")
      try {
        const cdnUrl = getCdnUrlForKey(cleanImageUrl);
        return buildOptimizedImageUrl(cdnUrl, params);
      } catch {
        // Si falla al construir la URL del CDN, devolver string vacío
        return '';
      }
    }

    // Si no es una URL completa ni una ruta de S3 válida, devolver string vacío
    // No intentar construir URLs que no existen en el bucket
    return '';
  },
};

/**
 * Filtro image_url - Para imágenes de productos con transformaciones y optimización
 */
export const imageUrlFilter: LiquidFilter = {
  name: 'image_url',
  filter: (imageUrl: string, ...args: any[]): string => {
    // Asegurarse de que imageUrl es un string y no está vacío
    if (typeof imageUrl !== 'string' || !imageUrl) {
      return '';
    }

    // Manejar diferentes formatos de parámetros
    let params: ImageOptimizationParams = {};

    if (args.length === 1) {
      // Caso: image_url: '600x800' (compatibilidad)
      if (typeof args[0] === 'string') {
        params.size = args[0];
      }
      // Caso: image_url: { width: 600, height: 800, format: 'auto' }
      else if (typeof args[0] === 'object' && args[0] !== null) {
        params = args[0];
      }
    } else if (args.length > 1) {
      // Caso: image_url: 'webp', 600, 800 (format, width, height)
      if (typeof args[0] === 'object' && args[0] !== null) {
        params = args[0];
      } else if (args.length === 2) {
        // Caso: image_url: 500, 600 (width, height sin format)
        params = {
          width: args[0],
          height: args[1],
        };
      } else {
        // Caso: image_url: format, width, height, etc.
        params = {
          format: args[0],
          width: args[1],
          height: args[2],
        };
      }
    }

    // Si ya es una URL completa, aplicar optimizaciones
    if (typeof imageUrl === 'string' && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
      return buildOptimizedImageUrl(imageUrl, params);
    }

    // Si es una imagen de producto, construir URL con optimizaciones
    const baseImageUrl = '/images';
    const cleanImageUrl = imageUrl.replace(/^\/+/, '');
    const fullUrl = `${baseImageUrl}/${cleanImageUrl}`;

    return buildOptimizedImageUrl(fullUrl, params);
  },
};

/**
 * Filtro variant_url - Para URLs de variantes de productos
 */
export const variantUrlFilter: LiquidFilter = {
  name: 'variant_url',
  filter: (product: any, variant: any): string => {
    if (!product || !product.slug) {
      return '#';
    }

    if (!variant || !variant.id) {
      return `/products/${product.slug}`;
    }

    return `/products/${product.slug}?variant=${variant.id}`;
  },
};

/**
 * Filtro within - Para URLs de colecciones con productos específicos
 */
export const withinFilter: LiquidFilter = {
  name: 'within',
  filter: (productUrl: string, collection: any): string => {
    if (!productUrl) {
      return '';
    }

    if (!collection || !collection.slug) {
      return productUrl;
    }

    const separator = productUrl.includes('?') ? '&' : '?';
    return `${productUrl}${separator}collection=${collection.slug}`;
  },
};

export const ecommerceFilters: LiquidFilter[] = [
  productUrlFilter,
  collectionUrlFilter,
  imgUrlFilter,
  imageUrlFilter,
  variantUrlFilter,
  withinFilter,
];
