import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import useStoreDataStore from '@/context/core/storeDataStore';
import useUserStore from '@/context/core/userStore';

interface UseStoreReturn {
  store: any;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook para obtener y gestionar los datos de una tienda
 * Optimizado para mejor rendimiento en navegación
 */
export function useStore(storeId: string): UseStoreReturn {
  const { currentStore, isLoading, error, fetchStoreData } = useStoreDataStore();
  const { user } = useUserStore();
  const [isClient, setIsClient] = useState(false);

  // Ref para evitar múltiples llamadas simultáneas
  const fetchInProgress = useRef(false);
  const lastFetchTime = useRef(0);

  // Debounce para evitar múltiples fetches en navegación rápida
  const DEBOUNCE_DELAY = 300; // 300ms de debounce

  // Efecto para manejar la hidratación del cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoizar la función de fetch con debouncing y control de concurrencia
  const memoizedFetchStoreData = useCallback(() => {
    const now = Date.now();

    // Evitar múltiples llamadas simultáneas
    if (fetchInProgress.current) {
      return;
    }

    // Debounce para navegación rápida
    if (now - lastFetchTime.current < DEBOUNCE_DELAY) {
      return;
    }

    if (storeId && user?.userId && isClient) {
      fetchInProgress.current = true;
      lastFetchTime.current = now;

      fetchStoreData(storeId, user.userId).finally(() => {
        fetchInProgress.current = false;
      });
    }
  }, [storeId, user?.userId, isClient, fetchStoreData]);

  // Efecto para cargar los datos de la tienda
  useEffect(() => {
    memoizedFetchStoreData();
  }, [memoizedFetchStoreData]);

  // Memoizar el resultado para evitar re-renders innecesarios
  const result = useMemo(
    () => ({
      store: currentStore,
      loading: !isClient || isLoading,
      error,
    }),
    [currentStore, isClient, isLoading, error]
  );

  return result;
}
