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

import type { Template } from './template.entity';
import type { TemplateChange } from './editor-session.entity';

/**
 * Entrada del historial que representa un cambio realizado
 * Contiene información necesaria para revertir y re-aplicar el cambio
 */
export interface HistoryEntry {
  id: string;
  timestamp: number;
  type: TemplateChange['type'];
  sectionId: string;
  blockId?: string;
  subBlockId?: string;
  payload: ChangePayload;
  inversePayload: ChangePayload;
  templateBefore: Template;
  templateAfter: Template;
}

/**
 * Payload de un cambio que puede ser aplicado o revertido
 */
export interface ChangePayload {
  type: TemplateChange['type'];
  sectionId: string;
  blockId?: string;
  subBlockId?: string;
  settingId?: string;
  value?: unknown;
  previousValue?: unknown;
  oldIndex?: number;
  newIndex?: number;
  blockData?: {
    id: string;
    type: string;
    settings: Record<string, unknown>;
    blocks?: Array<{
      id: string;
      type: string;
      settings: Record<string, unknown>;
    }>;
  };
  index?: number;
}

/**
 * Entidad de dominio: Historial
 * Mantiene el estado del historial de cambios (undo/redo)
 * Entidad pura sin dependencias externas
 */
export interface History {
  past: HistoryEntry[];
  present: Template | null;
  future: HistoryEntry[];
  maxSize: number;
}
