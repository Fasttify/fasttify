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

import type { Template, TemplateType } from '../entities/template.entity';
import type { TemplateChange } from '../entities/editor-session.entity';

/**
 * Puerto (interfaz) para el gestor de templates en memoria
 * Mantiene el estado del template durante la sesión de edición
 */
export interface ITemplateManager {
  /**
   * Cargar template inicial
   * @param storeId - ID de la tienda
   * @param templateType - Tipo de template
   */
  loadTemplate(storeId: string, templateType: TemplateType): Promise<Template>;

  /**
   * Obtener el template actual en memoria
   */
  getCurrentTemplate(): Template | null;

  /**
   * Establecer el template directamente sin cargarlo desde el repositorio
   * Útil cuando el template ya está disponible (por ejemplo, recibido por WebSocket o undo/redo)
   * @param template - Template a establecer
   */
  setTemplate(template: Template): void;

  /**
   * Aplicar un cambio al template en memoria
   * @param change - Cambio a aplicar
   */
  applyChange(change: TemplateChange): Template;

  /**
   * Obtener todos los cambios pendientes
   */
  getPendingChanges(): TemplateChange[];

  /**
   * Limpiar cambios pendientes (después de guardar)
   */
  clearPendingChanges(): void;

  /**
   * Verificar si hay cambios sin guardar
   */
  hasPendingChanges(): boolean;
}
