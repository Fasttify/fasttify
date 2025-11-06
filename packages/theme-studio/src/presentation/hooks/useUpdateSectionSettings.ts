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

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateSectionSettingsParams {
  storeId: string | undefined;
  apiBaseUrl: string;
  currentPageId: string;
}

interface UpdateSettingsPayload {
  sectionId: string;
  blockId: string | null;
  settings: Record<string, any>;
}

export function useUpdateSectionSettings({ storeId, apiBaseUrl, currentPageId }: UpdateSectionSettingsParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sectionId, blockId, settings }: UpdateSettingsPayload) => {
      if (!storeId) throw new Error('Store ID is required');

      // Obtener la estructura actual del template
      const response = await fetch(
        `${apiBaseUrl}/stores/${storeId}/themes/structure/${encodeURIComponent(currentPageId)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load template structure: ${response.statusText}`);
      }

      const templateData = await response.json();

      // Actualizar settings en la estructura
      const updatedSections = templateData.sections.map((section: any) => {
        if (section.id === sectionId) {
          if (blockId) {
            // Actualizar settings de un bloque
            const updatedBlocks = section.blocks.map((block: any) => {
              if (block.id === blockId) {
                return {
                  ...block,
                  settings: {
                    ...block.settings,
                    ...settings,
                  },
                };
              }
              return block;
            });
            return {
              ...section,
              blocks: updatedBlocks,
            };
          } else {
            // Actualizar settings de la sección
            return {
              ...section,
              settings: {
                ...section.settings,
                ...settings,
              },
            };
          }
        }
        return section;
      });

      // Guardar la estructura actualizada
      const saveResponse = await fetch(`${apiBaseUrl}/stores/${storeId}/themes/templates`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageType: currentPageId,
          sections: updatedSections,
          order: templateData.order,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error(`Failed to save settings: ${saveResponse.statusText}`);
      }

      return saveResponse.json();
    },
    onSuccess: () => {
      // Invalidar las queries relacionadas para refrescar los datos
      queryClient.invalidateQueries({
        queryKey: ['template-structure', storeId, currentPageId],
      });
    },
  });
}
