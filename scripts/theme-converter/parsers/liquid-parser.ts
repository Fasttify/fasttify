/**
 * Parser de Liquid usando liquidjs para análisis AST
 */

import { Liquid, Template } from 'liquidjs';
import { logger } from '../utils/logger';

export interface LiquidNode {
  type: string;
  token: unknown;
  children?: LiquidNode[];
  raw?: string;
  value?: unknown;
}

export interface ParsedLiquid {
  ast: Template[];
  originalContent: string;
  nodes: LiquidNode[];
}

export class LiquidParser {
  private liquid: Liquid;

  constructor() {
    this.liquid = new Liquid({
      strictFilters: false,
      strictVariables: false,
      ownPropertyOnly: false,
    });
  }

  /**
   * Parsea contenido Liquid a AST
   */
  parse(content: string, filePath?: string): ParsedLiquid {
    try {
      const ast = this.liquid.parse(content);

      return {
        ast,
        originalContent: content,
        nodes: this.extractNodes(ast),
      };
    } catch (error) {
      logger.warn(`Error parseando Liquid en ${filePath || 'unknown'}:`, error);
      // Retornar estructura básica incluso si hay errores
      return {
        ast: [],
        originalContent: content,
        nodes: [],
      };
    }
  }

  /**
   * Extrae nodos del AST para análisis
   */
  private extractNodes(ast: Template[]): LiquidNode[] {
    const nodes: LiquidNode[] = [];

    for (const template of ast) {
      nodes.push(this.processTemplate(template));
    }

    return nodes;
  }

  /**
   * Procesa un template y extrae sus nodos
   */
  private processTemplate(template: Template): LiquidNode {
    const node: LiquidNode = {
      type: 'template',
      token: template,
      raw: this.extractRawContent(template),
    };

    // Intentar extraer información adicional del token
    if (template && typeof template === 'object') {
      // liquidjs puede tener diferentes estructuras según la versión
      // Esta es una implementación básica que puede necesitar ajustes
      try {
        // Acceder a propiedades comunes del token
        if ('token' in template) {
          node.token = (template as { token: unknown }).token;
        }
      } catch {
        // Ignorar errores de acceso
      }
    }

    return node;
  }

  /**
   * Extrae el contenido raw del template (aproximación)
   */
  private extractRawContent(template: Template): string {
    try {
      if (template && typeof template === 'object') {
        // Intentar obtener contenido raw si está disponible
        if ('raw' in template && typeof (template as { raw: unknown }).raw === 'string') {
          return (template as { raw: string }).raw;
        }
      }
    } catch {
      // Ignorar errores
    }
    return '';
  }

  /**
   * Busca patrones específicos en el contenido (fallback cuando AST no es suficiente)
   */
  findPatterns(content: string): {
    variables: Array<{ match: string; start: number; end: number }>;
    filters: Array<{ match: string; filter: string; start: number; end: number }>;
    tags: Array<{ match: string; tag: string; start: number; end: number }>;
  } {
    const variables: Array<{ match: string; start: number; end: number }> = [];
    const filters: Array<{ match: string; filter: string; start: number; end: number }> = [];
    const tags: Array<{ match: string; tag: string; start: number; end: number }> = [];

    // Buscar variables {{ ... }}
    const variableRegex = /\{\{[^}]+\}\}/g;
    let match;
    while ((match = variableRegex.exec(content)) !== null) {
      variables.push({
        match: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    // Buscar filtros | filter_name
    const filterRegex = /\|\s*([a-z_]+)/gi;
    while ((match = filterRegex.exec(content)) !== null) {
      filters.push({
        match: match[0],
        filter: match[1],
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    // Buscar tags {% tag_name ... %}
    const tagRegex = /\{%\s*([a-z_]+)[^%]*%\}/gi;
    while ((match = tagRegex.exec(content)) !== null) {
      tags.push({
        match: match[0],
        tag: match[1],
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    return { variables, filters, tags };
  }

  /**
   * Valida sintaxis Liquid
   */
  validateSyntax(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      this.liquid.parse(content);
      return { valid: true, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(errorMessage);
      return { valid: false, errors };
    }
  }
}
