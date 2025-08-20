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

import { liquidEngine } from '@/renderer-engine/liquid/engine';
import type { RenderingData } from '@/renderer-engine/renderers/dynamic-page-renderer';

/**
 * Paso 2: Inicializar motor de rendering
 */
export async function initializeEngineStep(data: RenderingData): Promise<RenderingData> {
  liquidEngine.assetCollector.clear();
  return data;
}
