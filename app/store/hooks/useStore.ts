import { useState, useEffect } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'

const client = generateClient<Schema>()

type StoreType = Schema['UserStore']['type']

interface UseStoreReturn {
  store: StoreType | null
  loading: boolean
  error: Error | null
}

/**
 * Hook personalizado para obtener y gestionar los datos de una tienda específica.
 * Proporciona estados de carga, error y los datos de la tienda.
 *
 * @param {string | null} storeId - El ID de la tienda a consultar
 * @returns {UseStoreReturn} Un objeto con los estados y datos de la tienda
 */
export function useStore(storeId: string | null): UseStoreReturn {
  const [store, setStore] = useState<StoreType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchStore = async () => {
      if (!storeId) {
        setLoading(false)
        return
      }

      try {
        const { data: stores } = await client.models.UserStore.list({
          authMode: 'userPool',
          filter: { storeId: { eq: storeId } },
        })

        if (stores && stores.length > 0) {
          setStore(stores[0] as StoreType)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error al obtener la tienda'))
      } finally {
        setLoading(false)
      }
    }

    fetchStore()
  }, [storeId])

  return { store, loading, error }
}
