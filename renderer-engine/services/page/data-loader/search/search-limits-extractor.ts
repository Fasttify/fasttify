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

/**
 * Extrae los límites de búsqueda del archivo settings_schema.json
 * y los hace disponibles globalmente para el motor de renderizado.
 * Busca los settings relevantes en cualquier sección, sin depender del nombre.
 *
 * @param loadedTemplates - Un mapa de plantillas cargadas.
 * @returns Un objeto con los límites de búsqueda extraídos.
 */
export function extractSearchLimitsFromSettings(loadedTemplates: Record<string, string>): {
  searchProductsLimit: number;
  searchCollectionsLimit?: number;
} {
  const settingsSchemaPath = 'config/settings_schema.json';
  const settingsSchemaContent = loadedTemplates[settingsSchemaPath];

  if (!settingsSchemaContent) {
    logger.warn('Settings schema not found, using default search limits');
    return { searchProductsLimit: 8 };
  }

  try {
    const settingsSchema = JSON.parse(settingsSchemaContent);

    let searchProductsLimit = 8;
    let searchCollectionsLimit: number | undefined;

    for (const section of settingsSchema) {
      if (Array.isArray(section.settings)) {
        for (const setting of section.settings) {
          if (setting.id === 'search_products_limit' && typeof setting.default !== 'undefined') {
            searchProductsLimit = Number(setting.default);
          } else if (setting.id === 'search_collections_limit' && typeof setting.default !== 'undefined') {
            searchCollectionsLimit = Number(setting.default);
          }
        }
      }
    }

    logger.info('Search limits extracted from settings', {
      searchProductsLimit,
      searchCollectionsLimit,
    });

    return { searchProductsLimit, searchCollectionsLimit };
  } catch (error) {
    logger.warn('Could not parse settings schema for search limits', error);
    return { searchProductsLimit: 8 };
  }
}
