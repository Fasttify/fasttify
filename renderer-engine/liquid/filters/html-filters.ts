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

import { logger } from '@/renderer-engine/lib/logger';
import type { LiquidFilter } from '@/renderer-engine/types';

/**
 * Filtro asset_url - Para archivos estáticos (CSS, JS, imágenes de tema)
 * NOTA: Este filtro es consciente del contexto y genera la URL con el storeId.
 */
export const assetUrlFilter: LiquidFilter = {
  name: 'asset_url',
  filter: function (filename: string): string {
    if (!filename) {
      return '';
    }

    const cleanFilename = filename.replace(/^\/+/, '');

    // Acceder al storeId desde el contexto de LiquidJS
    const storeId = this.context?.getSync(['shop', 'storeId']);

    if (storeId) {
      // Esta URL debe apuntar al endpoint que sirve los assets estáticos
      return `/api/stores/${storeId}/assets/${cleanFilename}`;
    }

    // Fallback si no hay storeId en el contexto
    logger.warn(`asset_url: storeId not found in context for ${filename}. Using fallback URL.`, {
      contextKeys: Object.keys(this.context?.getAll() || {}),
    });
    return `/assets/${cleanFilename}`;
  },
};

/**
 * Filtro link_to - Para crear enlaces HTML
 */
export const linkToFilter: LiquidFilter = {
  name: 'link_to',
  filter: (text: string, url: string, attributes?: string): string => {
    if (!text || !url) {
      return text || '';
    }

    // Construir los atributos del enlace
    let linkAttributes = '';
    if (attributes) {
      // Los atributos pueden venir como string 'class="my-class" target="_blank"'
      linkAttributes = ` ${attributes}`;
    }

    // Generar el enlace HTML
    return `<a href="${url}"${linkAttributes}>${text}</a>`;
  },
};

/**
 * Filtro stylesheet_tag - Convierte una URL de CSS en un elemento <link> y permite preload (por defecto true)
 */
export const stylesheetTagFilter: LiquidFilter = {
  name: 'stylesheet_tag',
  filter: (url: string, media?: string, preload: boolean = true): string => {
    if (!url) {
      return '';
    }

    // Si se pasa preload como true, agrega un <link rel="preload">
    let preloadTag = '';
    if (preload) {
      preloadTag = `<link rel="preload" as="style" href="${url}">`;
    }

    // Construir atributos del link
    let attributes = `rel="stylesheet" href="${url}"`;
    if (media) {
      attributes += ` media="${media}"`;
    }

    return `${preloadTag}<link ${attributes}>`;
  },
};

/**
 * Filtro script_tag - Convierte una URL de JS en un elemento <script> y permite defer (por defecto true) y preload (por defecto true)
 */
export const scriptTagFilter: LiquidFilter = {
  name: 'script_tag',
  filter: (url: string, attributes?: string, defer: boolean = true, preload: boolean = true): string => {
    if (!url) {
      return '';
    }
    let preloadTag = '';
    if (preload) {
      preloadTag = `<link rel="preload" as="script" href="${url}">`;
    }
    let scriptAttributes = `src="${url}"`;
    if (defer) {
      scriptAttributes += ' defer';
    }
    if (attributes) {
      scriptAttributes += ` ${attributes}`;
    }
    return `${preloadTag}<script ${scriptAttributes}></script>`;
  },
};

/**
 * Filtro default_pagination - Genera controles de paginación HTML
 */
export const defaultPaginationFilter: LiquidFilter = {
  name: 'default_pagination',
  filter: (paginate: any): string => {
    if (!paginate) {
      return '';
    }

    const parts = [];

    // Botón anterior
    if (paginate.previous) {
      parts.push(`<a href="${paginate.previous.url}" class="prev">&laquo; Anterior</a>`);
    } else {
      parts.push(`<span class="prev disabled">&laquo; Anterior</span>`);
    }

    // Páginas numeradas
    if (paginate.parts && Array.isArray(paginate.parts)) {
      paginate.parts.forEach((part: any) => {
        if (!part.is_link) {
          // Página actual o ellipsis
          if (part.title === '…') {
            parts.push(`<span class="ellipsis">…</span>`);
          } else {
            parts.push(`<span class="current">${part.title}</span>`);
          }
        } else {
          // Enlace a otra página
          parts.push(`<a href="${part.url}">${part.title}</a>`);
        }
      });
    }

    // Botón siguiente
    if (paginate.next) {
      parts.push(`<a href="${paginate.next.url}" class="next">Siguiente &raquo;</a>`);
    } else {
      parts.push(`<span class="next disabled">Siguiente &raquo;</span>`);
    }

    return `<div class="pagination">${parts.join('')}</div>`;
  },
};

/**
 * Filtro img_tag - Genera elementos <img> con atributos
 */
export const imgTagFilter: LiquidFilter = {
  name: 'img_tag',
  filter: (src: string, alt?: string, attributes?: string): string => {
    if (!src) {
      return '';
    }

    let imgAttributes = `src="${src}"`;

    if (alt) {
      imgAttributes += ` alt="${alt}"`;
    }

    if (attributes) {
      imgAttributes += ` ${attributes}`;
    }

    return `<img ${imgAttributes}>`;
  },
};

export const htmlFilters: LiquidFilter[] = [
  assetUrlFilter,
  linkToFilter,
  stylesheetTagFilter,
  scriptTagFilter,
  defaultPaginationFilter,
  imgTagFilter,
];
