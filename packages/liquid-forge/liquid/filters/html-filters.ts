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

import { logger } from '../../lib/logger';
import type { LiquidFilter } from '../../types';
import { PATH_PATTERNS } from '../../lib/regex-patterns';

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

    const cleanFilename = filename.replace(PATH_PATTERNS.leadingSlash, '');

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

/**
 * Filtro inline_asset_content - Carga el contenido de un asset directamente (para SVGs)
 */
export const inlineAssetContentFilter: LiquidFilter = {
  name: 'inline_asset_content',
  filter: async function (filename: string): Promise<string> {
    if (!filename) {
      return '';
    }

    const cleanFilename = filename.replace(PATH_PATTERNS.leadingSlash, '');

    // Acceder al storeId desde el contexto de LiquidJS
    const storeId = this.context?.getSync(['shop', 'storeId']);

    if (!storeId) {
      logger.warn(`inline_asset_content: storeId not found in context for ${filename}.`, {
        contextKeys: Object.keys(this.context?.getAll() || {}),
      });
      return '';
    }

    try {
      // Importar templateLoader dinámicamente para evitar dependencias circulares
      const { templateLoader } = await import('../../services/templates/template-loader');

      // Cargar el contenido del asset
      const assetContent = await templateLoader.loadAsset(storeId, cleanFilename);

      // Convertir Buffer a string
      return assetContent.toString('utf-8');
    } catch (error) {
      logger.warn(`Failed to load asset content for ${filename}:`, error);
      return '';
    }
  },
};

/**
 * Filtro fasttify_attributes - Genera atributos data-section-id y data-block-id para selección en Theme Studio
 * Compatible con el formato de Shopify: {{ block.fasttify_attributes }} o {{ section.fasttify_attributes }}
 *
 * Uso:
 * - En bloques: <div {{ block.fasttify_attributes }}>
 * - En secciones: <section {{ section.fasttify_attributes }}>
 *
 * Genera: data-section-id="hero" data-block-id="hero-button-1"
 */
export const fasttifyAttributesFilter: LiquidFilter = {
  name: 'fasttify_attributes',
  filter: function (obj?: any): string {
    try {
      let sectionId: string | undefined;
      let blockId: string | undefined;

      // Cuando se llama {{ block.fasttify_attributes }}, obj es el objeto block
      // Cuando se llama {{ section.fasttify_attributes }}, obj es el objeto section
      if (obj && typeof obj === 'object') {
        // Detectar si es un block o una section
        // Los blocks típicamente tienen 'type' y están dentro de un contexto de section
        // Las sections tienen 'blocks' array o están en el contexto global de section
        const isBlock = 'type' in obj && typeof obj.type === 'string' && !('blocks' in obj);

        if (isBlock) {
          // Es un block, necesitamos block.id y section.id del contexto
          blockId = obj.id;

          // Intentar obtener section.id del contexto
          try {
            const section = this.context?.getSync(['section']);
            if (section?.id) {
              sectionId = section.id;
            }
          } catch (error) {
            // Ignorar errores silenciosamente
          }
        } else {
          // Es una section, solo necesitamos section.id
          if (obj.id) {
            sectionId = obj.id;
          }
        }
      }

      // Si aún no tenemos sectionId o blockId, intentar leer del contexto directamente
      if (!sectionId || !blockId) {
        try {
          if (!sectionId) {
            const section = this.context?.getSync(['section']);
            if (section?.id) {
              sectionId = section.id;
            }
          }

          if (!blockId) {
            const block = this.context?.getSync(['block']);
            if (block?.id) {
              blockId = block.id;
            }
          }
        } catch (error) {
          // Ignorar errores silenciosamente
        }
      }

      // Construir los atributos
      const attributes: string[] = [];

      if (sectionId) {
        attributes.push(`data-section-id="${sectionId}"`);
      }

      if (blockId) {
        attributes.push(`data-block-id="${blockId}"`);
        try {
          const section = this.context?.getSync(['section']);
          if (section?.schema?.blocks) {
            const blockSchema = section.schema.blocks.find((b: any) => b.type === obj.type);
            if (blockSchema?.name) {
              attributes.push(`data-block-name="${blockSchema.name}"`);
            }
          }
        } catch (error) {}
      } else if (sectionId) {
        try {
          const section = this.context?.getSync(['section']);
          if (section?.schema?.name) {
            attributes.push(`data-section-name="${section.schema.name}"`);
          }
        } catch (error) {}
      }

      return attributes.length > 0 ? ` ${attributes.join(' ')}` : '';
    } catch (error) {
      logger.error('fasttify_attributes: Error generating fasttify attributes', error);
      return '';
    }
  },
};

export const htmlFilters: LiquidFilter[] = [
  assetUrlFilter,
  linkToFilter,
  stylesheetTagFilter,
  scriptTagFilter,
  defaultPaginationFilter,
  imgTagFilter,
  inlineAssetContentFilter,
  fasttifyAttributesFilter,
];
