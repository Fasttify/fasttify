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

/**
 * Puerto: Repositorio de Templates
 * Define el contrato para obtener y guardar templates
 *
 * Esta interfaz será implementada en la capa de infraestructura
 */
export interface ITemplateRepository {
  /**
   * Obtiene un template por tipo desde el almacenamiento
   * @param storeId - ID de la tienda
   * @param templateType - Tipo de template a obtener
   * @returns Template o null si no existe
   */
  getTemplate(storeId: string, templateType: TemplateType): Promise<Template | null>;

  /**
   * Guarda un template en el almacenamiento
   * @param storeId - ID de la tienda
   * @param templateType - Tipo de template
   * @param template - Template a guardar
   */
  saveTemplate(storeId: string, templateType: TemplateType, template: Template): Promise<void>;

  /**
   * Lista todos los tipos de templates disponibles para un store
   * @param storeId - ID de la tienda
   * @returns Array de tipos de templates disponibles
   */
  listTemplates(storeId: string): Promise<TemplateType[]>;
}
