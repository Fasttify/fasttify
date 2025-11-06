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

import type { Template, TemplateType } from './template.entity';

/**
 * Tipo de cambio que se puede realizar en el editor
 */
export type ChangeType =
  | 'UPDATE_SECTION_SETTING'
  | 'UPDATE_BLOCK_SETTING'
  | 'UPDATE_SUB_BLOCK_SETTING'
  | 'ADD_BLOCK'
  | 'DELETE_BLOCK'
  | 'REORDER_SECTIONS'
  | 'REORDER_BLOCKS'
  | 'REORDER_SUB_BLOCKS'
  | 'ADD_SUB_BLOCK'
  | 'DELETE_SUB_BLOCK';

/**
 * Cambio pendiente en el template
 * Entidad de dominio pura que representa un cambio sin aplicar
 */
export interface TemplateChange {
  id: string;
  type: ChangeType;
  sectionId: string;
  blockId?: string;
  subBlockId?: string;
  settingId?: string;
  value?: unknown;
  oldIndex?: number;
  newIndex?: number;
  timestamp: number;
}

/**
 * Sesión de edición del Theme Studio
 * Mantiene el estado del template en memoria durante la sesión de edición
 */
export interface EditorSession {
  sessionId: string;
  storeId: string;
  templateType: TemplateType;
  template: Template;
  changes: TemplateChange[];
  isDirty: boolean;
  isSaving: boolean;
  createdAt: Date;
  lastSavedAt: Date | null;
}

/**
 * Resultado de aplicar un cambio al template
 */
export interface AppliedChange {
  changeId: string;
  sectionId: string;
  html?: string;
  css?: string;
  success: boolean;
  error?: string;
  timestamp: number;
}
