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
import type { Template, TemplateType, TemplateBlock } from '../../domain/entities/template.entity';
import type { TemplateChange } from '../../domain/entities/editor-session.entity';

/**
 * Adaptador: Template Manager
 * Implementación concreta del gestor de templates en memoria
 * Mantiene el estado del template durante la sesión de edición
 */
export class TemplateManagerAdapter implements ITemplateManager {
  private currentTemplate: Template | null = null;
  private pendingChanges: TemplateChange[] = [];

  constructor(private readonly templateRepository: ITemplateRepository) {}

  async loadTemplate(storeId: string, templateType: TemplateType): Promise<Template> {
    const template = await this.templateRepository.getTemplate(storeId, templateType);
    if (!template) {
      throw new Error(`Template ${templateType} not found for store ${storeId}`);
    }
    this.currentTemplate = template;
    this.pendingChanges = [];
    return template;
  }

  /**
   * Establece el template directamente sin cargarlo desde el repositorio
   * Útil cuando el template ya está disponible (por ejemplo, recibido por WebSocket)
   */
  setTemplate(template: Template): void {
    this.currentTemplate = template;
    this.pendingChanges = [];
  }

  getCurrentTemplate(): Template | null {
    return this.currentTemplate;
  }

  applyChange(change: TemplateChange): Template {
    if (!this.currentTemplate) {
      throw new Error('No template loaded');
    }

    // Crear copia del template para inmutabilidad
    const updatedTemplate: Template = {
      ...this.currentTemplate,
      sections: { ...this.currentTemplate.sections },
      order: [...this.currentTemplate.order],
    };

    // Aplicar cambio según el tipo
    switch (change.type) {
      case 'UPDATE_SECTION_SETTING':
        if (change.settingId && change.value !== undefined) {
          const section = updatedTemplate.sections[change.sectionId];
          if (section) {
            updatedTemplate.sections[change.sectionId] = {
              ...section,
              settings: {
                ...section.settings,
                [change.settingId]: change.value,
              },
            };
          }
        }
        break;

      case 'UPDATE_BLOCK_SETTING':
        if (change.blockId && change.settingId && change.value !== undefined) {
          const section = updatedTemplate.sections[change.sectionId];
          if (section?.blocks) {
            const settingId = change.settingId as string;
            updatedTemplate.sections[change.sectionId] = {
              ...section,
              blocks: section.blocks.map((block) =>
                block.id === change.blockId
                  ? {
                      ...block,
                      settings: {
                        ...block.settings,
                        [settingId]: change.value,
                      },
                    }
                  : block
              ),
            };
          }
        }
        break;

      case 'UPDATE_SUB_BLOCK_SETTING':
        if (change.blockId && change.subBlockId && change.settingId && change.value !== undefined) {
          const section = updatedTemplate.sections[change.sectionId];
          if (section?.blocks) {
            const settingId = change.settingId as string;
            updatedTemplate.sections[change.sectionId] = {
              ...section,
              blocks: section.blocks.map((block) => {
                if (block.id === change.blockId && block.blocks) {
                  return {
                    ...block,
                    blocks: block.blocks.map((subBlock: TemplateBlock) =>
                      subBlock.id === change.subBlockId
                        ? {
                            ...subBlock,
                            settings: {
                              ...subBlock.settings,
                              [settingId]: change.value,
                            },
                          }
                        : subBlock
                    ),
                  };
                }
                return block;
              }),
            };
          }
        }
        break;

      case 'REORDER_SECTIONS':
        if (change.oldIndex !== undefined && change.newIndex !== undefined) {
          const newOrder = [...updatedTemplate.order];
          const [movedSectionId] = newOrder.splice(change.oldIndex, 1);
          newOrder.splice(change.newIndex, 0, movedSectionId);
          updatedTemplate.order = newOrder;
        }
        break;

      case 'REORDER_BLOCKS':
        if (change.oldIndex !== undefined && change.newIndex !== undefined) {
          const section = updatedTemplate.sections[change.sectionId];
          if (section?.blocks) {
            const newBlocks = [...section.blocks];
            const [movedBlock] = newBlocks.splice(change.oldIndex, 1);
            newBlocks.splice(change.newIndex, 0, movedBlock);
            updatedTemplate.sections[change.sectionId] = {
              ...section,
              blocks: newBlocks,
            };
          }
        }
        break;

      case 'REORDER_SUB_BLOCKS':
        if (change.blockId && change.oldIndex !== undefined && change.newIndex !== undefined) {
          const section = updatedTemplate.sections[change.sectionId];
          if (section?.blocks) {
            updatedTemplate.sections[change.sectionId] = {
              ...section,
              blocks: section.blocks.map((block) => {
                if (block.id === change.blockId && block.blocks) {
                  const newSubBlocks = [...block.blocks];
                  const [movedSubBlock] = newSubBlocks.splice(change.oldIndex!, 1);
                  newSubBlocks.splice(change.newIndex!, 0, movedSubBlock);
                  return {
                    ...block,
                    blocks: newSubBlocks,
                  };
                }
                return block;
              }),
            };
          }
        }
        break;

      // TODO: Implementar otros tipos de cambios (ADD_BLOCK, DELETE_BLOCK, etc.)
    }

    // Actualizar template y agregar cambio a la lista
    this.currentTemplate = updatedTemplate;
    this.pendingChanges.push(change);

    return updatedTemplate;
  }

  getPendingChanges(): TemplateChange[] {
    return [...this.pendingChanges];
  }

  clearPendingChanges(): void {
    this.pendingChanges = [];
  }

  hasPendingChanges(): boolean {
    return this.pendingChanges.length > 0;
  }
}
