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
import { ESCAPE_PATTERNS, HANDLE_PATTERNS, URL_PATTERNS } from '../../lib/regex-patterns';

/**
 * Filtro para formatear fechas
 */
export const dateFilter: LiquidFilter = {
  name: 'date',
  filter: (date: string | Date, format?: string): string => {
    let dateObj: Date;

    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return '';
    }

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    // Formatos básicos
    switch (format) {
      case '%B %d, %Y':
        return dateObj.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case '%Y-%m-%d':
        return dateObj.toISOString().split('T')[0];
      case '%d/%m/%Y':
        return dateObj.toLocaleDateString('es-ES');
      default:
        return dateObj.toLocaleDateString('es-ES');
    }
  },
};

/**
 * Filtro para crear handles/slugs SEO-friendly
 */
export const handleizeFilter: LiquidFilter = {
  name: 'handleize',
  filter: (text: string): string => {
    if (!text) {
      return '';
    }

    return text
      .toLowerCase()
      .trim()
      .replace(HANDLE_PATTERNS.aVariants, 'a')
      .replace(HANDLE_PATTERNS.eVariants, 'e')
      .replace(HANDLE_PATTERNS.iVariants, 'i')
      .replace(HANDLE_PATTERNS.oVariants, 'o')
      .replace(HANDLE_PATTERNS.uVariants, 'u')
      .replace(HANDLE_PATTERNS.enye, 'n')
      .replace(HANDLE_PATTERNS.cCedilla, 'c')
      .replace(HANDLE_PATTERNS.nonAlphanumeric, '-')
      .replace(HANDLE_PATTERNS.multipleDashes, '-')
      .replace(HANDLE_PATTERNS.leadingTrailingDash, '');
  },
};

/**
 * Filtro para pluralizar texto
 */
export const pluralizeFilter: LiquidFilter = {
  name: 'pluralize',
  filter: (count: number, singular: string, plural?: string): string => {
    if (count === 1) {
      return singular;
    }

    return plural || `${singular}s`;
  },
};

/**
 * Filtro para truncar texto
 */
export const truncateFilter: LiquidFilter = {
  name: 'truncate',
  filter: (text: string, length: number = 50, truncateString: string = '...'): string => {
    if (!text || text.length <= length) {
      return text || '';
    }

    return text.substring(0, length - truncateString.length) + truncateString;
  },
};

/**
 * Filtro para escapar HTML
 */
export const escapeFilter: LiquidFilter = {
  name: 'escape',
  filter: (text: string): string => {
    if (!text) {
      return '';
    }

    return text
      .replace(ESCAPE_PATTERNS.ampersand, '&amp;')
      .replace(ESCAPE_PATTERNS.lessThan, '&lt;')
      .replace(ESCAPE_PATTERNS.greaterThan, '&gt;')
      .replace(ESCAPE_PATTERNS.doubleQuote, '&quot;')
      .replace(ESCAPE_PATTERNS.apostrophe, '&#x27;');
  },
};

/**
 * Filtro default - Para valores por defecto
 */
export const defaultFilter: LiquidFilter = {
  name: 'default',
  filter: (value: any, defaultValue: any): any => {
    // Retornar el valor por defecto si el valor original es nulo, undefined, o string vacío
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    return value;
  },
};

/**
 * Filtro para crear URLs absolutas
 */
export const urlFilter: LiquidFilter = {
  name: 'url',
  filter: (path: string, domain?: string): string => {
    if (!path) {
      return '';
    }

    // Si ya es una URL absoluta, la devolvemos tal como está
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // Si no hay dominio, devolvemos la ruta relativa
    if (!domain) {
      return path.startsWith('/') ? path : `/${path}`;
    }

    // Construir URL absoluta
    const cleanDomain = domain.replace(/\/+$/, ''); // Quitar barras al final
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `https://${cleanDomain}${cleanPath}`;
  },
};

/**
 * Filtro where - Para filtrar un array de objetos por una propiedad y valor
 */
export const whereFilter: LiquidFilter = {
  name: 'where',
  filter: (array: any[], property: string, value: any): any[] => {
    if (!Array.isArray(array) || !property) {
      return [];
    }
    return array.filter((item) => item && item[property] === value);
  },
};

export const baseFilters: LiquidFilter[] = [
  dateFilter,
  handleizeFilter,
  pluralizeFilter,
  truncateFilter,
  escapeFilter,
  defaultFilter,
  urlFilter,
  whereFilter,
];
