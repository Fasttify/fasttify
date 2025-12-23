/**
 * Convertidor de filtros Liquid
 * Convierte filtros de Shopify a Fasttify (ej: {{ price | money_with_currency }} → {{ price | money }})
 */

import type { ConversionContext, Transformation } from '../types/conversion-types';
import { TransformationType, IssueType, IssueSeverity } from '../types/conversion-types';
import { RuleEngine } from '../rules/rule-engine';

export interface FilterConversionResult {
  convertedContent: string;
  transformations: Transformation[];
  warnings: string[];
}

export class FilterConverter {
  private ruleEngine: RuleEngine;
  private context: ConversionContext;

  constructor(context: ConversionContext) {
    this.context = context;
    this.ruleEngine = new RuleEngine(context);
  }

  /**
   * Convierte filtros en contenido Liquid
   */
  convert(content: string, filePath?: string): FilterConversionResult {
    const transformations: Transformation[] = [];
    const warnings: string[] = [];
    let convertedContent = content;

    // Buscar filtros en expresiones Liquid
    // Patrón: | filter_name o | filter_name:param o | filter1 | filter2
    const filterRegex = /\|\s*([a-z_][a-z0-9_]*)(?::[^|}]*(?:\|\s*[^}]+)?)?/gi;

    let match;
    const processedPositions = new Set<number>();

    while ((match = filterRegex.exec(content)) !== null) {
      const fullMatch = match[0];
      const filterName = match[1];
      const startIndex = match.index;
      const endIndex = startIndex + fullMatch.length;

      // Evitar procesar la misma posición dos veces
      if (processedPositions.has(startIndex)) {
        continue;
      }

      // Verificar que estamos dentro de una expresión Liquid {{ ... }}
      if (!this.isInsideLiquidExpression(content, startIndex)) {
        continue;
      }

      processedPositions.add(startIndex);

      const conversion = this.convertFilter(filterName, fullMatch, filePath, startIndex);

      if (conversion) {
        convertedContent =
          convertedContent.substring(0, startIndex) + conversion.converted + convertedContent.substring(endIndex);

        transformations.push({
          type: TransformationType.FILTER,
          original: fullMatch,
          converted: conversion.converted,
          line: this.getLineNumber(content, startIndex),
          column: this.getColumnNumber(content, startIndex),
        });

        if (conversion.warning) {
          warnings.push(conversion.warning);
        }

        // Ajustar índice del regex
        const lengthDiff = conversion.converted.length - fullMatch.length;
        filterRegex.lastIndex = startIndex + conversion.converted.length;
      }
    }

    return {
      convertedContent,
      transformations,
      warnings,
    };
  }

  /**
   * Convierte un filtro individual
   */
  private convertFilter(
    filterName: string,
    fullExpression: string,
    filePath: string | undefined,
    position: number
  ): { converted: string; warning?: string } | null {
    // Verificar si está deprecado
    if (this.ruleEngine.isDeprecated(filterName, 'filter')) {
      this.context.issues.push({
        type: IssueType.DEPRECATED_ELEMENT,
        severity: IssueSeverity.WARNING,
        file: filePath || 'unknown',
        message: `Filtro deprecado encontrado: ${filterName}`,
        line: this.getLineNumber(fullExpression, position),
        suggestion: 'Verificar documentación de Fasttify para alternativa',
        requiresManualReview: false,
      });

      return {
        converted: fullExpression,
        warning: `Filtro deprecado: ${filterName}`,
      };
    }

    // Verificar si es incompatible
    if (this.ruleEngine.isIncompatible(filterName, 'filter')) {
      this.context.issues.push({
        type: IssueType.INCOMPATIBLE_ELEMENT,
        severity: IssueSeverity.ERROR,
        file: filePath || 'unknown',
        message: `Filtro incompatible con Fasttify: ${filterName}`,
        line: this.getLineNumber(fullExpression, position),
        suggestion: 'Este filtro no está disponible en Fasttify, requiere revisión manual',
        requiresManualReview: true,
      });

      return {
        converted: fullExpression,
        warning: `Filtro incompatible: ${filterName} - requiere revisión manual`,
      };
    }

    // Obtener mapeo del filtro
    const mappedFilter = this.ruleEngine.mapFilter(filterName);

    if (!mappedFilter) {
      // Filtro no mapeado pero compatible
      this.context.issues.push({
        type: IssueType.UNKNOWN_ELEMENT,
        severity: IssueSeverity.INFO,
        file: filePath || 'unknown',
        message: `Filtro no mapeado: ${filterName}`,
        line: this.getLineNumber(fullExpression, position),
        suggestion: 'Verificar si el filtro funciona igual en Fasttify',
        requiresManualReview: false,
      });

      return null;
    }

    // Si el mapeo es el mismo, no hacer nada
    if (mappedFilter === filterName) {
      return null;
    }

    // Construir nueva expresión con el filtro mapeado
    // Preservar parámetros del filtro si los hay
    const hasParams = fullExpression.includes(':');
    if (hasParams) {
      // Mantener parámetros: | old_filter:param → | new_filter:param
      const params = fullExpression.substring(fullExpression.indexOf(':'));
      const newExpression = `| ${mappedFilter}${params}`;
      return { converted: newExpression };
    }

    const newExpression = `| ${mappedFilter}`;

    // Registrar transformación
    this.context.statistics.transformations.filters++;

    return {
      converted: newExpression,
    };
  }

  /**
   * Verifica si una posición está dentro de una expresión Liquid {{ ... }}
   */
  private isInsideLiquidExpression(content: string, position: number): boolean {
    // Buscar el {{ más cercano antes de la posición
    let searchStart = Math.max(0, position - 200); // Buscar hacia atrás máximo 200 caracteres
    const beforePosition = content.substring(searchStart, position);

    const lastOpen = beforePosition.lastIndexOf('{{');
    const lastClose = beforePosition.lastIndexOf('}}');

    // Si encontramos {{ y no hay }} después, estamos dentro de una expresión
    if (lastOpen > lastClose) {
      // Verificar que haya }} después de la posición
      const afterPosition = content.substring(position);
      return afterPosition.includes('}}');
    }

    return false;
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
   * Convierte caso especial: asset_url dentro de svg-wrapper a inline_asset_content
   */
  convertSpecialAssetFilter(content: string): string {
    // Caso especial: convertir asset_url a inline_asset_content dentro de .svg-wrapper
    const svgAssetRegex = /(\s*<span[^>]*class="[^"]*svg-wrapper[^"]*"[^>]*>\s*)(\{\{[^}]*\|\s*asset_url[^}]*\}\})/g;

    return content.replace(svgAssetRegex, (match, prefix, assetUrlExpression) => {
      const inlineExpression = assetUrlExpression.replace(/\|\s*asset_url/g, '| inline_asset_content');
      this.context.statistics.transformations.filters++;
      return prefix + inlineExpression;
    });
  }
}
