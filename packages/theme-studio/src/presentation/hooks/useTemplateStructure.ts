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

import { useQuery } from '@tanstack/react-query';

export interface TemplateSection {
  id: string;
  type: string;
  name: string;
  settings: Record<string, any>;
  blocks?: any[];
  schema: {
    name: string;
    settings: any[];
    blocks: any[];
    presets: any[];
  };
}

interface TemplateStructure {
  pageType: string;
  sections: TemplateSection[];
  order: string[];
}

interface UseTemplateStructureParams {
  storeId: string | undefined;
  apiBaseUrl: string;
  pageType: string;
}

interface UseTemplateStructureResult {
  template: TemplateStructure | null;
  isLoading: boolean;
  error: Error | null;
}

export function useTemplateStructure({
  storeId,
  apiBaseUrl,
  pageType,
}: UseTemplateStructureParams): UseTemplateStructureResult {
  const {
    data: template,
    isLoading,
    error,
  } = useQuery<TemplateStructure>({
    queryKey: ['template-structure', storeId, pageType],
    queryFn: async () => {
      if (!storeId) throw new Error('Store ID is required');
      if (!pageType) throw new Error('Page type is required');

      const response = await fetch(`${apiBaseUrl}/stores/${storeId}/themes/structure/${encodeURIComponent(pageType)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to load template structure: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
    enabled: !!storeId && !!pageType,
    staleTime: 5 * 60 * 1000,
  });

  return {
    template: template || null,
    isLoading,
    error: error instanceof Error ? error : null,
  };
}
