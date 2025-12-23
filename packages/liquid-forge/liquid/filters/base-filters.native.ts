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

/**
 * Base Filters con soporte nativo (Rust)
 *
 * Este archivo proporciona versiones híbridas de los filtros base que
 * automáticamente usan la implementación nativa de Rust si está disponible,
 * con fallback transparente a JavaScript.
 */

import type { LiquidFilter } from '../../types';
import { ESCAPE_PATTERNS, HANDLE_PATTERNS } from '../../lib/regex-patterns';
import { createHybridFilter } from '../../lib/native-filters';

/**
 * Implementaciones JavaScript originales (fallback)
 */
const jsAppend = (input: any, value: any): string => {
  const baseValue = input === undefined || input === null || input === '' ? '' : String(input);
  const appendValue = value === undefined || value === null ? '' : String(value);
  return baseValue + appendValue;
};

const jsPrepend = (input: any, value: any): string => {
  const baseValue = input === undefined || input === null || input === '' ? '' : String(input);
  const prependValue = value === undefined || value === null ? '' : String(value);
  return prependValue + baseValue;
};

const jsHandleize = (text: string): string => {
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
};

const jsTruncate = (text: string, length: number = 50, truncateString: string = '...'): string => {
  if (!text || text.length <= length) {
    return text || '';
  }
  return text.substring(0, length - truncateString.length) + truncateString;
};

const jsPluralize = (count: number, singular: string, plural?: string): string => {
  if (count === 1) {
    return singular;
  }
  return plural || `${singular}s`;
};

const jsDefault = (value: any, defaultValue: any): any => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  return value;
};

const jsEscape = (text: string): string => {
  if (!text) {
    return '';
  }

  return text
    .replace(ESCAPE_PATTERNS.ampersand, '&amp;')
    .replace(ESCAPE_PATTERNS.lessThan, '&lt;')
    .replace(ESCAPE_PATTERNS.greaterThan, '&gt;')
    .replace(ESCAPE_PATTERNS.doubleQuote, '&quot;')
    .replace(ESCAPE_PATTERNS.apostrophe, '&#x27;');
};

/**
 * Filtros híbridos - usan Rust si está disponible, JavaScript como fallback
 */
export const appendFilter: LiquidFilter = {
  name: 'append',
  filter: createHybridFilter('append', jsAppend),
};

export const prependFilter: LiquidFilter = {
  name: 'prepend',
  filter: createHybridFilter('prepend', jsPrepend),
};

export const handleizeFilter: LiquidFilter = {
  name: 'handleize',
  filter: createHybridFilter('handleize', jsHandleize),
};

export const truncateFilter: LiquidFilter = {
  name: 'truncate',
  filter: createHybridFilter('truncate', jsTruncate),
};

export const pluralizeFilter: LiquidFilter = {
  name: 'pluralize',
  filter: createHybridFilter('pluralize', jsPluralize),
};

export const defaultFilter: LiquidFilter = {
  name: 'default',
  filter: createHybridFilter('defaultValue', jsDefault),
};

export const escapeFilter: LiquidFilter = {
  name: 'escape',
  filter: createHybridFilter('escape', jsEscape),
};

/**
 * Filtros que no tienen implementación nativa (aún)
 * Mantienen sus implementaciones JavaScript originales
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

export const urlFilter: LiquidFilter = {
  name: 'url',
  filter: (path: string, domain?: string): string => {
    if (!path) {
      return '';
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    if (!domain) {
      return path.startsWith('/') ? path : `/${path}`;
    }

    const cleanDomain = domain.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `https://${cleanDomain}${cleanPath}`;
  },
};

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
  appendFilter,
  prependFilter,
  dateFilter,
  handleizeFilter,
  pluralizeFilter,
  truncateFilter,
  escapeFilter,
  defaultFilter,
  urlFilter,
  whereFilter,
];
