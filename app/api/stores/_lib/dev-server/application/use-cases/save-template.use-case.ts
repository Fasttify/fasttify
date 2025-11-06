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
import type { TemplateType, Template } from '@fasttify/theme-studio';

/**
 * Caso de uso: Guardar template
 * Orquesta la lógica de negocio para guardar un template en el almacenamiento
 */
export class SaveTemplateUseCase {
  constructor(private readonly templateLoader: ITemplateLoader) {}

  async execute(storeId: string, templateType: TemplateType, template: Template): Promise<void> {
    // 1. Validar estructura del template
    this.validateTemplate(template);

    // 2. Guardar el nuevo template (el backup se crea automáticamente en el adapter)
    await this.templateLoader.saveTemplate(storeId, templateType, template);
  }

  /**
   * Valida la estructura del template antes de guardar
   */
  private validateTemplate(template: Template): void {
    if (!template) {
      throw new Error('Template is required');
    }

    if (!template.type) {
      throw new Error('Template type is required');
    }

    if (!template.sections || typeof template.sections !== 'object') {
      throw new Error('Template sections must be an object');
    }

    if (!Array.isArray(template.order)) {
      throw new Error('Template order must be an array');
    }

    // Validar que todas las secciones en order existan en sections
    for (const sectionId of template.order) {
      if (!template.sections[sectionId]) {
        throw new Error(`Section ${sectionId} in order does not exist in sections`);
      }
    }
  }
}
