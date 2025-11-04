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

/**
 * Detecta si un template Liquid tiene el filtro fasttify_attributes configurado
 */
export class FasttifyAttributesDetector {
  /**
   * Detecta si el template tiene {{ section.fasttify_attributes }} o {{ block.fasttify_attributes }}
   * @param templateContent - Contenido del template Liquid
   * @returns true si tiene el filtro, false si no
   */
  static hasFasttifyAttributes(templateContent: string): boolean {
    if (!templateContent || typeof templateContent !== 'string') {
      return false;
    }

    // Patrones para detectar el filtro en diferentes formatos:
    // - {{ section.fasttify_attributes }}
    // - {{block.fasttify_attributes}}
    // - {{ section.fasttify_attributes | filter }}
    // - {{ block.fasttify_attributes }}
    const patterns = [
      /\{\{\s*section\.fasttify_attributes\s*\}\}/i,
      /\{\{\s*block\.fasttify_attributes\s*\}\}/i,
      /\{\{\s*section\.fasttify_attributes\s*\|/i,
      /\{\{\s*block\.fasttify_attributes\s*\|/i,
      /\{\{-\s*section\.fasttify_attributes\s*-\}\}/i,
      /\{\{-\s*block\.fasttify_attributes\s*-\}\}/i,
    ];

    return patterns.some((pattern) => pattern.test(templateContent));
  }

  /**
   * Detecta si el template tiene fasttify_attributes para secciones
   * @param templateContent - Contenido del template Liquid
   * @returns true si tiene {{ section.fasttify_attributes }}
   */
  static hasSectionFasttifyAttributes(templateContent: string): boolean {
    if (!templateContent || typeof templateContent !== 'string') {
      return false;
    }

    const patterns = [
      /\{\{\s*section\.fasttify_attributes\s*\}\}/i,
      /\{\{\s*section\.fasttify_attributes\s*\|/i,
      /\{\{-\s*section\.fasttify_attributes\s*-\}\}/i,
    ];

    return patterns.some((pattern) => pattern.test(templateContent));
  }

  /**
   * Detecta si el template tiene fasttify_attributes para bloques
   * @param templateContent - Contenido del template Liquid
   * @returns true si tiene {{ block.fasttify_attributes }}
   */
  static hasBlockFasttifyAttributes(templateContent: string): boolean {
    if (!templateContent || typeof templateContent !== 'string') {
      return false;
    }

    const patterns = [
      /\{\{\s*block\.fasttify_attributes\s*\}\}/i,
      /\{\{\s*block\.fasttify_attributes\s*\|/i,
      /\{\{-\s*block\.fasttify_attributes\s*-\}\}/i,
    ];

    return patterns.some((pattern) => pattern.test(templateContent));
  }
}
