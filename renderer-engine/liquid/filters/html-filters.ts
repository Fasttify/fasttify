import type { LiquidFilter } from '@/renderer-engine/types';

/**
 * Filtro asset_url - Para archivos estáticos (CSS, JS, imágenes de tema)
 * NOTA: Este filtro base será sobrescrito dinámicamente en el engine para cada tienda
 */
export const assetUrlFilter: LiquidFilter = {
  name: 'asset_url',
  filter: (filename: string): string => {
    if (!filename) {
      return '';
    }

    // Limpiar el filename
    const cleanFilename = filename.replace(/^\/+/, '');

    // Fallback básico (será sobrescrito por el engine)
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
 * Filtro stylesheet_tag - Convierte una URL de CSS en un elemento <link>
 */
export const stylesheetTagFilter: LiquidFilter = {
  name: 'stylesheet_tag',
  filter: (url: string, media?: string): string => {
    if (!url) {
      return '';
    }

    // Construir atributos del link
    let attributes = `rel="stylesheet" href="${url}"`;
    if (media) {
      attributes += ` media="${media}"`;
    }

    return `<link ${attributes}>`;
  },
};

/**
 * Filtro script_tag - Convierte una URL de JS en un elemento <script>
 */
export const scriptTagFilter: LiquidFilter = {
  name: 'script_tag',
  filter: (url: string, attributes?: string): string => {
    if (!url) {
      return '';
    }

    // Construir atributos del script
    let scriptAttributes = `src="${url}"`;
    if (attributes) {
      scriptAttributes += ` ${attributes}`;
    }

    return `<script ${scriptAttributes}></script>`;
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
