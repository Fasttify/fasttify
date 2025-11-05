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
import type { Template } from '../../domain/entities/template.entity';
import type { TemplateChange } from '../../domain/entities/editor-session.entity';
import type { HistoryEntry, ChangePayload } from '../../domain/entities/history.entity';

/**
 * Adaptador: History Manager
 * Implementación concreta del gestor de historial (undo/redo)
 * Mantiene el historial de cambios en memoria
 */
export class HistoryManagerAdapter implements IHistoryManager {
  private past: HistoryEntry[] = [];
  private present: Template | null = null;
  private future: HistoryEntry[] = [];
  private readonly maxSize: number = 100;

  recordChange(change: TemplateChange, templateBefore: Template, templateAfter: Template): void {
    // Crear payload del cambio
    const payload: ChangePayload = {
      type: change.type,
      sectionId: change.sectionId,
      blockId: change.blockId,
      subBlockId: change.subBlockId,
      settingId: change.settingId,
      value: change.value,
    };

    // Crear payload inverso para revertir el cambio
    const inversePayload: ChangePayload = this.createInversePayload(change, templateBefore);

    // Crear entrada del historial
    const entry: HistoryEntry = {
      id: change.id,
      timestamp: change.timestamp,
      type: change.type,
      sectionId: change.sectionId,
      blockId: change.blockId,
      subBlockId: change.subBlockId,
      payload,
      inversePayload,
      templateBefore: JSON.parse(JSON.stringify(templateBefore)), // Deep copy
      templateAfter: JSON.parse(JSON.stringify(templateAfter)), // Deep copy
    };

    // Agregar al historial pasado
    this.past.push(entry);

    // Limitar el tamaño del historial
    if (this.past.length > this.maxSize) {
      this.past.shift(); // Eliminar el más antiguo
    }

    // Limpiar el futuro (ya no se puede rehacer después de un nuevo cambio)
    this.future = [];

    // Actualizar el presente
    this.present = JSON.parse(JSON.stringify(templateAfter)); // Deep copy
  }

  undo(): Template | null {
    if (this.past.length === 0) {
      return null;
    }

    // Tomar el último cambio del pasado
    const entry = this.past.pop()!;

    // Mover al futuro (para poder rehacer)
    this.future.unshift(entry);

    // Actualizar el presente al estado antes del cambio
    this.present = JSON.parse(JSON.stringify(entry.templateBefore)); // Deep copy

    return this.present;
  }

  redo(): Template | null {
    if (this.future.length === 0) {
      return null;
    }

    // Tomar el primer cambio del futuro
    const entry = this.future.shift()!;

    // Mover al pasado (para poder deshacer)
    this.past.push(entry);

    // Actualizar el presente al estado después del cambio
    this.present = JSON.parse(JSON.stringify(entry.templateAfter)); // Deep copy

    return this.present;
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  clear(): void {
    this.past = [];
    this.present = null;
    this.future = [];
  }

  getLastUndoEntry(): HistoryEntry | null {
    return this.past.length > 0 ? this.past[this.past.length - 1] : null;
  }

  getNextRedoEntry(): HistoryEntry | null {
    return this.future.length > 0 ? this.future[0] : null;
  }

  /**
   * Crea el payload inverso para revertir un cambio
   */
  private createInversePayload(change: TemplateChange, templateBefore: Template): ChangePayload {
    const inversePayload: ChangePayload = {
      type: change.type,
      sectionId: change.sectionId,
      blockId: change.blockId,
      subBlockId: change.subBlockId,
      settingId: change.settingId,
    };

    switch (change.type) {
      case 'UPDATE_SECTION_SETTING':
        if (change.settingId) {
          const section = templateBefore.sections[change.sectionId];
          inversePayload.previousValue = section?.settings[change.settingId];
        }
        break;

      case 'UPDATE_BLOCK_SETTING':
        if (change.blockId && change.settingId) {
          const section = templateBefore.sections[change.sectionId];
          const block = section?.blocks?.find((b) => b.id === change.blockId);
          inversePayload.previousValue = block?.settings[change.settingId];
        }
        break;

      case 'UPDATE_SUB_BLOCK_SETTING':
        if (change.blockId && change.subBlockId && change.settingId) {
          const section = templateBefore.sections[change.sectionId];
          const block = section?.blocks?.find((b) => b.id === change.blockId);
          const subBlock = block?.blocks?.find((b) => b.id === change.subBlockId);
          inversePayload.previousValue = subBlock?.settings[change.settingId];
        }
        break;

      case 'ADD_BLOCK':
        // Para revertir ADD_BLOCK, necesitamos el ID del bloque agregado
        inversePayload.blockId = change.blockId;
        break;

      case 'DELETE_BLOCK':
        // Para revertir DELETE_BLOCK, necesitamos guardar el bloque eliminado
        if (change.blockId) {
          const section = templateBefore.sections[change.sectionId];
          const block = section?.blocks?.find((b) => b.id === change.blockId);
          if (block) {
            inversePayload.blockData = {
              id: block.id,
              type: block.type,
              settings: { ...block.settings },
              blocks: block.blocks?.map((sb) => ({
                id: sb.id,
                type: sb.type,
                settings: { ...sb.settings },
              })),
            };
          }
        }
        break;

      case 'REORDER_BLOCKS':
        // Para revertir REORDER_BLOCKS, necesitamos el índice anterior
        inversePayload.index = change.value as number;
        break;

      default:
        break;
    }

    return inversePayload;
  }
}
