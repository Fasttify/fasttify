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

import type { Template } from 'liquidjs';
import { Liquid } from 'liquidjs';
import { AssetCollector } from '../services/rendering/asset-collector';
import { LiquidInstanceFactory } from './liquid-instance-factory';
import { SharedLiquidInstance } from './shared-instance';

/**
 * Compilador de templates Liquid
 *
 * Este módulo proporciona funcionalidad para compilar templates Liquid
 * a estructuras compiladas (AST) que pueden ser renderizadas posteriormente.
 */
export class LiquidCompiler {
  /**
   * Compila un template string a una estructura compilada (AST).
   *
   * @param templateContent - El contenido del template como string.
   * @param assetCollector - Opcional: AssetCollector para manejo de assets.
   * @returns La plantilla compilada (un array de nodos AST).
   */
  public static compile(templateContent: string, assetCollector?: AssetCollector): Template[] {
    const liquid = assetCollector ? LiquidInstanceFactory.create(assetCollector) : SharedLiquidInstance.getInstance();

    return liquid.parse(templateContent);
  }

  /**
   * Crea una instancia de compilador con una instancia específica de Liquid.
   * Útil cuando necesitas usar una instancia personalizada de Liquid.
   *
   * @param liquidInstance - Instancia de Liquid configurada.
   * @returns Función de compilación que usa la instancia proporcionada.
   */
  public static createCompiler(liquidInstance: Liquid): (templateContent: string) => Template[] {
    return (templateContent: string) => liquidInstance.parse(templateContent);
  }
}
