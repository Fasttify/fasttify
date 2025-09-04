import { useCallback } from 'react';

/**
 * Hook para invalidar caché desde el frontend
 * Permite invalidar caché específica cuando el usuario hace cambios
 */
export function useCacheInvalidation() {
  /**
   * Invalida caché de productos
   */
  const invalidateProductCache = useCallback(async (storeId: string, productId?: string) => {
    try {
      const changeType = productId ? 'product_updated' : 'product_created';
      await fetch(`/api/stores/${storeId}/cache/invalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          changeType,
          entityId: productId,
        }),
      });
    } catch (error) {
      console.error('Error invalidating product cache:', error);
    }
  }, []);

  /**
   * Invalida caché de múltiples productos por lotes
   */
  const invalidateMultipleProductsCache = useCallback(async (storeId: string, productIds: string[]) => {
    try {
      // Procesar en lotes de 25 para evitar límites de payload
      const batchSize = 25;
      const batches = [];

      for (let i = 0; i < productIds.length; i += batchSize) {
        const batch = productIds.slice(i, i + batchSize);
        batches.push(batch);
      }

      // Ejecutar todas las invalidaciones en paralelo
      await Promise.all(
        batches.map((batch) =>
          fetch(`/api/stores/${storeId}/cache/invalidate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              changeType: 'product_deleted',
              entityIds: batch,
            }),
          })
        )
      );
    } catch (error) {
      console.error('Error invalidating multiple products cache:', error);
    }
  }, []);

  /**
   * Invalida caché de colecciones
   */
  const invalidateCollectionCache = useCallback(async (storeId: string, collectionId?: string) => {
    try {
      const changeType = collectionId ? 'collection_updated' : 'collection_created';
      await fetch(`/api/stores/${storeId}/cache/invalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          changeType,
          entityId: collectionId,
        }),
      });
    } catch (error) {
      console.error('Error invalidating collection cache:', error);
    }
  }, []);

  /**
   * Invalida caché de páginas
   */
  const invalidatePageCache = useCallback(async (storeId: string, pageId?: string) => {
    try {
      const changeType = pageId ? 'page_updated' : 'page_created';
      await fetch(`/api/stores/${storeId}/cache/invalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          changeType,
          entityId: pageId,
        }),
      });
    } catch (error) {
      console.error('Error invalidating page cache:', error);
    }
  }, []);

  /**
   * Invalida caché de navegación
   */
  const invalidateNavigationCache = useCallback(async (storeId: string) => {
    try {
      await fetch(`/api/stores/${storeId}/cache/invalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          changeType: 'navigation_updated',
        }),
      });
    } catch (error) {
      console.error('Error invalidating navigation cache:', error);
    }
  }, []);

  /**
   * Invalida caché de templates
   */
  const invalidateTemplateCache = useCallback(async (storeId: string) => {
    try {
      await fetch(`/api/stores/${storeId}/cache/invalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          changeType: 'template_updated',
        }),
      });
    } catch (error) {
      console.error('Error invalidating template cache:', error);
    }
  }, []);

  /**
   * Invalida toda la caché de la tienda
   */
  const invalidateAllStoreCache = useCallback(async (storeId: string) => {
    try {
      await fetch(`/api/stores/${storeId}/cache/invalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          changeType: 'store_settings_updated',
        }),
      });
    } catch (error) {
      console.error('Error invalidating all store cache:', error);
    }
  }, []);

  return {
    invalidateProductCache,
    invalidateMultipleProductsCache,
    invalidateCollectionCache,
    invalidatePageCache,
    invalidateNavigationCache,
    invalidateTemplateCache,
    invalidateAllStoreCache,
  };
}
