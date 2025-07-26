import type { RenderingData } from '@/renderer-engine/renderers/dynamic-page-renderer';
import { domainResolver } from '@/renderer-engine/services/core/domain-resolver';

/**
 * Paso 1: Resolver dominio a tienda
 */
export async function resolveStoreStep(data: RenderingData): Promise<RenderingData> {
  const store = await domainResolver.resolveStoreByDomain(data.domain);
  return { ...data, store };
}
