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
 * Caso de uso: Rehacer cambio
 * Rehace el último cambio deshecho y re-renderiza la sección afectada
 */
export class RedoChangeUseCase {
  constructor(
    private readonly historyManager: IHistoryManager,
    private readonly templateManager: ITemplateManager,
    private readonly devServer: IDevServer
  ) {}

  async execute(storeId: string): Promise<void> {
    if (!this.historyManager.canRedo()) {
      return; // No hay cambios para rehacer
    }

    if (!this.devServer.isConnected()) {
      throw new Error('Dev Server is not connected');
    }

    // Obtener el template re-aplicado
    const reappliedTemplate = this.historyManager.redo();
    if (!reappliedTemplate) {
      return;
    }

    // Actualizar el template manager con el template re-aplicado
    this.templateManager.setTemplate(reappliedTemplate);

    // Obtener el último cambio del pasado (que se acaba de mover del futuro)
    // Necesitamos obtenerlo después de que se mueva, así que lo obtenemos del pasado
    const pastEntry = this.historyManager.getLastUndoEntry();
    if (!pastEntry) {
      return;
    }

    // Re-renderizar la sección afectada usando el payload original
    await this.renderAffectedSection(storeId, pastEntry);
  }

  private async renderAffectedSection(storeId: string, entry: any): Promise<void> {
    const { payload, type } = entry;

    // Re-aplicar el valor original usando el payload según el tipo de cambio
    if (payload.settingId && payload.value !== undefined) {
      switch (type) {
        case 'UPDATE_SECTION_SETTING':
          const sectionParams: UpdateSectionSettingParams = {
            storeId,
            sectionId: payload.sectionId,
            settingId: payload.settingId,
            value: payload.value,
          };
          await this.devServer.updateSectionSetting(sectionParams);
          break;

        case 'UPDATE_BLOCK_SETTING':
          if (payload.blockId) {
            const blockParams: UpdateBlockSettingParams = {
              storeId,
              sectionId: payload.sectionId,
              blockId: payload.blockId,
              settingId: payload.settingId,
              value: payload.value,
            };
            await this.devServer.updateBlockSetting(blockParams);
          }
          break;

        case 'UPDATE_SUB_BLOCK_SETTING':
          if (payload.blockId && payload.subBlockId) {
            const subBlockParams: UpdateSubBlockSettingParams = {
              storeId,
              sectionId: payload.sectionId,
              blockId: payload.blockId,
              subBlockId: payload.subBlockId,
              settingId: payload.settingId,
              value: payload.value,
            };
            await this.devServer.updateSubBlockSetting(subBlockParams);
          }
          break;

        default:
          break;
      }
    }
  }
}
