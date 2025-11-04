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

import type { AppliedChange } from '../entities/editor-session.entity';
import type { Template, TemplateType } from '../entities/template.entity';

/**
 * Parámetros para actualizar un setting de sección
 */
export interface UpdateSectionSettingParams {
  storeId: string;
  sectionId: string;
  settingId: string;
  value: unknown;
}

/**
 * Parámetros para actualizar un setting de bloque
 */
export interface UpdateBlockSettingParams {
  storeId: string;
  sectionId: string;
  blockId: string;
  settingId: string;
  value: unknown;
}

/**
 * Parámetros para actualizar un setting de sub-bloque
 */
export interface UpdateSubBlockSettingParams {
  storeId: string;
  sectionId: string;
  blockId: string;
  subBlockId: string;
  settingId: string;
  value: unknown;
}

/**
 * Callback para recibir actualizaciones del servidor
 */
export type ChangeAppliedCallback = (change: AppliedChange) => void;

/**
 * Callback para recibir errores del servidor
 */
export type ErrorCallback = (error: Error) => void;

/**
 * Puerto (interfaz) para el servidor de desarrollo
 * Define el contrato que debe cumplir cualquier implementación del Dev Server
 */
export interface IDevServer {
  /**
   * Conectar al servidor de desarrollo
   * @param storeId - ID de la tienda
   * @param onChangeApplied - Callback cuando se aplica un cambio
   * @param onError - Callback cuando hay un error
   * @param templateType - Tipo de template (opcional, por defecto 'index')
   */
  connect(
    storeId: string,
    onChangeApplied: ChangeAppliedCallback,
    onError: ErrorCallback,
    templateType?: TemplateType
  ): Promise<void>;

  /**
   * Desconectar del servidor de desarrollo
   */
  disconnect(): Promise<void>;

  /**
   * Cargar template inicial desde el servidor
   * @param storeId - ID de la tienda
   * @param templateType - Tipo de template a cargar
   */
  loadTemplate(storeId: string, templateType: TemplateType): Promise<Template>;

  /**
   * Actualizar un setting de sección
   * @param params - Parámetros del cambio
   */
  updateSectionSetting(params: UpdateSectionSettingParams): Promise<void>;

  /**
   * Actualizar un setting de bloque
   * @param params - Parámetros del cambio
   */
  updateBlockSetting(params: UpdateBlockSettingParams): Promise<void>;

  /**
   * Actualizar un setting de sub-bloque
   * @param params - Parámetros del cambio
   */
  updateSubBlockSetting(params: UpdateSubBlockSettingParams): Promise<void>;

  /**
   * Obtener el estado de conexión
   */
  isConnected(): boolean;
}
