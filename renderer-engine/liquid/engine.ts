import { allFilters } from '@/renderer-engine/liquid/filters';
import { FormTag } from '@/renderer-engine/liquid/tags/form-tag';
import { JavaScriptTag } from '@/renderer-engine/liquid/tags/javascript-tag';
import { PaginateTag } from '@/renderer-engine/liquid/tags/paginate-tag';
import { IncludeTag, RenderTag } from '@/renderer-engine/liquid/tags/render-tag';
import { SchemaTag } from '@/renderer-engine/liquid/tags/schema-tag';
import { ScriptTag } from '@/renderer-engine/liquid/tags/script-tag';
import { SectionTag } from '@/renderer-engine/liquid/tags/section-tag';
import { StyleTag, StylesheetTag } from '@/renderer-engine/liquid/tags/style-tag';
import { AssetCollector } from '@/renderer-engine/services/rendering/asset-collector';
import type { LiquidContext, LiquidEngineConfig, TemplateError } from '@/renderer-engine/types';
import { Liquid } from 'liquidjs';

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
      cache: false, // Sin cache interno para control manual
      greedy: false,
      trimTagLeft: false,
      trimTagRight: false,
      trimOutputLeft: false,
      trimOutputRight: false,
      strictFilters: false,
      strictVariables: false,
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
   * Registra filtros personalizados
   */
  private registerFilters(): void {
    allFilters.forEach(({ name, filter }) => {
      this.liquid.registerFilter(name, filter);
    });
  }

  /**
   * Registra filtros específicos por store (optimizado)
   */
  private registerStoreFilters(storeId: string): void {
    if (this.currentStoreId === storeId) return;

    // Registrar asset_url con storeId específico
    this.liquid.registerFilter('asset_url', (filename: string) => {
      if (!filename) return '';
      const cleanFilename = filename.replace(/^\/+/, '');
      return `/api/stores/${storeId}/assets/${cleanFilename}`;
    });

    this.currentStoreId = storeId;
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
  }

  /**
   * Renderiza template con contexto (método principal optimizado)
   */
  public async render(templateContent: string, context: LiquidContext, templatePath?: string): Promise<string> {
    try {
      // Registrar filtros de store si es necesario
      const storeId = context?.storeId || context?.store?.storeId || context?.shop?.storeId;
      if (storeId) {
        this.registerStoreFilters(storeId);
      }

      // Renderizar directamente (LiquidJS optimiza internamente)
      return await this.liquid.parseAndRender(templateContent, context);
    } catch (error) {
      const templateError: TemplateError = {
        type: 'RENDER_ERROR',
        message: `Template rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
