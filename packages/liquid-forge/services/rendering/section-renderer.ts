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
import { liquidEngine } from '../../liquid/engine';
import { schemaParser } from '../templates/parsing/schema-parser';
import { templateLoader } from '../templates/template-loader';
import type { RenderContext } from '../../types';

export class SectionRenderer {
  /**
   * Renderiza una sección extrayendo primero los settings del schema
   */
  public async renderSectionWithSchema(
    sectionName: string,
    templateContent: string,
    baseContext: RenderContext,
    storeTemplate?: any,
    sectionId?: string,
    pageType?: string
  ): Promise<string> {
    const schemaSettings = schemaParser.extractSchemaSettings(templateContent);

    const schemaRegex = /{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/;
    const cleanedContent = templateContent.replace(schemaRegex, '').trim();

    try {
      // Obtener settings y blocks reales del storeTemplate si existe
      // Estructura: storeTemplate.templates[pageType].sections[sectionId]
      let actualSettings: Record<string, any> = {};
      let actualBlocks: any[] = [];

      if (storeTemplate && sectionId && pageType) {
        const templateConfig = storeTemplate.templates?.[pageType];
        const storeSection = templateConfig?.sections?.[sectionId];
        if (storeSection) {
          // Validar que settings sea un objeto de valores, no definiciones
          if (storeSection.settings && typeof storeSection.settings === 'object') {
            // Si tiene propiedades 'type', 'id', 'label', 'default' es una definición incorrecta
            if ('type' in storeSection.settings || 'id' in storeSection.settings) {
              logger.warn(
                `Template section ${sectionId} has incorrect settings format (should be values, not definitions)`,
                undefined,
                'SectionRenderer'
              );
              actualSettings = {};
            } else {
              actualSettings = storeSection.settings;
            }
          }
          actualBlocks = storeSection.blocks || [];
        }
      }

      // Combinar settings: schema defaults + store actual (valores del template sobrescriben defaults)
      const finalSettings = { ...schemaSettings, ...actualSettings };

      // Crear contexto específico para esta sección
      // Usar sectionId si está disponible (ID en el template), si no usar sectionName (tipo de sección)
      const sectionIdForContext = sectionId || sectionName;
      const sectionContext = {
        ...baseContext,
        section: {
          id: sectionIdForContext,
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
          const sectionIdForContext = sectionId || sectionName;
          const simpleContext = {
            ...baseContext,
            section: {
              id: sectionIdForContext,
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
      // Si ya tiene extensión, no agregar .liquid
      const templateName = sectionName.includes('.') ? `sections/${sectionName}` : `sections/${sectionName}.liquid`;
      const sectionContent = await templateLoader.loadTemplate(storeId, templateName);
      return await this.renderSectionWithSchema(sectionName, sectionContent, context, storeTemplate);
    } catch (error) {
      logger.warn(`Section ${sectionName} not found or failed to render`, error, 'SectionRenderer');
      return `<!-- Section '${sectionName}' not found -->`;
    }
  }

  /**
   * Extrae automáticamente los nombres de las secciones del layout
   * Busca todos los {% section 'nombre' %} y {% sections 'grupo' %} en el contenido
   */
  public extractSectionNamesFromLayout(layoutContent: string): string[] {
    const sectionNames: string[] = [];

    // Extraer secciones individuales {% section 'nombre' %}
    const sectionRegex = /{%\s*section\s+['"]([^'"]+)['"]\s*%}/g;
    let match;
    while ((match = sectionRegex.exec(layoutContent)) !== null) {
      const sectionName = match[1];
      if (!sectionNames.includes(sectionName)) {
        sectionNames.push(sectionName);
      }
    }

    // Extraer secciones de grupos {% sections 'grupo' %}
    const sectionsRegex = /{%\s*sections\s+['"]([^'"]+)['"]\s*%}/g;
    while ((match = sectionsRegex.exec(layoutContent)) !== null) {
      const groupName = match[1];

      // Agregar el archivo JSON del grupo
      const groupJsonName = `${groupName}.json`;
      if (!sectionNames.includes(groupJsonName)) {
        sectionNames.push(groupJsonName);
      }

      // Agregar las secciones individuales del grupo
      const groupSections = this.getSectionsFromGroup(groupName);
      for (const sectionName of groupSections) {
        if (!sectionNames.includes(sectionName)) {
          sectionNames.push(sectionName);
        }
      }
    }

    return sectionNames;
  }

  /**
   * Obtiene las secciones individuales que pertenecen a un grupo
   */
  private getSectionsFromGroup(groupName: string): string[] {
    // Para header-group, incluir announcement-bar y header
    if (groupName === 'header-group') {
      return ['announcement-bar', 'header'];
    }

    // Para footer-group, incluir footer
    if (groupName === 'footer-group') {
      return ['footer'];
    }

    // Para otros grupos, retornar vacío por ahora
    return [];
  }
}

export const sectionRenderer = new SectionRenderer();
