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

import type { ITemplateManager } from '../../domain/ports/template-manager.port';
import type { ITemplateRepository } from '../../domain/ports/template-repository.port';
import type { TemplateType } from '../../domain/entities/template.entity';

/**
 * Caso de uso: Guardar cambios
 * Persiste todos los cambios pendientes en la base de datos
 */
export class SaveChangesUseCase {
  constructor(
    private readonly templateManager: ITemplateManager,
    private readonly templateRepository: ITemplateRepository
  ) {}

  async execute(storeId: string, templateType: TemplateType): Promise<void> {
    // 1. Validar que hay cambios pendientes
    if (!this.templateManager.hasPendingChanges()) {
      return; // No hay nada que guardar
    }

    // 2. Obtener template actual con todos los cambios aplicados
    const template = this.templateManager.getCurrentTemplate();
    if (!template) {
      throw new Error('No template to save');
    }

    // 3. Persistir en la base de datos
    await this.templateRepository.saveTemplate(storeId, templateType, template);

    // 4. Limpiar cambios pendientes
    this.templateManager.clearPendingChanges();
  }
}
