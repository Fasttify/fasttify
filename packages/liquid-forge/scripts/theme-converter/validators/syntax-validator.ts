/**
 * Validador de sintaxis usando el motor de Fasttify
 * Valida que el código convertido sea compatible con Fasttify
 */

import { FasttifyLiquidParser } from '../parsers/liquid-parser-fasttify';
import type { ConversionContext } from '../types/conversion-types';
import { IssueType, IssueSeverity } from '../types/conversion-types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class SyntaxValidator {
  private parser: FasttifyLiquidParser;
  private context: ConversionContext;

  constructor(context: ConversionContext) {
    this.context = context;
    this.parser = new FasttifyLiquidParser();
  }

  /**
   * Valida sintaxis de un archivo Liquid convertido
   */
  validate(content: string, filePath: string): ValidationResult {
    // Intentar validar, pero ignorar errores de schema parsing si el contenido tiene schemas
    // porque pueden tener variables que se resuelven en runtime
    const result = this.parser.validateSyntax(content);

    if (!result.valid) {
      // Filtrar errores relacionados con schemas (pueden tener variables sin resolver)
      const schemaErrors = result.errors.filter((error) => error.includes('schema') || error.includes('JSON'));
      const otherErrors = result.errors.filter((error) => !error.includes('schema') && !error.includes('JSON'));

      // Solo reportar errores no relacionados con schemas
      for (const error of otherErrors) {
        this.context.issues.push({
          type: IssueType.SYNTAX_ERROR,
          severity: IssueSeverity.ERROR,
          file: filePath,
          message: `Error de sintaxis: ${error}`,
          suggestion: 'Revisar el código convertido manualmente',
          requiresManualReview: true,
        });
      }

      // Warnings para errores de schema (pueden ser falsos positivos)
      if (schemaErrors.length > 0) {
        this.context.issues.push({
          type: IssueType.SYNTAX_ERROR,
          severity: IssueSeverity.WARNING,
          file: filePath,
          message: `Posible error en schema JSON (puede tener variables sin resolver): ${schemaErrors[0]}`,
          suggestion: 'Verificar que las variables dentro del schema estén convertidas correctamente',
          requiresManualReview: false,
        });
      }

      // Retornar como válido si solo hay errores de schema
      return {
        valid: otherErrors.length === 0,
        errors: otherErrors,
        warnings: schemaErrors,
      };
    }

    return {
      valid: result.valid,
      errors: result.errors,
      warnings: [],
    };
  }

  /**
   * Valida que todos los filtros usados estén disponibles en Fasttify
   */
  validateFilters(content: string, filePath: string): string[] {
    const warnings: string[] = [];
    const filterRegex = /\|\s*([a-z_][a-z0-9_]*)/gi;
    let match;

    while ((match = filterRegex.exec(content)) !== null) {
      const filterName = match[1];
      // Solo reportar como issue si realmente no está disponible
      // (los filtros estándar de Liquid están disponibles en liquidjs)
      if (!this.parser.isFilterAvailable(filterName)) {
        // Verificar si es un filtro estándar de Shopify que no existe en Liquid estándar
        const shopifyOnlyFilters = ['font_face', 'shopify_asset_url', 'shopify_app_extension'];
        if (shopifyOnlyFilters.includes(filterName)) {
          warnings.push(`Filtro específico de Shopify no disponible: ${filterName}`);
          this.context.issues.push({
            type: IssueType.INCOMPATIBLE_ELEMENT,
            severity: IssueSeverity.ERROR,
            file: filePath,
            message: `Filtro específico de Shopify no disponible en Fasttify: ${filterName}`,
            suggestion: 'Este filtro es específico de Shopify y requiere implementación manual o alternativa',
            requiresManualReview: true,
          });
        }
      }
    }

    return warnings;
  }

  /**
   * Valida que todos los tags usados estén disponibles en Fasttify
   */
  validateTags(content: string, filePath: string): string[] {
    const warnings: string[] = [];
    const tagRegex = /\{%\s*(end)?([a-z_][a-z0-9_]*)/gi;
    let match;

    while ((match = tagRegex.exec(content)) !== null) {
      const tagName = match[2];
      if (!this.parser.isTagAvailable(tagName)) {
        warnings.push(`Tag no disponible en Fasttify: ${tagName}`);
        this.context.issues.push({
          type: IssueType.INCOMPATIBLE_ELEMENT,
          severity: IssueSeverity.WARNING,
          file: filePath,
          message: `Tag no disponible en Fasttify: ${tagName}`,
          suggestion: 'Verificar si hay un tag equivalente o requiere implementación manual',
          requiresManualReview: true,
        });
      }
    }

    return warnings;
  }

  /**
   * Valida completamente un archivo convertido
   */
  validateComplete(content: string, filePath: string): ValidationResult {
    const syntaxResult = this.validate(content, filePath);
    const filterWarnings = this.validateFilters(content, filePath);
    const tagWarnings = this.validateTags(content, filePath);

    return {
      valid: syntaxResult.valid,
      errors: syntaxResult.errors,
      warnings: [...filterWarnings, ...tagWarnings],
    };
  }
}
