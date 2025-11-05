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

import type { Template } from '../entities/template.entity';
import type { TemplateChange } from '../entities/editor-session.entity';
import type { HistoryEntry, ChangePayload } from '../entities/history.entity';

/**
 * Puerto (interfaz) para el gestor de historial
 * Define el contrato para manejar undo/redo de cambios
 */
export interface IHistoryManager {
  /**
   * Registra un cambio en el historial
   * @param change - Cambio realizado
   * @param templateBefore - Template antes del cambio
   * @param templateAfter - Template después del cambio
   */
  recordChange(change: TemplateChange, templateBefore: Template, templateAfter: Template): void;

  /**
   * Deshace el último cambio
   * @returns Template revertido o null si no hay cambios para deshacer
   */
  undo(): Template | null;

  /**
   * Rehace el último cambio deshecho
   * @returns Template re-aplicado o null si no hay cambios para rehacer
   */
  redo(): Template | null;

  /**
   * Verifica si se puede deshacer
   */
  canUndo(): boolean;

  /**
   * Verifica si se puede rehacer
   */
  canRedo(): boolean;

  /**
   * Limpia el historial
   */
  clear(): void;

  /**
   * Obtiene el último cambio deshecho (para mostrar información)
   */
  getLastUndoEntry(): HistoryEntry | null;

  /**
   * Obtiene el siguiente cambio a rehacer (para mostrar información)
   */
  getNextRedoEntry(): HistoryEntry | null;
}
