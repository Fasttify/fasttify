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

import type { IDevServer, UpdateBlockSettingParams } from '../../domain/ports/dev-server.port';
import type { ITemplateManager } from '../../domain/ports/template-manager.port';
import type { IHistoryManager } from '../../domain/ports/history-manager.port';
import type { ChangeType } from '../../domain/entities/editor-session.entity';

/**
 * Caso de uso: Actualizar setting de bloque
 * Orquesta la lógica de negocio para actualizar un setting de bloque
 */
export class UpdateBlockSettingUseCase {
  constructor(
    private readonly devServer: IDevServer,
    private readonly templateManager: ITemplateManager,
    private readonly historyManager?: IHistoryManager
  ) {}

  async execute(params: UpdateBlockSettingParams): Promise<void> {
    if (!this.devServer.isConnected()) {
      throw new Error('Dev Server is not connected');
    }

    const templateBefore = this.templateManager.getCurrentTemplate();
    if (!templateBefore) {
      throw new Error('No template loaded');
    }

    const change = {
      id: `change-${Date.now()}-${Math.random()}`,
      type: 'UPDATE_BLOCK_SETTING' as ChangeType,
      sectionId: params.sectionId,
      blockId: params.blockId,
      settingId: params.settingId,
      value: params.value,
      timestamp: Date.now(),
    };

    const templateAfter = this.templateManager.applyChange(change);

    if (this.historyManager) {
      this.historyManager.recordChange(change, templateBefore, templateAfter);
    }

    await this.devServer.updateBlockSetting(params);
  }
}
