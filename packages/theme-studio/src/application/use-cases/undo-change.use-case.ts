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
import type {
  IDevServer,
  UpdateSectionSettingParams,
  UpdateBlockSettingParams,
  UpdateSubBlockSettingParams,
} from '../../domain/ports/dev-server.port';

/**
 * Caso de uso: Deshacer cambio
 * Deshace el último cambio realizado y re-renderiza la sección afectada
 */
export class UndoChangeUseCase {
  constructor(
    private readonly historyManager: IHistoryManager,
    private readonly templateManager: ITemplateManager,
    private readonly devServer: IDevServer
  ) {}

  async execute(storeId: string): Promise<void> {
    if (!this.historyManager.canUndo()) {
      return; // No hay cambios para deshacer
    }

    if (!this.devServer.isConnected()) {
      throw new Error('Dev Server is not connected');
    }

    // Obtener el template revertido
    const revertedTemplate = this.historyManager.undo();
    if (!revertedTemplate) {
      return;
    }

    // Actualizar el template manager con el template revertido
    this.templateManager.setTemplate(revertedTemplate);

    // Obtener el último cambio del pasado (que se acaba de mover al futuro)
    // Necesitamos obtenerlo antes de que se mueva, así que lo obtenemos del futuro
    const futureEntry = this.historyManager.getNextRedoEntry();
    if (!futureEntry) {
      return;
    }

    // Re-renderizar la sección afectada usando el payload inverso
    await this.renderAffectedSection(storeId, futureEntry);
  }

  private async renderAffectedSection(storeId: string, entry: any): Promise<void> {
    const { inversePayload, type } = entry;

    // Re-aplicar el valor anterior usando el payload inverso según el tipo de cambio
    if (!inversePayload || !inversePayload.settingId) {
      return;
    }

    // previousValue puede ser undefined si el setting no existía antes (eso es válido)
    // Pasamos undefined al servidor para eliminar el setting

    switch (type) {
      case 'UPDATE_SECTION_SETTING':
        const sectionParams: UpdateSectionSettingParams = {
          storeId,
          sectionId: inversePayload.sectionId,
          settingId: inversePayload.settingId,
          value: inversePayload.previousValue, // Puede ser undefined
        };
        await this.devServer.updateSectionSetting(sectionParams);
        break;

      case 'UPDATE_BLOCK_SETTING':
        if (inversePayload.blockId) {
          const blockParams: UpdateBlockSettingParams = {
            storeId,
            sectionId: inversePayload.sectionId,
            blockId: inversePayload.blockId,
            settingId: inversePayload.settingId,
            value: inversePayload.previousValue,
          };
          await this.devServer.updateBlockSetting(blockParams);
        }
        break;

      case 'UPDATE_SUB_BLOCK_SETTING':
        if (inversePayload.blockId && inversePayload.subBlockId) {
          const subBlockParams: UpdateSubBlockSettingParams = {
            storeId,
            sectionId: inversePayload.sectionId,
            blockId: inversePayload.blockId,
            subBlockId: inversePayload.subBlockId,
            settingId: inversePayload.settingId,
            value: inversePayload.previousValue,
          };
          await this.devServer.updateSubBlockSetting(subBlockParams);
        }
        break;

      default:
        break;
    }
  }
}
