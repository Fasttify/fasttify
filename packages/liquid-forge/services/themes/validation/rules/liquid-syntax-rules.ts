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

import { compileTemplate } from '../../../../compiler';
import type {
  ThemeFile,
  ThemeValidationConfig,
  ValidationError,
  ValidationResult,
  ValidationWarning,
} from '../../types';
import { filterLiquidFiles } from '../utils/file-filters';

export class LiquidSyntaxRules {
  /**
   * Valida la sintaxis básica de archivos Liquid
   */
  static async validateLiquidSyntax(files: ThemeFile[], config: ThemeValidationConfig): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Filtrar solo archivos Liquid
    const liquidFiles = filterLiquidFiles(files);

    for (const file of liquidFiles) {
      try {
        // Validar sintaxis básica
        compileTemplate(file.content as string);

        // Verificar tamaño del archivo
        if (file.size > 1024 * 1024) {
          // 1MB
          warnings.push({
            type: 'performance',
            message: `Large Liquid file: ${file.path} (${(file.size / 1024).toFixed(2)}KB)`,
            file: file.path,
            suggestion: 'Consider splitting large files for better performance',
          });
        }
      } catch (error) {
        errors.push({
          type: 'syntax',
          message: `Invalid Liquid syntax in ${file.path}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          file: file.path,
          severity: 'error',
        });
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Valida patrones de seguridad en archivos Liquid
   */
  static validateSecurityPatterns(files: ThemeFile[], config: ThemeValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Filtrar solo archivos Liquid
    const liquidFiles = filterLiquidFiles(files);

    for (const file of liquidFiles) {
      const content = file.content as string;

      for (const pattern of config.forbiddenPatterns) {
        if (pattern.test(content)) {
          warnings.push({
            type: 'security',
            message: `Potentially unsafe pattern detected in ${file.path}`,
            file: file.path,
            suggestion: 'Review external resources for security',
          });
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Valida la estructura de secciones en archivos Liquid
   */
  static validateSectionStructure(files: ThemeFile[], config: ThemeValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const sectionFiles = files.filter(
      (f) => typeof f.content === 'string' && f.path.startsWith('sections/') && f.type === 'liquid'
    );

    for (const file of sectionFiles) {
      const content = file.content as string;

      // Verificar que tenga schema
      if (!content.includes('{% schema %}')) {
        warnings.push({
          type: 'best_practice',
          message: `Section file missing schema: ${file.path}`,
          file: file.path,
          suggestion: 'Add schema configuration to section file',
        });
      }

      // Verificar que tenga endschema
      if (content.includes('{% schema %}') && !content.includes('{% endschema %}')) {
        errors.push({
          type: 'syntax',
          message: `Incomplete schema in ${file.path}`,
          file: file.path,
          severity: 'error',
        });
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Valida el uso de variables y filtros Liquid
   */
  static validateLiquidVariables(files: ThemeFile[], config: ThemeValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Filtrar solo archivos Liquid
    const liquidFiles = filterLiquidFiles(files);

    for (const file of liquidFiles) {
      const content = file.content as string;

      // Verificar uso de variables no definidas
      const variableMatches = content.match(/\{\{\s*([^}]+)\s*\}\}/g);
      if (variableMatches) {
        for (const match of variableMatches) {
          const variable = match.replace(/\{\{\s*|\s*\}\}/g, '').trim();

          // Verificar variables potencialmente problemáticas
          if (variable.includes('request.') || variable.includes('session.')) {
            warnings.push({
              type: 'security',
              message: `Potentially sensitive variable usage in ${file.path}: ${variable}`,
              file: file.path,
              suggestion: 'Review variable usage for security implications',
            });
          }
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }
}
