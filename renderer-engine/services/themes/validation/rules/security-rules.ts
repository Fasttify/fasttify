import type {
  ThemeFile,
  ThemeValidationConfig,
  ValidationError,
  ValidationResult,
  ValidationWarning,
} from '../../types';
import { filterTextFiles } from '../utils/file-filters';

export class SecurityRules {
  /**
   * Valida patrones de seguridad en archivos basados en texto
   */
  static validateSecurityPatterns(files: ThemeFile[], config: ThemeValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Filtrar solo archivos basados en texto
    const textFiles = filterTextFiles(files);

    for (const file of textFiles) {
      const content = file.content as string;

      // Verificar patrones prohibidos
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

      // Verificar scripts externos
      const externalScriptMatches = content.match(/<script[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/gi);
      if (externalScriptMatches) {
        warnings.push({
          type: 'security',
          message: `External scripts detected in ${file.path}`,
          file: file.path,
          suggestion: 'Consider hosting scripts locally for better security',
        });
      }

      // Verificar CSS externo
      const externalCssMatches = content.match(/<link[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>/gi);
      if (externalCssMatches) {
        warnings.push({
          type: 'security',
          message: `External CSS detected in ${file.path}`,
          file: file.path,
          suggestion: 'Consider hosting CSS locally for better security',
        });
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Valida el uso de eval() y funciones peligrosas
   */
  static validateDangerousFunctions(files: ThemeFile[], config: ThemeValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const dangerousPatterns = [
      /eval\s*\(/,
      /Function\s*\(/,
      /setTimeout\s*\(/,
      /setInterval\s*\(/,
      /document\.write/,
      /document\.writeln/,
      /innerHTML\s*=/,
      /outerHTML\s*=/,
    ];

    // Filtrar solo archivos basados en texto
    const textFiles = filterTextFiles(files);

    for (const file of textFiles) {
      const content = file.content as string;

      for (const pattern of dangerousPatterns) {
        if (pattern.test(content)) {
          warnings.push({
            type: 'security',
            message: `Potentially dangerous function usage in ${file.path}`,
            file: file.path,
            suggestion: 'Review code for security implications',
          });
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Valida URLs y enlaces externos
   */
  static validateExternalUrls(files: ThemeFile[], config: ThemeValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Filtrar solo archivos basados en texto
    const textFiles = filterTextFiles(files);

    for (const file of textFiles) {
      const content = file.content as string;

      // Buscar URLs externas
      const urlMatches = content.match(/https?:\/\/[^\s"']+/gi);
      if (urlMatches) {
        for (const url of urlMatches) {
          // Verificar si es un dominio sospechoso
          if (this.isSuspiciousDomain(url)) {
            warnings.push({
              type: 'security',
              message: `Suspicious external URL in ${file.path}: ${url}`,
              file: file.path,
              suggestion: 'Review external URLs for security',
            });
          }
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Valida el uso de variables de entorno y configuraciones sensibles
   */
  static validateSensitiveData(files: ThemeFile[], config: ThemeValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const sensitivePatterns = [/api_key/, /secret/, /password/, /token/, /private_key/, /access_key/];

    // Filtrar solo archivos basados en texto
    const textFiles = filterTextFiles(files);

    for (const file of textFiles) {
      const content = file.content as string;

      for (const pattern of sensitivePatterns) {
        if (pattern.test(content)) {
          warnings.push({
            type: 'security',
            message: `Potential sensitive data in ${file.path}`,
            file: file.path,
            suggestion: 'Review for hardcoded sensitive information',
          });
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Verifica si un dominio es sospechoso
   */
  private static isSuspiciousDomain(url: string): boolean {
    const suspiciousDomains = ['malicious.com', 'evil.com', 'hack.com', 'phish.com'];

    try {
      const domain = new URL(url).hostname;
      return suspiciousDomains.some((suspicious) => domain.includes(suspicious));
    } catch {
      return false;
    }
  }
}
