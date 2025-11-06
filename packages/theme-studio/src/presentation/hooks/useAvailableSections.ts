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

export interface AvailableSection {
  type: string;
  name: string;
  category?: string;
  icon?: string;
  description?: string;
}

interface UseAvailableSectionsParams {
  storeId: string | undefined;
  apiBaseUrl: string;
}

interface UseAvailableSectionsResult {
  sections: AvailableSection[];
  isLoading: boolean;
  error: Error | null;
}

export function useAvailableSections({ storeId, apiBaseUrl }: UseAvailableSectionsParams): UseAvailableSectionsResult {
  const { data, isLoading, error } = useQuery<{ sections: AvailableSection[] }>({
    queryKey: ['available-sections', storeId],
    queryFn: async () => {
      if (!storeId) throw new Error('Store ID is required');

      const response = await fetch(`${apiBaseUrl}/stores/${storeId}/themes/sections/available`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to load available sections: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    sections: data?.sections || [],
    isLoading,
    error: error instanceof Error ? error : null,
  };
}
