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
import { liquidEngine } from '@/renderer-engine/liquid/engine';
import { schemaParser } from '@/renderer-engine/services/templates/parsing/schema-parser';
import { templateLoader } from '@/renderer-engine/services/templates/template-loader';
import type { RenderContext } from '@/renderer-engine/types';

export class SectionRenderer {
  /**
   * Renderiza una sección extrayendo primero los settings del schema
   */
  public async renderSectionWithSchema(
    sectionName: string,
    templateContent: string,
    baseContext: RenderContext,
    storeTemplate?: any
  ): Promise<string> {
    const schemaSettings = schemaParser.extractSchemaSettings(templateContent);

    // LIMPIAR EL CONTENIDO: Eliminar el bloque schema antes de renderizar
    const schemaRegex = /{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/;
    const cleanedContent = templateContent.replace(schemaRegex, '').trim();

    try {
      // Obtener settings y blocks reales del storeTemplate si existe
      const storeSection = storeTemplate?.sections?.[sectionName];
      const actualSettings = storeSection?.settings || {};
      const actualBlocks = storeSection?.blocks || [];

      // Combinar settings: schema defaults + store actual
      const finalSettings = { ...schemaSettings, ...actualSettings };

      // Crear contexto específico para esta sección
      const sectionContext = {
        ...baseContext,
        section: {
          id: sectionName,
          settings: finalSettings,
          blocks: actualBlocks,
        },
      };

      // Renderizar la sección con el contexto enriquecido
      return await liquidEngine.render(cleanedContent, sectionContext, `section_${sectionName}`);
    } catch (error) {
      logger.error(`Error rendering section ${sectionName}`, error, 'SectionRenderer');

      // Intentar render con contexto más simple como fallback
      if (error instanceof Error && error.message.includes('unexpected')) {
        logger.warn(`Attempting simplified render for section ${sectionName}...`, undefined, 'SectionRenderer');
        try {
          // Contexto más básico sin blocks complejos
          const simpleContext = {
            ...baseContext,
            section: {
              id: sectionName,
              settings: schemaSettings, // Solo usar defaults del schema
            },
          };

          return await liquidEngine.render(cleanedContent, simpleContext, `section_${sectionName}_simple`);
        } catch (fallbackError) {
          logger.error(`Simplified render also failed for ${sectionName}`, fallbackError, 'SectionRenderer');
        }
      }

      // Si todo falla, mostrar placeholder informativo
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return `<!-- Error rendering section '${sectionName}': ${errorMessage.substring(0, 100)}... -->`;
    }
  }

  /**
   * Carga una sección de forma segura sin fallar si no existe
   */
  public async loadSectionSafely(
    storeId: string,
    sectionName: string,
    context: RenderContext,
    storeTemplate?: any
  ): Promise<string> {
    try {
      const sectionContent = await templateLoader.loadTemplate(storeId, `sections/${sectionName}.liquid`);
      return await this.renderSectionWithSchema(sectionName, sectionContent, context, storeTemplate);
    } catch (error) {
      logger.warn(`Section ${sectionName} not found or failed to render`, error, 'SectionRenderer');
      return `<!-- Section '${sectionName}' not found -->`;
    }
  }

  /**
   * Extrae automáticamente los nombres de las secciones del layout
   * Busca todos los {% section 'nombre' %} en el contenido
   */
  public extractSectionNamesFromLayout(layoutContent: string): string[] {
    const sectionRegex = /{%\s*section\s+['"]([^'"]+)['"]\s*%}/g;
    const sectionNames: string[] = [];
    let match;

    while ((match = sectionRegex.exec(layoutContent)) !== null) {
      const sectionName = match[1];
      if (!sectionNames.includes(sectionName)) {
        sectionNames.push(sectionName);
      }
    }

    return sectionNames;
  }
}

export const sectionRenderer = new SectionRenderer();
