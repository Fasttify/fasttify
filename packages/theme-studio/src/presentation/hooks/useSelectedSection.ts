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

import { useMemo } from 'react';
import { useTemplateStructure } from './useTemplateStructure';
import { useLayoutStructure } from './useLayoutStructure';
import type { TemplateSection } from './useTemplateStructure';

export interface SelectedSectionData {
  section: TemplateSection | null;
  block: {
    id: string;
    type: string;
    settings: Record<string, any>;
    name?: string;
  } | null;
  schema: {
    settings: any[];
    blocks: any[];
  } | null;
  currentSettings: Record<string, any>;
}

interface UseSelectedSectionParams {
  storeId: string | undefined;
  apiBaseUrl: string;
  currentPageId: string;
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  selectedSubBlockId?: string | null;
}

export function useSelectedSection({
  storeId,
  apiBaseUrl,
  currentPageId,
  selectedSectionId,
  selectedBlockId,
  selectedSubBlockId,
}: UseSelectedSectionParams): SelectedSectionData {
  const { template } = useTemplateStructure({
    storeId,
    apiBaseUrl,
    pageType: currentPageId,
  });

  const { layout } = useLayoutStructure({
    storeId,
    apiBaseUrl,
  });

  return useMemo(() => {
    if (!selectedSectionId) {
      return {
        section: null,
        block: null,
        schema: null,
        currentSettings: {},
      };
    }

    // Buscar en template sections
    let section = template?.sections.find((s) => s.id === selectedSectionId) || null;

    // Si no está en template, buscar en layout (header/footer)
    if (!section) {
      const allLayoutSections = [...(layout?.header?.sections || []), ...(layout?.footer?.sections || [])];
      const layoutSection = allLayoutSections.find((s) => s.id === selectedSectionId);
      if (layoutSection) {
        section = {
          id: layoutSection.id,
          type: layoutSection.type,
          name: layoutSection.name,
          settings: {},
          blocks: [],
          schema: layoutSection.schema,
        } as TemplateSection;
      }
    }

    if (!section) {
      return {
        section: null,
        block: null,
        schema: null,
        currentSettings: {},
      };
    }

    // Si hay un sub-bloque seleccionado, obtener sus datos primero
    let block = null;
    if (selectedSubBlockId && selectedBlockId && section.blocks) {
      const parentBlock = section.blocks.find((b: any) => b.id === selectedBlockId);
      if (parentBlock?.blocks) {
        const foundSubBlock = parentBlock.blocks.find((sb: any) => sb.id === selectedSubBlockId);
        if (foundSubBlock) {
          block = {
            id: foundSubBlock.id,
            type: foundSubBlock.type,
            settings: foundSubBlock.settings || {},
            name: foundSubBlock.name,
          };
        }
      }
    } else if (selectedBlockId && section.blocks) {
      // Si hay un bloque seleccionado (no sub-bloque), obtener sus datos
      const foundBlock = section.blocks.find((b: any) => b.id === selectedBlockId);
      if (foundBlock) {
        block = {
          id: foundBlock.id,
          type: foundBlock.type,
          settings: foundBlock.settings || {},
          name: foundBlock.name,
        };
      }
    }

    // Determinar qué schema usar (sub-bloque, bloque o sección)
    let schema = null;
    let currentSettings: Record<string, any> = {};

    if (block && selectedSubBlockId && selectedBlockId) {
      // Si es un sub-bloque, buscar su schema dentro del bloque padre
      const parentBlock = section.blocks?.find((b: any) => b.id === selectedBlockId);
      const parentBlockSchema = section.schema.blocks?.find((b: any) => b.type === parentBlock?.type);
      const subBlockSchema = parentBlockSchema?.blocks?.find((b: any) => b.type === block.type);
      if (subBlockSchema) {
        schema = {
          settings: subBlockSchema.settings || [],
          blocks: [],
        };
        currentSettings = block.settings;
      }
    } else if (block) {
      // Buscar el schema del bloque en schema.blocks
      const blockSchema = section.schema.blocks?.find((b: any) => b.type === block.type);
      if (blockSchema) {
        schema = {
          settings: blockSchema.settings || [],
          blocks: blockSchema.blocks || [],
        };
        currentSettings = block.settings;
      }
    } else {
      // Usar schema de la sección
      schema = {
        settings: section.schema.settings || [],
        blocks: section.schema.blocks || [],
      };
      currentSettings = section.settings || {};
    }

    return {
      section,
      block,
      schema,
      currentSettings,
    };
  }, [template, layout, selectedSectionId, selectedBlockId, selectedSubBlockId]);
}
