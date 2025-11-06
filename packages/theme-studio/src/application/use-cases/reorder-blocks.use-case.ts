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

import type { IDevServer, ReorderBlocksParams } from '../../domain/ports/dev-server.port';
import type { ITemplateManager } from '../../domain/ports/template-manager.port';
import type { IHistoryManager } from '../../domain/ports/history-manager.port';
import type { ChangeType } from '../../domain/entities/editor-session.entity';

/**
 * Caso de uso: Reordenar bloques dentro de una sección
 * Orquesta la lógica de negocio para reordenar bloques y notificar al Dev Server
 */
export class ReorderBlocksUseCase {
  constructor(
    private readonly devServer: IDevServer,
    private readonly templateManager: ITemplateManager,
    private readonly historyManager?: IHistoryManager
  ) {}

  async execute(params: ReorderBlocksParams): Promise<void> {
    // 1. Validar que hay conexión al Dev Server
    if (!this.devServer.isConnected()) {
      throw new Error('Dev Server is not connected');
    }

    // 2. Obtener template antes del cambio para el historial
    const templateBefore = this.templateManager.getCurrentTemplate();
    if (!templateBefore) {
      throw new Error('No template loaded');
    }

    // 3. Validar que la sección existe y tiene bloques
    const section = templateBefore.sections[params.sectionId];
    if (!section) {
      throw new Error('Section not found');
    }

    if (!section.blocks || section.blocks.length === 0) {
      throw new Error('Section has no blocks');
    }

    // 4. Validar índices
    if (params.oldIndex < 0 || params.newIndex < 0) {
      throw new Error('Invalid indices');
    }

    if (params.oldIndex >= section.blocks.length || params.newIndex >= section.blocks.length) {
      throw new Error('Index out of bounds');
    }

    // 5. Aplicar cambio al template en memoria (optimistic update)
    const change = {
      id: `change-${Date.now()}-${Math.random()}`,
      type: 'REORDER_BLOCKS' as ChangeType,
      sectionId: params.sectionId,
      blockId: section.blocks[params.oldIndex].id,
      oldIndex: params.oldIndex,
      newIndex: params.newIndex,
      timestamp: Date.now(),
    };

    const templateAfter = this.templateManager.applyChange(change);

    // 6. Registrar en el historial si está disponible
    if (this.historyManager) {
      this.historyManager.recordChange(change, templateBefore, templateAfter);
    }

    // 7. Enviar cambio al Dev Server para re-renderizado
    await this.devServer.reorderBlocks(params);
  }
}
