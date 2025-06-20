import { useEffect, useState, useCallback } from 'react'
import useStoreDataStore from '@/context/core/storeDataStore'
import useUserStore from '@/context/core/userStore'

interface UseStoreReturn {
  store: any
  loading: boolean
  error: Error | null
}

/**
 * Hook para obtener y gestionar los datos de una tienda
 */
export function useStore(storeId: string): UseStoreReturn {
  const { currentStore, isLoading, error, fetchStoreData } = useStoreDataStore()
  const { user } = useUserStore()
  const [isClient, setIsClient] = useState(false)

  // Efecto para manejar la hidratación del cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Memoizar la función de fetch para evitar re-renders infinitos
  const memoizedFetchStoreData = useCallback(() => {
    if (storeId && user?.userId && isClient) {
      fetchStoreData(storeId, user.userId)
    }
  }, [storeId, user?.userId, isClient])

  // Efecto para cargar los datos de la tienda
  useEffect(() => {
    memoizedFetchStoreData()
  }, [memoizedFetchStoreData])

  return {
    store: currentStore,
    loading: !isClient || isLoading,
    error,
  }
}
