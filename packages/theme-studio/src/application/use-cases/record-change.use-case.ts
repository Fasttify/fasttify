/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IHistoryManager } from '../../domain/ports/history-manager.port';
import type { ITemplateManager } from '../../domain/ports/template-manager.port';
import type { TemplateChange } from '../../domain/entities/editor-session.entity';

/**
 * Caso de uso: Registrar cambio en el historial
 * Registra un cambio en el historial para poder deshacerlo/rehacerlo
 */
export class RecordChangeUseCase {
  constructor(
    private readonly historyManager: IHistoryManager,
    private readonly templateManager: ITemplateManager
  ) {}

  execute(change: TemplateChange): void {
    const templateBefore = this.templateManager.getCurrentTemplate();
    if (!templateBefore) {
      return; // No hay template para registrar el cambio
    }

    // Aplicar el cambio al template
    const templateAfter = this.templateManager.applyChange(change);

    // Registrar en el historial
    this.historyManager.recordChange(change, templateBefore, templateAfter);
  }
}
