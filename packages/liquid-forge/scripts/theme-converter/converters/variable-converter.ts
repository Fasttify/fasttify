/**
 * Convertidor de variables Liquid
 * Convierte variables de Shopify a Fasttify (ej: {{ product.vendor }} → {{ product.category }})
 */

import type { ConversionContext, Transformation } from '../types/conversion-types';
import { TransformationType, IssueType, IssueSeverity } from '../types/conversion-types';
import { RuleEngine } from '../rules/rule-engine';
import { LiquidParser } from '../parsers/liquid-parser';

export interface VariableConversionResult {
  convertedContent: string;
  transformations: Transformation[];
  warnings: string[];
}

export class VariableConverter {
  private ruleEngine: RuleEngine;
  private parser: LiquidParser;
  private context: ConversionContext;

  constructor(context: ConversionContext) {
    this.context = context;
    this.ruleEngine = new RuleEngine(context);
    this.parser = new LiquidParser();
  }

  /**
   * Convierte variables en contenido Liquid
   */
  convert(content: string, filePath?: string): VariableConversionResult {
    const transformations: Transformation[] = [];
    const warnings: string[] = [];
    let convertedContent = content;

    // Buscar todas las variables usando regex
    // Patrón: {{ object.property }} o {{ object.property | filter }}
    // Soporta rutas anidadas: section.settings.product.vendor
    const variableRegex = /\{\{\s*([a-z_][a-z0-9_.]+)(?:\s*\|\s*[^}]+)?\s*\}\}/gi;

    let match;
    const processedRanges: Array<{ start: number; end: number }> = [];

    while ((match = variableRegex.exec(content)) !== null) {
      const fullMatch = match[0];
      const variablePath = match[1];
      const startIndex = match.index;
      const endIndex = startIndex + fullMatch.length;

      // Evitar procesar la misma posición dos veces
      if (processedRanges.some((r) => startIndex >= r.start && startIndex < r.end)) {
        continue;
      }

      const conversion = this.convertVariable(variablePath, fullMatch, filePath, startIndex);

      if (conversion) {
        convertedContent =
          convertedContent.substring(0, startIndex) + conversion.converted + convertedContent.substring(endIndex);

        // Ajustar índices de regex después de reemplazo
        const lengthDiff = conversion.converted.length - fullMatch.length;
        processedRanges.push({ start: startIndex, end: startIndex + conversion.converted.length });

        transformations.push({
          type: TransformationType.VARIABLE,
          original: fullMatch,
          converted: conversion.converted,
          line: this.getLineNumber(content, startIndex),
          column: this.getColumnNumber(content, startIndex),
        });

        if (conversion.warning) {
          warnings.push(conversion.warning);
        }

        // Ajustar índice del regex
        variableRegex.lastIndex = startIndex + conversion.converted.length;
      }
    }

    return {
      convertedContent,
      transformations,
      warnings,
    };
  }

  /**
   * Convierte una variable individual
   */
  private convertVariable(
    variablePath: string,
    fullExpression: string,
    filePath: string | undefined,
    position: number
  ): { converted: string; warning?: string } | null {
    // Dividir en partes
    // Ej: product.vendor -> [product, vendor]
    // Ej: section.settings.product.vendor -> [section, settings, product, vendor]
    const parts = variablePath.split('.');
    if (parts.length < 2) {
      return null;
    }

    // Buscar patrones anidados como: section.settings.product.vendor
    // Necesitamos encontrar dónde está el objeto que queremos convertir
    // Recorrer desde el final hacia el inicio para encontrar el objeto más anidado primero
    let converted = false;
    let newPath = variablePath;

    // Intentar convertir desde diferentes posiciones (de atrás hacia adelante)
    for (let i = parts.length - 2; i >= 0; i--) {
      const objectType = parts[i];
      const firstProperty = parts[i + 1];
      const remainingProperties = parts.slice(i + 2);

      // Verificar si hay un mapeo para este objeto y primera propiedad
      const mappedProperty = this.ruleEngine.mapVariable(objectType, firstProperty);

      if (mappedProperty) {
        // Encontramos un mapeo, reconstruir la ruta
        const prefix = parts.slice(0, i);
        const suffix = remainingProperties;

        const newParts: string[] = [];
        if (prefix.length > 0) {
          newParts.push(...prefix);
        }
        newParts.push(objectType);
        newParts.push(mappedProperty);
        if (suffix.length > 0) {
          newParts.push(...suffix);
        }

        newPath = newParts.join('.');
        converted = true;
        break;
      }
    }

    // Si no se convirtió, intentar el método original (primer nivel)
    if (!converted) {
      const objectType = parts[0];
      const firstProperty = parts[1];
      const remainingProperties = parts.slice(2);

      // Obtener mapeo de la propiedad
      const mappedProperty = this.ruleEngine.mapVariable(objectType, firstProperty);

      if (mappedProperty) {
        // Encontramos un mapeo
        const newParts: string[] = [objectType, mappedProperty];
        if (remainingProperties.length > 0) {
          newParts.push(...remainingProperties);
        }
        newPath = newParts.join('.');
        converted = true;
      }
    }

    if (!converted) {
      // Verificar si está deprecado
      if (this.ruleEngine.isDeprecated(variablePath, 'variable')) {
        this.context.issues.push({
          type: IssueType.DEPRECATED_ELEMENT,
          severity: IssueSeverity.WARNING,
          file: filePath || 'unknown',
          message: `Variable deprecada encontrada: ${variablePath}`,
          line: this.getLineNumber(fullExpression, position),
          suggestion: 'Verificar documentación de Fasttify para alternativa',
          requiresManualReview: false,
        });

        return {
          converted: fullExpression,
          warning: `Variable deprecada: ${variablePath}`,
        };
      }

      // Variable no mapeada
      this.context.issues.push({
        type: IssueType.UNKNOWN_ELEMENT,
        severity: IssueSeverity.WARNING,
        file: filePath || 'unknown',
        message: `Variable no mapeada: ${variablePath}`,
        line: this.getLineNumber(fullExpression, position),
        suggestion: 'Revisar si necesita mapeo personalizado',
        requiresManualReview: false,
      });

      return null;
    }

    // Construir nueva expresión con la propiedad mapeada
    const newExpression = fullExpression.replace(variablePath, newPath);

    // Registrar transformación
    this.context.statistics.transformations.variables++;

    return {
      converted: newExpression,
    };
  }

  /**
   * Obtiene el número de línea desde una posición en el contenido
   */
  private getLineNumber(content: string, position: number): number {
    return content.substring(0, position).split('\n').length;
  }

  /**
   * Obtiene el número de columna desde una posición en el contenido
   */
  private getColumnNumber(content: string, position: number): number {
    const lines = content.substring(0, position).split('\n');
    const lastLine = lines[lines.length - 1];
    return lastLine.length + 1;
  }

  /**
   * Convierte variables en expresiones complejas (con múltiples propiedades)
   */
  convertComplexVariable(expression: string): string {
    // Manejar casos como: product.variants.first.price
    // Por ahora, convertimos solo el primer nivel
    const parts = expression.split('.');
    if (parts.length < 2) {
      return expression;
    }

    const objectType = parts[0];
    const property = parts[1];
    const rest = parts.slice(2).join('.');

    const mappedProperty = this.ruleEngine.mapVariable(objectType, property);

    if (mappedProperty) {
      const converted = rest ? `${objectType}.${mappedProperty}.${rest}` : `${objectType}.${mappedProperty}`;
      return converted;
    }

    return expression;
  }
}
