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
 * Parámetros para renderizar una sección
 */
export interface RenderSectionParams {
  storeId: string;
  sectionId: string;
  template: Template; // Template completo con todas las secciones
  pageType: TemplateType;
}

/**
 * Resultado del renderizado de una sección
 */
export interface RenderSectionResult {
  html: string;
  css?: string;
}

/**
 * Puerto (interfaz) para renderizar secciones
 * Define el contrato para renderizar secciones usando Liquid
 */
export interface ISectionRenderer {
  /**
   * Renderizar una sección específica
   * @param params - Parámetros del renderizado
   */
  renderSection(params: RenderSectionParams): Promise<RenderSectionResult>;
}
