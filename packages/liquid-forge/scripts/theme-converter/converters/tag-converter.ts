/**
 * Convertidor de tags Liquid
 * Convierte tags de Shopify a Fasttify (ej: {% include 'snippet' %} → {% render 'snippet' %})
 */

import type { ConversionContext, Transformation } from '../types/conversion-types';
import { TransformationType, IssueType, IssueSeverity } from '../types/conversion-types';
import { RuleEngine } from '../rules/rule-engine';

export interface TagConversionResult {
  convertedContent: string;
  transformations: Transformation[];
  warnings: string[];
}

export class TagConverter {
  private ruleEngine: RuleEngine;
  private context: ConversionContext;

  constructor(context: ConversionContext) {
    this.context = context;
    this.ruleEngine = new RuleEngine(context);
  }

  /**
   * Convierte tags en contenido Liquid
   */
  convert(content: string, filePath?: string): TagConversionResult {
    const transformations: Transformation[] = [];
    const warnings: string[] = [];
    let convertedContent = content;

    // Buscar tags Liquid
    // Patrón: {% tag_name ... %} o {% endtag_name %}
    const tagRegex = /\{%\s*(end)?([a-z_][a-z0-9_]*)(?:\s+[^%]*)?\s*%\}/gi;

    let match;
    const processedPositions = new Set<number>();

    while ((match = tagRegex.exec(content)) !== null) {
      const fullMatch = match[0];
      const isEndTag = !!match[1];
      const tagName = match[2];
      const startIndex = match.index;
      const endIndex = startIndex + fullMatch.length;

      // Evitar procesar la misma posición dos veces
      if (processedPositions.has(startIndex)) {
        continue;
      }

      processedPositions.add(startIndex);

      const conversion = this.convertTag(tagName, fullMatch, isEndTag, filePath, startIndex);

      if (conversion) {
        convertedContent =
          convertedContent.substring(0, startIndex) + conversion.converted + convertedContent.substring(endIndex);

        transformations.push({
          type: TransformationType.TAG,
          original: fullMatch,
          converted: conversion.converted,
          line: this.getLineNumber(content, startIndex),
          column: this.getColumnNumber(content, startIndex),
        });

        if (conversion.warning) {
          warnings.push(conversion.warning);
        }

        // Ajustar índice del regex
        tagRegex.lastIndex = startIndex + conversion.converted.length;
      }
    }

    return {
      convertedContent,
      transformations,
      warnings,
    };
  }

  /**
   * Convierte un tag individual
   */
  private convertTag(
    tagName: string,
    fullExpression: string,
    isEndTag: boolean,
    filePath: string | undefined,
    position: number
  ): { converted: string; warning?: string } | null {
    // Verificar si está deprecado
    if (this.ruleEngine.isDeprecated(tagName, 'tag')) {
      this.context.issues.push({
        type: IssueType.DEPRECATED_ELEMENT,
        severity: IssueSeverity.WARNING,
        file: filePath || 'unknown',
        message: `Tag deprecado encontrado: ${tagName}`,
        line: this.getLineNumber(fullExpression, position),
        suggestion: 'Verificar documentación de Fasttify para alternativa',
        requiresManualReview: false,
      });

      return {
        converted: fullExpression,
        warning: `Tag deprecado: ${tagName}`,
      };
    }

    // Verificar si es incompatible
    if (this.ruleEngine.isIncompatible(tagName, 'tag')) {
      this.context.issues.push({
        type: IssueType.INCOMPATIBLE_ELEMENT,
        severity: IssueSeverity.ERROR,
        file: filePath || 'unknown',
        message: `Tag incompatible con Fasttify: ${tagName}`,
        line: this.getLineNumber(fullExpression, position),
        suggestion: 'Este tag no está disponible en Fasttify, requiere revisión manual',
        requiresManualReview: true,
      });

      return {
        converted: fullExpression,
        warning: `Tag incompatible: ${tagName} - requiere revisión manual`,
      };
    }

    // Obtener mapeo del tag
    const mappedTag = this.ruleEngine.mapTag(tagName);

    if (!mappedTag) {
      // Tag no mapeado pero compatible
      this.context.issues.push({
        type: IssueType.UNKNOWN_ELEMENT,
        severity: IssueSeverity.INFO,
        file: filePath || 'unknown',
        message: `Tag no mapeado: ${tagName}`,
        line: this.getLineNumber(fullExpression, position),
        suggestion: 'Verificar si el tag funciona igual en Fasttify',
        requiresManualReview: false,
      });

      return null;
    }

    // Si el mapeo es el mismo, no hacer nada
    if (mappedTag === tagName) {
      return null;
    }

    // Construir nueva expresión con el tag mapeado
    // Preservar el contenido del tag (parámetros, etc.)
    const tagPrefix = isEndTag ? '{% end' : '{% ';
    const tagSuffix = ' %}';

    // Extraer contenido del tag (lo que está entre {% y %}
    const tagContent = fullExpression
      .replace(/^{%\s*(end)?/, '')
      .replace(/\s*%}$/, '')
      .trim();

    // Si es un end tag, usar el nombre mapeado
    if (isEndTag) {
      const newExpression = `{% end${mappedTag} %}`;
      this.context.statistics.transformations.tags++;
      return { converted: newExpression };
    }

    // Para tags de apertura, preservar parámetros
    // Ej: {% include 'snippet' with var: value %} → {% render 'snippet' with var: value %}
    const params = tagContent.substring(tagName.length).trim();
    const newExpression = params
      ? `${tagPrefix}${mappedTag} ${params}${tagSuffix}`
      : `${tagPrefix}${mappedTag}${tagSuffix}`;

    // Registrar transformación
    this.context.statistics.transformations.tags++;

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
   * Convierte tags especiales que requieren lógica adicional
   */
  convertSpecialTags(content: string, filePath?: string): string {
    let converted = content;

    // Convertir {% include %} a {% render %} (ya manejado por mapTag, pero podemos agregar lógica adicional aquí)
    // Esto es solo un ejemplo, las conversiones normales se hacen en convert()

    return converted;
  }
}
