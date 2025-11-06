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

/**
 * Filtro fasttify_attributes - Genera atributos data-section-id, data-block-id y data-sub-block-id
 * para selección de elementos en Theme Studio.
 *
 * Compatible con el formato de Shopify: {{ block.fasttify_attributes }} o {{ section.fasttify_attributes }}
 *
 * @example
 * // En bloques:
 * <div {{ block.fasttify_attributes }}>
 * // Genera: data-section-id="hero" data-block-id="hero-button-1"
 *
 * @example
 * // En secciones:
 * <section {{ section.fasttify_attributes }}>
 * // Genera: data-section-id="hero"
 *
 * @example
 * // En sub-bloques (bloques anidados):
 * <div {{ sub_block.fasttify_attributes }}>
 * // Genera: data-section-id="hero" data-block-id="card-1" data-sub-block-id="image-1"
 *
 * @description
 * Este filtro detecta automáticamente si el objeto es:
 * - Una sección: genera solo data-section-id y data-section-name
 * - Un bloque normal: genera data-section-id, data-block-id y data-block-name
 * - Un sub-bloque: genera data-section-id, data-block-id (padre), data-sub-block-id y data-sub-block-name
 *
 * Los nombres se obtienen con la siguiente prioridad:
 * 1. Nombre personalizado del objeto (obj.name desde el JSON)
 * 2. Nombre del schema (schema.blocks[].name o schema.name)
 * 3. ID del objeto como fallback
 *
 * @param {any} obj - El objeto block o section del cual generar los atributos
 * @param {any} [parentBlock] - El bloque padre (opcional, solo para sub-bloques)
 * @returns {string} String con los atributos HTML listos para usar (ej: ' data-section-id="hero" data-block-id="btn-1"')
 *
 * @throws {Error} Logs errores pero no lanza excepciones para no romper el renderizado
 */
export const fasttifyAttributesFilter: LiquidFilter = {
  name: 'fasttify_attributes',
  filter: function (obj?: any, parentBlock?: any): string {
    try {
      let sectionId: string | undefined;
      let blockId: string | undefined;
      let subBlockId: string | undefined;
      let isSubBlock = false;

      // Cuando se llama {{ block.fasttify_attributes }}, obj es el objeto block
      // Cuando se llama {{ section.fasttify_attributes }}, obj es el objeto section
      if (obj && typeof obj === 'object') {
        // Detectar si es un block o una section
        // Los blocks típicamente tienen 'type' y están dentro de un contexto de section
        // Las sections tienen 'blocks' array o están en el contexto global de section
        const isBlock = 'type' in obj && typeof obj.type === 'string';

        if (isBlock) {
          // Verificar si es un sub-bloque (tiene parentBlock o está dentro de otro bloque)
          let hasParentBlock = false;
          if (parentBlock) {
            hasParentBlock = true;
          } else {
            try {
              hasParentBlock = !!(this.context?.getSync && this.context.getSync(['parentBlock']));
            } catch (error) {
              // Ignorar errores silenciosamente
            }
          }

          if (hasParentBlock) {
            isSubBlock = true;
            subBlockId = obj.id;
            // Si hay parentBlock pasado como argumento, obtener su blockId
            if (parentBlock?.id) {
              blockId = parentBlock.id;
            } else {
              // Intentar obtener del contexto
              try {
                const parentBlockFromContext = this.context?.getSync(['parentBlock']);
                if (parentBlockFromContext?.id) {
                  blockId = parentBlockFromContext.id;
                }
              } catch (error) {
                // Ignorar errores silenciosamente
              }
            }
          } else {
            // Es un block normal, necesitamos block.id y section.id del contexto
            blockId = obj.id;
          }

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

      if (isSubBlock && subBlockId) {
        // Es un sub-bloque: agregar data-block-id (padre) y data-sub-block-id (actual)
        if (blockId) {
          attributes.push(`data-block-id="${blockId}"`);
        }
        attributes.push(`data-sub-block-id="${subBlockId}"`);

        try {
          const section = this.context?.getSync(['section']);
          let parentBlockFromContext = parentBlock;
          if (!parentBlockFromContext) {
            try {
              parentBlockFromContext = this.context?.getSync(['parentBlock']);
            } catch (error) {
              // Ignorar errores silenciosamente
            }
          }

          // Prioridad: nombre personalizado del sub-bloque > nombre del schema
          let subBlockName: string | undefined;

          // 1. Intentar obtener el nombre personalizado del sub-bloque (si existe en el JSON)
          if (obj.name && typeof obj.name === 'string') {
            subBlockName = obj.name;
          }

          // 2. Si no hay nombre personalizado, usar el nombre del schema del sub-bloque
          if (!subBlockName && parentBlockFromContext && section?.schema?.blocks) {
            const parentBlockSchema = section.schema.blocks.find((b: any) => b.type === parentBlockFromContext.type);
            const subBlockSchema = parentBlockSchema?.blocks?.find((b: any) => b.type === obj.type);
            subBlockName = subBlockSchema?.name;
          }

          if (subBlockName) {
            attributes.push(`data-sub-block-name="${subBlockName}"`);
          }
        } catch (error) {
          // Ignorar errores silenciosamente
        }
      } else if (blockId) {
        // Es un bloque normal
        attributes.push(`data-block-id="${blockId}"`);
        try {
          const section = this.context?.getSync(['section']);
          // Prioridad: nombre personalizado del bloque > nombre del schema
          let blockName: string | undefined;

          // 1. Intentar obtener el nombre personalizado del bloque (si existe en el JSON)
          if (obj.name && typeof obj.name === 'string') {
            blockName = obj.name;
          }

          // 2. Si no hay nombre personalizado, usar el nombre del schema
          if (!blockName && section?.schema?.blocks) {
            const blockSchema = section.schema.blocks.find((b: any) => b.type === obj.type);
            blockName = blockSchema?.name;
          }

          if (blockName) {
            attributes.push(`data-block-name="${blockName}"`);
          }
        } catch (error) {
          // Ignorar errores silenciosamente
        }
      } else if (sectionId) {
        // Es una sección
        try {
          const section = this.context?.getSync(['section']);
          if (section?.schema?.name) {
            attributes.push(`data-section-name="${section.schema.name}"`);
          }
        } catch (error) {
          // Ignorar errores silenciosamente
        }
      }

      return attributes.length > 0 ? ` ${attributes.join(' ')}` : '';
    } catch (error) {
      logger.error('fasttify_attributes: Error generating fasttify attributes', error);
      return '';
    }
  },
};
