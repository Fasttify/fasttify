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

import type {
  ThemeFile,
  ThemeValidationConfig,
  ValidationError,
  ValidationResult,
  ValidationWarning,
} from '../../types';

export class FileStructureRules {
  /**
   * Valida que todos los archivos requeridos estén presentes
   */
  static validateRequiredFiles(files: ThemeFile[], config: ThemeValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const requiredFile of config.requiredFiles) {
      const hasFile = files.some(
        (f) => f.path === requiredFile || f.path.endsWith(`/${requiredFile}`) || f.path.includes(`/${requiredFile}`)
      );
      if (!hasFile) {
        errors.push({
          type: 'structure',
          message: `Missing required file: ${requiredFile}`,
          file: requiredFile,
          severity: 'critical',
        });
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Valida el número máximo de archivos
   */
  static validateFileCount(files: ThemeFile[], config: ThemeValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (files.length > config.maxFiles) {
      errors.push({
        type: 'structure',
        message: `Too many files: ${files.length} (max: ${config.maxFiles})`,
        severity: 'error',
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Valida el tamaño total del tema
   */
  static validateTotalSize(files: ThemeFile[], config: ThemeValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > config.maxFileSize) {
      errors.push({
        type: 'structure',
        message: `Theme too large: ${(totalSize / 1024 / 1024).toFixed(2)}MB (max: ${config.maxFileSize / 1024 / 1024}MB)`,
        severity: 'error',
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Valida los tipos de archivo permitidos
   */
  static validateFileTypes(files: ThemeFile[], config: ThemeValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const file of files) {
      const extension = this.getFileExtension(file.path);
      if (!config.allowedFileTypes.includes(extension)) {
        warnings.push({
          type: 'best_practice',
          message: `Unsupported file type: ${extension}`,
          file: file.path,
          suggestion: 'Consider using supported file types',
        });
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Valida que no haya archivos en la raíz del ZIP
   */
  static validateNoRootFiles(files: ThemeFile[], config: ThemeValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const rootFiles = files.filter((file) => !file.path.includes('/'));
    if (rootFiles.length > 0) {
      warnings.push({
        type: 'best_practice',
        message: 'Found files in root directory',
        suggestion: 'All files should be organized in folders (layout/, templates/, etc.)',
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Obtiene la extensión de un archivo
   */
  private static getFileExtension(path: string): string {
    const lastDot = path.lastIndexOf('.');
    return lastDot !== -1 ? path.substring(lastDot) : '';
  }
}
