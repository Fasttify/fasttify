import { StoreRendererFactory } from '@/renderer-engine/factories/store-renderer-factory';

/**
 * Instancia singleton del renderizador de tiendas
 * Para uso en toda la aplicación
 */
export const storeRenderer = new StoreRendererFactory();
