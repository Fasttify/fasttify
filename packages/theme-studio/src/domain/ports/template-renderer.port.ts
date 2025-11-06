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

import type { Template } from '../entities/template.entity';

/**
 * Parámetros para renderizar una sección
 */
export interface RenderSectionParams {
  storeId: string;
  sectionId: string;
  template: Template;
}

/**
 * Resultado del renderizado de una sección
 */
export interface RenderSectionResult {
  html: string;
  css?: string;
  timestamp: number;
}

/**
 * Puerto (interfaz) para el renderizador de templates
 * Define el contrato para renderizar secciones/bloques usando Liquid
 */
export interface ITemplateRenderer {
  /**
   * Renderizar una sección específica
   * @param params - Parámetros del renderizado
   */
  renderSection(params: RenderSectionParams): Promise<RenderSectionResult>;

  /**
   * Renderizar una página completa
   * @param storeId - ID de la tienda
   * @param template - Template a renderizar
   */
  renderPage(storeId: string, template: Template): Promise<string>;
}
