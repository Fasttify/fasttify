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

import { Liquid } from 'liquidjs';
import { allFilters } from '../liquid/filters';
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
  SectionsTag,
  StyleTag,
  StylesheetTag,
} from '../liquid/tags';
import type { LiquidEngineConfig } from '../types';
import { AssetCollector } from '../services/rendering/asset-collector';

/**
 * Factory para crear instancias de Liquid configuradas para compilación
 */
export class LiquidInstanceFactory {
  /**
   * Crea una instancia de Liquid configurada para compilación
   *
   * @param assetCollector - Opcional: AssetCollector para manejo de assets
   * @returns Instancia de Liquid configurada
   */
  public static create(assetCollector?: AssetCollector): Liquid {
    const config: LiquidEngineConfig = {
      cache: true,
      greedy: false,
      trimTagLeft: false,
      trimTagRight: false,
      trimOutputLeft: false,
      trimOutputRight: false,
      strictFilters: false,
      strictVariables: false,
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
        _assetCollector: assetCollector,
      },
      context: {
        _assetCollector: assetCollector,
      },
    };

    const liquid = new Liquid(config);

    this.registerFilters(liquid);
    this.registerCustomTags(liquid);

    return liquid;
  }

  /**
   * Registra filtros personalizados en la instancia de Liquid
   */
  private static registerFilters(liquid: Liquid): void {
    allFilters.forEach(({ name, filter }) => {
      liquid.registerFilter(name, filter);
    });
  }

  /**
   * Registra tags personalizados para Shopify compatibility
   */
  private static registerCustomTags(liquid: Liquid): void {
    liquid.registerTag('schema', SchemaTag);
    liquid.registerTag('section', SectionTag);
    liquid.registerTag('sections', SectionsTag);
    liquid.registerTag('paginate', PaginateTag);
    liquid.registerTag('render', RenderTag);
    liquid.registerTag('include', IncludeTag);
    liquid.registerTag('style', StyleTag);
    liquid.registerTag('stylesheet', StylesheetTag);
    liquid.registerTag('script', ScriptTag);
    liquid.registerTag('javascript', JavaScriptTag);
    liquid.registerTag('form', FormTag);
    liquid.registerTag('filters', FiltersTag);
  }
}
