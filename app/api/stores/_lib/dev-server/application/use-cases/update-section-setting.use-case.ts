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

import type { ITemplateLoader } from '../../domain/ports/template-loader.port';
import type { ISectionRenderer } from '../../domain/ports/section-renderer.port';
import type { UpdateSectionSettingPayload, AppliedChangePayload } from '../../domain/entities/dev-session.entity';
import type { TemplateType, Template } from '@fasttify/theme-studio';

/**
 * Caso de uso: Actualizar setting de sección y re-renderizar
 * Orquesta la lógica de negocio para actualizar un setting y renderizar la sección
 */
export class UpdateSectionSettingUseCase {
  constructor(
    private readonly templateLoader: ITemplateLoader,
    private readonly sectionRenderer: ISectionRenderer
  ) {}

  async execute(
    payload: UpdateSectionSettingPayload,
    templateType: TemplateType,
    currentTemplate: Template
  ): Promise<AppliedChangePayload & { updatedTemplate?: Template }> {
    const changeId = `change-${Date.now()}-${Math.random()}`;

    try {
      // 1. Actualizar el template en memoria
      const updatedTemplate = JSON.parse(JSON.stringify(currentTemplate)); // Deep copy
      const section = updatedTemplate.sections[payload.sectionId];
      if (!section) {
        throw new Error(`Section ${payload.sectionId} not found`);
      }

      updatedTemplate.sections[payload.sectionId] = {
        ...section,
        settings: {
          ...section.settings,
          [payload.settingId]: payload.value,
        },
      };

      // 2. Re-renderizar la sección
      const renderResult = await this.sectionRenderer.renderSection({
        storeId: payload.storeId,
        sectionId: payload.sectionId,
        template: updatedTemplate,
        pageType: templateType,
      });

      return {
        changeId,
        sectionId: payload.sectionId,
        html: renderResult.html,
        css: renderResult.css,
        success: true,
        timestamp: Date.now(),
        updatedTemplate, // Retornar template actualizado
      };
    } catch (error) {
      return {
        changeId,
        sectionId: payload.sectionId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }
}
