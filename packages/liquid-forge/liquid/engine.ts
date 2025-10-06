/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { allFilters } from '@/liquid-forge/liquid/filters';
import {
  FiltersTag,
  FormTag,
  IncludeTag,
  JavaScriptTag,
  PaginateTag,
  RenderTag,
  SchemaTag,
  ScriptTag,
  SectionTag,
  StyleTag,
  StylesheetTag,
} from '@/liquid-forge/liquid/tags';
import { AssetCollector } from '@/liquid-forge/services/rendering/asset-collector';
import type { LiquidContext, LiquidEngineConfig, TemplateError } from '@/liquid-forge/types';
import { Liquid, Template } from 'liquidjs';

class LiquidEngine {
  private static instance: LiquidEngine;
  private liquid: Liquid;
  public assetCollector: AssetCollector;
  private currentStoreId: string | null = null;

  private constructor() {
    this.assetCollector = new AssetCollector();
    this.liquid = this.createEngine();
    this.registerFilters();
    this.registerCustomTags();
  }

  public static getInstance(): LiquidEngine {
    if (!LiquidEngine.instance) {
      LiquidEngine.instance = new LiquidEngine();
    }
    return LiquidEngine.instance;
  }

  /**
   * Crea instancia optimizada de LiquidJS
   */
  private createEngine(): Liquid {
    const config: LiquidEngineConfig = {
      cache: true,
      greedy: false,
      trimTagLeft: false,
      trimTagRight: false,
      trimOutputLeft: false,
      trimOutputRight: false,
      strictFilters: false,
      strictVariables: false,
      // Preservar formato en production
      ...(process.env.NODE_ENV === 'production' && {
        trimTagLeft: true,
        trimTagRight: false,
        trimOutputLeft: true,
        trimOutputRight: true,
      }),
      globals: {
        settings: {
          currency: 'COP',
          currency_symbol: '$',
          money_format: '${{amount}}',
          timezone: 'America/Bogota',
        },
        _assetCollector: this.assetCollector,
      },
      context: {
        _assetCollector: this.assetCollector,
      },
    };

    return new Liquid(config);
  }

  /**
   * Parsea un template string a una estructura compilada (AST).
   * @param templateContent - El contenido del template como string.
   * @returns La plantilla compilada (un array de nodos AST).
   */
  public parse(templateContent: string): Template[] {
    return this.liquid.parse(templateContent);
  }

  /**
   * Registra filtros personalizados
   */
  private registerFilters(): void {
    allFilters.forEach(({ name, filter }) => {
      this.liquid.registerFilter(name, filter);
    });
  }

  /**
   * Registra tags personalizados para Shopify compatibility
   */
  private registerCustomTags(): void {
    this.liquid.registerTag('schema', SchemaTag);
    this.liquid.registerTag('section', SectionTag);
    this.liquid.registerTag('paginate', PaginateTag);
    this.liquid.registerTag('render', RenderTag);
    this.liquid.registerTag('include', IncludeTag);
    this.liquid.registerTag('style', StyleTag);
    this.liquid.registerTag('stylesheet', StylesheetTag);
    this.liquid.registerTag('script', ScriptTag);
    this.liquid.registerTag('javascript', JavaScriptTag);
    this.liquid.registerTag('form', FormTag);
    this.liquid.registerTag('filters', FiltersTag);
  }

  /**
   * Renderiza un template ya compilado con un contexto.
   * Este es el método optimizado que se saltará el parseo.
   * @param compiledTemplate - La plantilla pre-compilada desde el método parse().
   * @param context - El contexto de datos para el renderizado.
   * @returns El HTML renderizado como string.
   */
  public async renderCompiled(compiledTemplate: Template[], context: LiquidContext): Promise<string> {
    try {
      return await this.liquid.render(compiledTemplate, context);
    } catch (error) {
      const templateError: TemplateError = {
        type: 'RENDER_ERROR',
        message: `Compiled template rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error,
        statusCode: 500,
      };
      throw templateError;
    }
  }

  /**
   * Renderiza template con contexto (método principal optimizado)
   */
  public async render(templateContent: string, context: LiquidContext, templatePath?: string): Promise<string> {
    try {
      // Renderizar directamente (LiquidJS optimiza internamente)
      return await this.liquid.parseAndRender(templateContent, context);
    } catch (error) {
      const templateError: TemplateError = {
        type: 'RENDER_ERROR',
        message: `Error rendering template ${templatePath || ''}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        details: error,
        statusCode: 500,
      };
      throw templateError;
    }
  }

  /**
   * Limpia asset collector y resetea store filters
   */
  public clearAssets(): void {
    this.assetCollector.clear();
    this.currentStoreId = null;
  }

  /**
   * Registra filtro personalizado adicional
   */
  public registerCustomFilter(name: string, filterFunction: (...args: any[]) => any): void {
    this.liquid.registerFilter(name, filterFunction);
  }

  /**
   * Obtiene instancia de Liquid para uso avanzado
   */
  public getLiquidInstance(): Liquid {
    return this.liquid;
  }
}

// Export singleton instance
export const liquidEngine = LiquidEngine.getInstance();

// Export class for testing
export { LiquidEngine };
