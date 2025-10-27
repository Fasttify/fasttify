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

import { Tag, TagToken, Context, TopLevelToken, Liquid } from 'liquidjs';
import { logger } from '../../../lib/logger';

/**
 * Custom Sections Tag para manejar {% sections 'section-group' %} en LiquidJS
 * Este tag replica la funcionalidad de Shopify para incluir grupos de secciones (archivos JSON)
 */
export class SectionsTag extends Tag {
  private sectionGroupName: string = '';

  constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(tagToken, remainTokens, liquid);

    // Parsear el nombre del grupo de secciones del token
    this.parseSectionGroupName(tagToken);
  }

  private parseSectionGroupName(tagToken: TagToken): void {
    // El token viene como: {% sections 'section-group' %}
    // Necesitamos extraer el nombre del grupo de secciones
    const args = tagToken.args?.trim() || '';

    if (!args) {
      throw new Error('Sections tag requires a section group name');
    }

    // Buscar texto entre comillas simples o dobles
    const quotedMatch = args.match(/['"](.*?)['"]/);
    if (quotedMatch) {
      this.sectionGroupName = quotedMatch[1];
    } else {
      // Si no hay comillas, tomar el primer argumento
      this.sectionGroupName = args.split(/\s+/)[0] || '';
    }

    if (!this.sectionGroupName) {
      throw new Error('Sections tag requires a section group name');
    }
  }

  /**
   * Renderiza el grupo de secciones usando las secciones pre-cargadas o fallback
   */
  *render(ctx: Context, emitter: any): Generator<any, void, unknown> {
    try {
      if (!this.sectionGroupName) {
        emitter.write(`<!-- Error: Sections tag requires a section group name -->`);
        return;
      }

      // Intentar obtener secciones pre-cargadas del contexto
      const contextData = ctx.getAll() as any;
      const preloadedSections = contextData.preloaded_sections || {};

      // Para grupos de secciones, buscar secciones individuales que pertenecen al grupo
      const sectionGroupSections = this.getSectionGroupSections(this.sectionGroupName, preloadedSections);

      if (sectionGroupSections.length > 0) {
        for (const sectionContent of sectionGroupSections) {
          emitter.write(sectionContent);
        }
        return;
      }

      // Fallback: mostrar mensaje de grupo de secciones no encontrado
      emitter.write(`<!-- Sections group '${this.sectionGroupName}' not preloaded -->`);
    } catch (error) {
      logger.error(`Error rendering sections group '${this.sectionGroupName}'`, error, 'SectionsTag');
      emitter.write(
        `<!-- Error loading sections group '${this.sectionGroupName}': ${error instanceof Error ? error.message : 'Unknown error'} -->`
      );
    }
  }

  /**
   * Obtiene las secciones individuales que pertenecen al grupo
   */
  private getSectionGroupSections(groupName: string, preloadedSections: any): string[] {
    const sections: string[] = [];

    // Para header-group, buscar announcement-bar y header
    if (groupName === 'header-group') {
      if (preloadedSections['announcement-bar']) sections.push(preloadedSections['announcement-bar']);
      if (preloadedSections['header']) sections.push(preloadedSections['header']);
    }

    // Para footer-group, buscar footer
    if (groupName === 'footer-group') {
      if (preloadedSections['footer']) sections.push(preloadedSections['footer']);
    }

    return sections;
  }

  /**
   * Obtiene el nombre del grupo de secciones que este tag renderiza
   */
  public getSectionGroupName(): string {
    return this.sectionGroupName;
  }
}
