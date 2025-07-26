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

  /**
   * Invalida caché de carrito
   */
  const invalidateCartCache = useCallback(async (storeId: string, sessionId: string) => {
    try {
      await fetch(`/api/stores/${storeId}/cache/invalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          changeType: 'cart_updated',
          entityId: sessionId,
        }),
      });
    } catch (error) {
      console.error('Error invalidating cart cache:', error);
    }
  }, []);

  return {
    invalidateProductCache,
    invalidateCollectionCache,
    invalidatePageCache,
    invalidateNavigationCache,
    invalidateTemplateCache,
    invalidateAllStoreCache,
    invalidateCartCache,
  };
}
