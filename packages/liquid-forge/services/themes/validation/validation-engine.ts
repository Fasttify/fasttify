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

import { RendererLogger } from '../../../lib/logger';
import type { ThemeFile, ThemeValidationConfig, ValidationResult } from '../types';
import { FileStructureRules } from './rules/file-structure-rules';
import { LiquidSyntaxRules } from './rules/liquid-syntax-rules';
import { PerformanceRules } from './rules/performance-rules';
import { SecurityRules } from './rules/security-rules';

export class ValidationEngine {
  private static instance: ValidationEngine;
  private logger = RendererLogger;

  // Configuración por defecto
  private defaultConfig: ThemeValidationConfig = {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 1000,
    allowedFileTypes: [
      '.liquid',
      '.json',
      '.css',
      '.js',
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.svg',
      '.webp',
      '.woff',
      '.woff2',
      '.ttf',
      '.eot',
      '.md',
      '.txt',
      '.html',
      '.xml',
    ],
    requiredFiles: ['layout/theme.liquid', 'templates/index.json', 'config/settings_schema.json'],
    forbiddenPatterns: [
      /<script\s+src=["']https?:\/\/[^"']*["']/, // Scripts externos con URL completa
      /<link\s+href=["']https?:\/\/[^"']*["']/, // CSS externo con URL completa
      /eval\s*\(/, // eval()
      /document\.write/, // document.write
      /innerHTML\s*=/, // innerHTML
    ],
    maxAssetSize: 10 * 1024 * 1024, // 10MB por asset
  };

  private constructor() {}

  public static getInstance(): ValidationEngine {
    if (!ValidationEngine.instance) {
      ValidationEngine.instance = new ValidationEngine();
    }
    return ValidationEngine.instance;
  }

  /**
   * Ejecuta todas las validaciones en el tema
   */
  public async validateTheme(
    files: ThemeFile[],
    storeId: string,
    config?: Partial<ThemeValidationConfig>
  ): Promise<ValidationResult> {
    const validationConfig = { ...this.defaultConfig, ...config };
    const allErrors: any[] = [];
    const allWarnings: any[] = [];

    try {
      // 1. Validaciones de estructura de archivos
      const structureValidations = [
        FileStructureRules.validateRequiredFiles(files, validationConfig),
        FileStructureRules.validateFileCount(files, validationConfig),
        FileStructureRules.validateTotalSize(files, validationConfig),
        FileStructureRules.validateFileTypes(files, validationConfig),
        FileStructureRules.validateNoRootFiles(files, validationConfig),
      ];

      // 2. Validaciones de sintaxis Liquid
      const liquidFiles = files.filter((f) => f.type === 'liquid');
      const liquidValidations = [
        await LiquidSyntaxRules.validateLiquidSyntax(liquidFiles, validationConfig),
        LiquidSyntaxRules.validateSecurityPatterns(liquidFiles, validationConfig),
        LiquidSyntaxRules.validateSectionStructure(liquidFiles, validationConfig),
        LiquidSyntaxRules.validateLiquidVariables(liquidFiles, validationConfig),
      ];

      // 3. Validaciones de seguridad
      const securityValidations = [
        SecurityRules.validateSecurityPatterns(files, validationConfig),
        SecurityRules.validateDangerousFunctions(files, validationConfig),
        SecurityRules.validateExternalUrls(files, validationConfig),
        SecurityRules.validateSensitiveData(files, validationConfig),
      ];

      // 4. Validaciones de rendimiento
      const performanceValidations = [
        PerformanceRules.validateAssetSizes(files, validationConfig),
        PerformanceRules.validateFileDistribution(files, validationConfig),
        PerformanceRules.validateExternalResources(files, validationConfig),
        PerformanceRules.validateFolderStructure(files, validationConfig),
        PerformanceRules.validateOptimizationOpportunities(files, validationConfig),
      ];

      // Combinar todos los resultados
      const allValidations = [
        ...structureValidations,
        ...liquidValidations,
        ...securityValidations,
        ...performanceValidations,
      ];

      for (const validation of allValidations) {
        allErrors.push(...validation.errors);
        allWarnings.push(...validation.warnings);
      }

      // 5. Análisis del tema
      const analysis = await this.analyzeTheme(files, storeId);

      const result: ValidationResult = {
        isValid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings,
        analysis,
      };

      return result;
    } catch (error) {
      this.logger.error('Error during theme validation', error, 'ValidationEngine');

      allErrors.push({
        type: 'structure',
        message: `Error during validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'critical',
      });

      return {
        isValid: false,
        errors: allErrors,
        warnings: allWarnings,
      };
    }
  }

  /**
   * Ejecuta validaciones específicas
   */
  public async validateStructure(
    files: ThemeFile[],
    config?: Partial<ThemeValidationConfig>
  ): Promise<ValidationResult> {
    const validationConfig = { ...this.defaultConfig, ...config };

    const validations = [
      FileStructureRules.validateRequiredFiles(files, validationConfig),
      FileStructureRules.validateFileCount(files, validationConfig),
      FileStructureRules.validateTotalSize(files, validationConfig),
      FileStructureRules.validateFileTypes(files, validationConfig),
    ];

    return this.combineValidationResults(validations);
  }

  public async validateLiquidSyntax(
    files: ThemeFile[],
    config?: Partial<ThemeValidationConfig>
  ): Promise<ValidationResult> {
    const validationConfig = { ...this.defaultConfig, ...config };
    const liquidFiles = files.filter((f) => f.type === 'liquid');

    const validations = [
      await LiquidSyntaxRules.validateLiquidSyntax(liquidFiles, validationConfig),
      LiquidSyntaxRules.validateSecurityPatterns(liquidFiles, validationConfig),
      LiquidSyntaxRules.validateSectionStructure(liquidFiles, validationConfig),
    ];

    return this.combineValidationResults(validations);
  }

  public validateSecurity(files: ThemeFile[], config?: Partial<ThemeValidationConfig>): ValidationResult {
    const validationConfig = { ...this.defaultConfig, ...config };

    const validations = [
      SecurityRules.validateSecurityPatterns(files, validationConfig),
      SecurityRules.validateDangerousFunctions(files, validationConfig),
      SecurityRules.validateExternalUrls(files, validationConfig),
      SecurityRules.validateSensitiveData(files, validationConfig),
    ];

    return this.combineValidationResults(validations);
  }

  public validatePerformance(files: ThemeFile[], config?: Partial<ThemeValidationConfig>): ValidationResult {
    const validationConfig = { ...this.defaultConfig, ...config };

    const validations = [
      PerformanceRules.validateAssetSizes(files, validationConfig),
      PerformanceRules.validateFileDistribution(files, validationConfig),
      PerformanceRules.validateExternalResources(files, validationConfig),
      PerformanceRules.validateFolderStructure(files, validationConfig),
      PerformanceRules.validateOptimizationOpportunities(files, validationConfig),
    ];

    return this.combineValidationResults(validations);
  }

  /**
   * Combina múltiples resultados de validación
   */
  private combineValidationResults(validations: ValidationResult[]): ValidationResult {
    const allErrors: any[] = [];
    const allWarnings: any[] = [];

    for (const validation of validations) {
      allErrors.push(...validation.errors);
      allWarnings.push(...validation.warnings);
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };
  }

  /**
   * Analiza el tema para generar estadísticas
   */
  private async analyzeTheme(files: ThemeFile[], storeId: string): Promise<any> {
    try {
      const analysis = {
        totalFiles: files.length,
        liquidFiles: files.filter((f) => f.type === 'liquid').length,
        jsonFiles: files.filter((f) => f.type === 'json').length,
        cssFiles: files.filter((f) => f.type === 'css').length,
        jsFiles: files.filter((f) => f.type === 'js').length,
        imageFiles: files.filter((f) => f.type === 'image').length,
        fontFiles: files.filter((f) => f.type === 'font').length,
        sections: files.filter((f) => f.path.includes('/sections/')).length,
        templates: files.filter((f) => f.path.includes('/templates/')).length,
        snippets: files.filter((f) => f.path.includes('/snippets/')).length,
        assets: files.filter((f) => f.path.includes('assets/')).length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
        structure: {
          hasLayout: files.some((f) => f.path.includes('/layout/theme.liquid')),
          hasSettings: files.some((f) => f.path.includes('/config/settings_schema.json')),
          hasIndex: files.some((f) => f.path.includes('/templates/index.json')),
          hasProduct: files.some((f) => f.path.includes('/templates/product.json')),
          hasCollection: files.some((f) => f.path.includes('/templates/collection.json')),
        },
      };

      return analysis;
    } catch (error) {
      this.logger.error('Error analyzing theme', error, 'ValidationEngine');
      return null;
    }
  }

  /**
   * Configura el motor de validación
   */
  public configure(config: Partial<ThemeValidationConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }
}
