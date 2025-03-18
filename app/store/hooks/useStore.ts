import { useEffect, useState } from 'react'
import type { Schema } from '@/amplify/data/resource'
import useStoreDataStore from '@/zustand-states/storeDataStore'

type StoreType = Schema['UserStore']['type']

interface UseStoreReturn {
  store: StoreType | null
  loading: boolean
  error: Error | null
}

/**
 * Hook personalizado para obtener y gestionar los datos de una tienda específica.
 * Proporciona estados de carga, error y los datos de la tienda.
 * Utiliza Zustand para compartir los datos entre componentes.
 *
 * @param {string | null} storeId - El ID de la tienda a consultar
 * @returns {UseStoreReturn} Un objeto con los estados y datos de la tienda
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
