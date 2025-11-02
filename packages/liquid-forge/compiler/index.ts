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
import type { AssetCollector } from '../services/rendering/asset-collector';
import { LiquidCompiler } from './liquid-compiler';

export { LiquidCompiler } from './liquid-compiler';
export { LiquidInstanceFactory } from './liquid-instance-factory';
export { SharedLiquidInstance } from './shared-instance';

/**
 * Función de conveniencia para compilar templates
 *
 * @param templateContent - El contenido del template como string.
 * @param assetCollector - Opcional: AssetCollector para manejo de assets.
 * @returns La plantilla compilada (un array de nodos AST).
 */
export function compileTemplate(templateContent: string, assetCollector?: AssetCollector): Template[] {
  return LiquidCompiler.compile(templateContent, assetCollector);
}
