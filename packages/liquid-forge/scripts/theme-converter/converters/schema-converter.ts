/**
 * Convertidor especial para schemas JSON
 * Convierte variables dentro de schemas antes de parsear el JSON
 */

import type { ConversionContext, Transformation, TransformationType } from '../types/conversion-types';
import { VariableConverter } from './variable-converter';
import { logger } from '../utils/logger';

export interface SchemaConversionResult {
  convertedContent: string;
  transformations: Transformation[];
  warnings: string[];
}

export class SchemaConverter {
  private variableConverter: VariableConverter;
  private context: ConversionContext;

  constructor(context: ConversionContext) {
    this.context = context;
    this.variableConverter = new VariableConverter(context);
  }

  /**
   * Convierte variables dentro de bloques {% schema %}
   * Las variables dentro de schemas deben convertirse antes de parsear el JSON
   */
  convert(content: string, filePath?: string): SchemaConversionResult {
    const transformations: Transformation[] = [];
    const warnings: string[] = [];
    let convertedContent = content;

    // Buscar bloques {% schema %} ... {% endschema %}
    // Usar un enfoque que procesa de atrás hacia adelante para evitar problemas con índices
    const schemaMatches: Array<{
      start: number;
      end: number;
      schemaStart: string;
      schemaBody: string;
      schemaEnd: string;
    }> = [];

    const schemaRegex = /({%\s*schema\s*%})([\s\S]*?)({%\s*endschema\s*%})/g;
    let match;
    while ((match = schemaRegex.exec(content)) !== null) {
      schemaMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        schemaStart: match[1],
        schemaBody: match[2],
        schemaEnd: match[3],
      });
    }

    // Procesar de atrás hacia adelante para mantener índices correctos
    for (let i = schemaMatches.length - 1; i >= 0; i--) {
      const match = schemaMatches[i];

      // Convertir variables dentro del schema
      const varResult = this.variableConverter.convert(match.schemaBody, filePath);

      // SIEMPRE reemplazar, incluso si no hubo transformaciones (por si acaso)
      const newSchema = match.schemaStart + varResult.convertedContent + match.schemaEnd;

      convertedContent = convertedContent.substring(0, match.start) + newSchema + convertedContent.substring(match.end);

      transformations.push(...varResult.transformations);
      warnings.push(...varResult.warnings);
    }

    return {
      convertedContent,
      transformations,
      warnings,
    };
  }
}
