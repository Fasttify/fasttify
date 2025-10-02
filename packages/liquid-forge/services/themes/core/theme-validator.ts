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

import type { ThemeFile, ValidationResult } from '../types';
import { ValidationEngine } from '../validation/validation-engine';

/**
 * Validador de temas que usa el motor de validación
 */
export class ThemeValidator {
  private static instance: ThemeValidator;
  private validationEngine: ValidationEngine;

  private constructor() {
    this.validationEngine = ValidationEngine.getInstance();
  }

  public static getInstance(): ThemeValidator {
    if (!ThemeValidator.instance) {
      ThemeValidator.instance = new ThemeValidator();
    }
    return ThemeValidator.instance;
  }

  /**
   * Valida un archivo de tema completo
   */
  public async validateThemeFiles(files: ThemeFile[], storeId: string): Promise<ValidationResult> {
    return this.validationEngine.validateTheme(files, storeId);
  }

  /**
   * Valida solo la estructura de archivos
   */
  public async validateFileStructure(files: ThemeFile[]): Promise<ValidationResult> {
    return this.validationEngine.validateStructure(files);
  }

  /**
   * Valida solo la sintaxis Liquid
   */
  public async validateLiquidSyntax(files: ThemeFile[]): Promise<ValidationResult> {
    return this.validationEngine.validateLiquidSyntax(files);
  }

  /**
   * Valida solo la seguridad
   */
  public validateSecurity(files: ThemeFile[]): ValidationResult {
    return this.validationEngine.validateSecurity(files);
  }

  /**
   * Valida solo el rendimiento
   */
  public validatePerformance(files: ThemeFile[]): ValidationResult {
    return this.validationEngine.validatePerformance(files);
  }

  /**
   * Configura el validador con opciones personalizadas
   */
  public configure(config: any): void {
    this.validationEngine.configure(config);
  }
}
