import { useEffect, useState } from 'react'
import useStoreDataStore from '@/zustand-states/storeDataStore'

interface UseStoreReturn {
  store: any
  loading: boolean
  error: Error | null
}

/**
 * Hook para obtener y gestionar los datos de una tienda
 */
export function useStore(storeId: string | null): UseStoreReturn {
  const { currentStore, isLoading, error, fetchStoreData } = useStoreDataStore()
  const [isClient, setIsClient] = useState(false)

  // Efecto para manejar la hidratación del cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Efecto para cargar los datos de la tienda
  useEffect(() => {
    if (storeId && isClient) {
      fetchStoreData(storeId)
    }
  }, [storeId, isClient, fetchStoreData])

  return {
    store: currentStore,
    loading: !isClient || isLoading,
    error,
  }
}
