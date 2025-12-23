/**
 * Parser de Liquid usando el motor de Fasttify (liquid-forge)
 * Reutiliza toda la infraestructura existente de tags, filtros, etc.
 */

import { LiquidCompiler } from '@/liquid-forge/compiler';
import type { Template } from 'liquidjs';
import { logger } from '../utils/logger';
import { allFilters } from '@/liquid-forge/liquid/filters';
import type { LiquidFilter } from '@/liquid-forge/types';

export interface ParsedLiquid {
  ast: Template[];
  originalContent: string;
  valid: boolean;
  errors: string[];
}

export interface FasttifyLiquidInfo {
  availableFilters: string[];
  availableTags: string[];
  customTags: string[];
}

export class FasttifyLiquidParser {
  /**
   * Parsea contenido Liquid usando el motor de Fasttify
   * Esto valida que el código sea compatible con Fasttify
   */
  parse(content: string, filePath?: string): ParsedLiquid {
    try {
      // Usar el compilador de Fasttify que tiene todos los tags y filtros registrados
      const ast = LiquidCompiler.compile(content);

      return {
        ast,
        originalContent: content,
        valid: true,
        errors: [],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`Error parseando Liquid con motor Fasttify en ${filePath || 'unknown'}:`, error);

      return {
        ast: [],
        originalContent: content,
        valid: false,
        errors: [errorMessage],
      };
    }
  }

  /**
   * Valida sintaxis Liquid usando el motor de Fasttify
   */
  validateSyntax(content: string): { valid: boolean; errors: string[] } {
    try {
      LiquidCompiler.compile(content);
      return { valid: true, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { valid: false, errors: [errorMessage] };
    }
  }

  /**
   * Obtiene información sobre filtros y tags disponibles en Fasttify
   */
  getFasttifyLiquidInfo(): FasttifyLiquidInfo {
    // Obtener todos los filtros personalizados de Fasttify
    const customFilters = allFilters.map((filter: LiquidFilter) => filter.name);

    // Filtros estándar de Liquid que liquidjs proporciona por defecto
    // Estos están siempre disponibles en liquidjs, incluso si no están en allFilters
    const standardLiquidFilters = [
      'join',
      'split',
      'first',
      'last',
      'concat',
      'prepend',
      'append',
      'plus',
      'minus',
      'times',
      'divided_by',
      'modulo',
      'round',
      'ceil',
      'floor',
      'abs',
      'at_least',
      'at_most',
      'size',
      'sort',
      'sort_natural',
      'reverse',
      'uniq',
      'map',
      'sum',
      'slice',
      'replace',
      'remove',
      'remove_first',
      'newline_to_br',
      'strip_newlines',
      'strip_html',
      'strip',
      'capitalize',
      'upcase',
      'downcase',
      'truncatewords',
      'json',
      'json_escape',
    ];

    // Combinar filtros personalizados y estándar
    const availableFilters = [...new Set([...customFilters, ...standardLiquidFilters])];

    // Tags personalizados de Fasttify (hardcodeados por ahora, se puede mejorar)
    const customTags = [
      'section',
      'sections',
      'render',
      'include',
      'schema',
      'style',
      'javascript',
      'script',
      'stylesheet',
      'paginate',
      'form',
      'filters',
    ];

    // Tags estándar de Liquid que también están disponibles
    const standardTags = [
      'if',
      'unless',
      'else',
      'elsif',
      'endif',
      'endunless',
      'for',
      'endfor',
      'case',
      'when',
      'endcase',
      'assign',
      'capture',
      'endcapture',
      'comment',
      'endcomment',
      'raw',
      'endraw',
      'cycle',
      'tablerow',
      'endtablerow',
      'break',
      'continue',
      'increment',
      'decrement',
    ];

    const availableTags = [...standardTags, ...customTags];

    return {
      availableFilters,
      availableTags,
      customTags,
    };
  }

  /**
   * Verifica si un filtro está disponible en Fasttify
   */
  isFilterAvailable(filterName: string): boolean {
    const info = this.getFasttifyLiquidInfo();
    return info.availableFilters.includes(filterName);
  }

  /**
   * Verifica si un tag está disponible en Fasttify
   */
  isTagAvailable(tagName: string): boolean {
    const info = this.getFasttifyLiquidInfo();
    return info.availableTags.includes(tagName);
  }

  /**
   * Obtiene el nombre del filtro en Fasttify (puede ser el mismo o diferente)
   * Útil para verificar mapeos
   */
  getFilterInfo(filterName: string): { available: boolean; name: string } {
    const info = this.getFasttifyLiquidInfo();
    const available = info.availableFilters.includes(filterName);

    return {
      available,
      name: available ? filterName : filterName, // Por ahora retorna el mismo nombre
    };
  }
}
