/**
 * Motor de reglas para aplicar transformaciones
 * Integrado con el motor de Fasttify para validar compatibilidad
 */

import type { ConversionContext, CustomRules } from '../types/conversion-types';
import { logger } from '../utils/logger';
import { FasttifyLiquidParser } from '../parsers/liquid-parser-fasttify';

export class RuleEngine {
  private context: ConversionContext;
  private fasttifyParser: FasttifyLiquidParser;

  constructor(context: ConversionContext) {
    this.context = context;
    this.fasttifyParser = new FasttifyLiquidParser();
  }

  /**
   * Aplica mapeo de variable
   */
  mapVariable(objectType: string, property: string): string | null {
    const mappings = this.context.conversionRules.variables;

    if (!mappings[objectType]) {
      return null;
    }

    const mapping = mappings[objectType][property];
    if (!mapping) {
      return null;
    }

    // Si es string, retornar directamente
    if (typeof mapping === 'string') {
      return mapping;
    }

    // Si es función transformer, no podemos ejecutarla aquí sin contexto completo
    // Retornar null para que se maneje en el convertidor
    logger.warn(`Variable transformer encontrado pero no ejecutado: ${objectType}.${property}`);
    return null;
  }

  /**
   * Aplica mapeo de filtro
   */
  mapFilter(filterName: string): string | null {
    const mappings = this.context.conversionRules.filters;

    if (!mappings[filterName]) {
      return null;
    }

    const mapping = mappings[filterName];
    if (typeof mapping === 'string') {
      return mapping;
    }

    logger.warn(`Filter transformer encontrado pero no ejecutado: ${filterName}`);
    return null;
  }

  /**
   * Aplica mapeo de tag
   */
  mapTag(tagName: string): string | null {
    const mappings = this.context.conversionRules.tags;

    if (!mappings[tagName]) {
      return null;
    }

    const mapping = mappings[tagName];
    if (typeof mapping === 'string') {
      return mapping;
    }

    logger.warn(`Tag transformer encontrado pero no ejecutado: ${tagName}`);
    return null;
  }

  /**
   * Verifica si un elemento está deprecado
   */
  isDeprecated(element: string, type: 'variable' | 'filter' | 'tag'): boolean {
    const deprecated = this.context.conversionRules.deprecated;

    switch (type) {
      case 'variable':
        return deprecated.variables.includes(element);
      case 'filter':
        return deprecated.filters.includes(element);
      case 'tag':
        return deprecated.tags.includes(element);
      default:
        return false;
    }
  }

  /**
   * Verifica si un elemento es incompatible con Fasttify
   * Usa el motor real de Fasttify para verificar disponibilidad
   */
  isIncompatible(element: string, type: 'filter' | 'tag' | 'feature'): boolean {
    switch (type) {
      case 'filter':
        // Verificar si el filtro NO está disponible en Fasttify
        return !this.fasttifyParser.isFilterAvailable(element);
      case 'tag':
        // Verificar si el tag NO está disponible en Fasttify
        return !this.fasttifyParser.isTagAvailable(element);
      case 'feature':
        // Por ahora, verificar en la lista de incompatibilidades del config
        const incompatible = this.context.conversionRules.custom.skipFiles || [];
        return incompatible.includes(element);
      default:
        return false;
    }
  }

  /**
   * Obtiene reglas personalizadas
   */
  getCustomRule(key: string): unknown {
    return this.context.conversionRules.custom[key as keyof CustomRules];
  }
}
