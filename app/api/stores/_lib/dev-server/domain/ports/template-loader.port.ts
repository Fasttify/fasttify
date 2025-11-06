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
 * Puerto (interfaz) para cargar templates
 * Define el contrato para obtener templates desde el almacenamiento
 */
export interface ITemplateLoader {
  /**
   * Cargar template por tipo
   * @param storeId - ID de la tienda
   * @param templateType - Tipo de template
   */
  loadTemplate(storeId: string, templateType: TemplateType): Promise<Template>;

  /**
   * Guardar template
   * @param storeId - ID de la tienda
   * @param templateType - Tipo de template
   * @param template - Template a guardar
   */
  saveTemplate(storeId: string, templateType: TemplateType, template: Template): Promise<void>;
}
