import { useMemo } from 'react';
import useStoreDataStore from '@/context/core/storeDataStore';

/**
 * Hook optimizado que reutiliza los datos del store de Zustand
 * sin hacer nuevas peticiones. Usar SOLO en componentes hijo
 * donde el layout principal ya ejecutó useStore().
 */
export function useStoreFromZustand() {
  const currentStore = useStoreDataStore((state) => state.currentStore);
  const isLoading = useStoreDataStore((state) => state.isLoading);
  const error = useStoreDataStore((state) => state.error);
  const storeId = useStoreDataStore((state) => state.storeId);
  const hasMasterShopApiKey = useStoreDataStore((state) => state.hasMasterShopApiKey);

  // Memoizar el objeto de respuesta para evitar re-renders innecesarios
  return useMemo(
    () => ({
      store: currentStore,
      loading: isLoading,
      error,
      storeId,
      hasMasterShopApiKey,
    }),
    [currentStore, isLoading, error, storeId, hasMasterShopApiKey]
  );
}

/**
 * Hook para componentes que solo necesitan el store actual
 */
export function useCurrentStore() {
  return useStoreDataStore((state) => state.currentStore);
}

/**
 * Hook para componentes que solo necesitan el storeId
 * sin cargar datos adicionales
 */
export function useStoreId() {
  return useStoreDataStore((state) => state.storeId);
}

/**
 * Hook para componentes que solo necesitan verificar
 * si la tienda tiene API key configurada
 */
export function useStoreApiKeyStatus() {
  return useStoreDataStore((state) => state.hasMasterShopApiKey);
}
