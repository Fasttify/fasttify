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
