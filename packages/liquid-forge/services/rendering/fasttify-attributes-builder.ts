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

import { fasttifyAttributesFilter } from '../../liquid/filters';

interface SectionWithAttributes {
  id: string;
  settings: Record<string, any>;
  blocks: BlockWithAttributes[];
  schema?: {
    name?: string;
    blocks?: Array<{
      type: string;
      name?: string;
      settings?: any[];
    }>;
  };
  fasttify_attributes: string;
}

interface BlockWithAttributes {
  id: string;
  type: string;
  settings: Record<string, any>;
  name?: string;
  blocks?: BlockWithAttributes[];
  fasttify_attributes: string;
}

/**
 * Crea un objeto section con la propiedad fasttify_attributes como getter
 * Cuando LiquidJS accede a section.fasttify_attributes, ejecuta el filtro directamente
 */
export function createSectionWithAttributes(
  sectionId: string,
  settings: Record<string, any>,
  blocks: any[],
  schema?: {
    name?: string;
    blocks?: Array<{
      type: string;
      name?: string;
      settings?: any[];
    }>;
  }
): SectionWithAttributes {
  // Crear primero el objeto section sin los bloques para evitar referencia circular
  const sectionObject: SectionWithAttributes = {
    id: sectionId,
    settings,
    blocks: [], // Se asignará después
    schema, // Incluir el schema para que el filtro pueda acceder a él
    get fasttify_attributes() {
      const mockContext = {
        getSync: (path: string[]) => {
          if (path[0] === 'section') return sectionObject;
          return undefined;
        },
      };
      return fasttifyAttributesFilter.filter.call({ context: mockContext }, sectionObject);
    },
  };

  // Ahora asignar los bloques después de que sectionObject esté inicializado
  sectionObject.blocks = blocks.map((block: any) => createBlockWithAttributes(block, sectionObject, null));

  return sectionObject;
}

/**
 * Crea un objeto block con la propiedad fasttify_attributes como getter
 * Cuando LiquidJS accede a block.fasttify_attributes, ejecuta el filtro directamente
 * @param block - El bloque a crear
 * @param sectionObject - La sección padre
 * @param parentBlock - El bloque padre (si es un sub-bloque)
 */
function createBlockWithAttributes(
  block: any,
  sectionObject: SectionWithAttributes,
  parentBlock: BlockWithAttributes | null
): BlockWithAttributes {
  const blockWithAttributes: BlockWithAttributes = {
    ...block,
    get fasttify_attributes() {
      const mockContext = {
        getSync: (path: string[]) => {
          if (path[0] === 'section') return sectionObject;
          if (path[0] === 'block') return blockWithAttributes;
          if (path[0] === 'parentBlock' && parentBlock) return parentBlock;
          return undefined;
        },
      };
      return fasttifyAttributesFilter.filter.call({ context: mockContext }, blockWithAttributes, parentBlock);
    },
  };

  // Si el bloque tiene sub-bloques, crearlos recursivamente
  if (block.blocks && Array.isArray(block.blocks)) {
    blockWithAttributes.blocks = block.blocks.map((subBlock: any) =>
      createBlockWithAttributes(subBlock, sectionObject, blockWithAttributes)
    );
  }

  return blockWithAttributes;
}
