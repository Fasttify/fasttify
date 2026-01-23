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

import type { Template, TemplateType } from '@fasttify/theme-studio';

/**
 * Sesión de desarrollo activa
 * Mantiene el estado del template en memoria durante la sesión de edición
 */
export interface DevSession {
  sessionId: string;
  storeId: string;
  templateType: TemplateType;
  template: Template;
  createdAt: Date;
  lastActivityAt: Date;
}

/**
 * Mensaje del cliente al servidor
 */
export type ClientMessage =
  | { type: 'UPDATE_SECTION_SETTING'; payload: UpdateSectionSettingPayload }
  | { type: 'UPDATE_BLOCK_SETTING'; payload: UpdateBlockSettingPayload }
  | { type: 'UPDATE_SUB_BLOCK_SETTING'; payload: UpdateSubBlockSettingPayload }
  | { type: 'LOAD_TEMPLATE'; payload: { storeId: string; templateType: TemplateType } };

/**
 * Mensaje del servidor al cliente
 */
export type ServerMessage =
  | { type: 'CHANGE_APPLIED'; payload: AppliedChangePayload }
  | { type: 'RENDER_ERROR'; payload: { error: string; sectionId: string } }
  | { type: 'TEMPLATE_LOADED'; payload: { template: Template } }
  | { type: 'CONNECTED'; payload: { sessionId: string } };

export interface UpdateSectionSettingPayload {
  storeId: string;
  sectionId: string;
  settingId: string;
  value: unknown;
}

export interface UpdateBlockSettingPayload {
  storeId: string;
  sectionId: string;
  blockId: string;
  settingId: string;
  value: unknown;
}

export interface UpdateSubBlockSettingPayload {
  storeId: string;
  sectionId: string;
  blockId: string;
  subBlockId: string;
  settingId: string;
  value: unknown;
}

export interface AppliedChangePayload {
  changeId: string;
  sectionId: string;
  html?: string;
  css?: string;
  success: boolean;
  error?: string;
  timestamp: number;
}
