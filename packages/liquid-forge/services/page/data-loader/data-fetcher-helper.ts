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

import { logger } from '../../../lib/logger';
import type { TemplateAnalysis } from '../../templates/analysis/template-analyzer';
import type { PageRenderOptions, PaginationInfo } from '../../../types/template';
import { loadSpecificData } from './handlers/data-handlers';
import { responseProcessors } from './handlers/response-processors';

/**
 * Carga datos basándose en el análisis de plantillas.
 */
export async function loadDataFromAnalysis(
  storeId: string,
  analysis: TemplateAnalysis,
  options: PageRenderOptions,
  searchParams: Record<string, string>
): Promise<{ loadedData: Record<string, any>; paginationInfo: PaginationInfo }> {
  const loadedData: Record<string, any> = {};
  const paginationInfo: PaginationInfo = {};
  const loadPromises: Promise<void>[] = [];

  for (const [dataType, loadOptions] of analysis.requiredData.entries()) {
    const effectiveLoadOptions = { ...loadOptions };

    // Obtener el límite específico para este dataType del análisis de la plantilla
    const specificLimit = analysis.requiredData.get(dataType)?.limit;
    if (specificLimit !== undefined) {
      effectiveLoadOptions.limit = specificLimit;
    }

    if (searchParams.token) {
      effectiveLoadOptions.nextToken = searchParams.token;
    }

    const promise = loadSpecificData(storeId, dataType, effectiveLoadOptions, options)
      .then((data) => {
        if (data) {
          const processor = responseProcessors[dataType];
          if (processor) {
            processor(data, dataType, loadedData, paginationInfo);
          } else {
            loadedData[dataType] = data;
          }
        }
      })
      .catch((error) => {
        logger.warn(`Failed to load ${dataType}`, error, 'DynamicDataLoader');
      });

    loadPromises.push(promise);
  }

  await Promise.all(loadPromises);
  return { loadedData, paginationInfo };
}
