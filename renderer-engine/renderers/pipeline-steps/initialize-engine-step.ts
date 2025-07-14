import { liquidEngine } from '@/renderer-engine/liquid/engine';
import type { RenderingData } from '@/renderer-engine/renderers/dynamic-page-renderer';

/**
 * Paso 2: Inicializar motor de rendering
 */
export async function initializeEngineStep(data: RenderingData): Promise<RenderingData> {
  liquidEngine.assetCollector.clear();
  return data;
}
