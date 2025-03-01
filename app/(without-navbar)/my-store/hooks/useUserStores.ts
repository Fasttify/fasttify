import { useState, useEffect } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'

const client = generateClient<Schema>()

/**
 * Hook personalizado para obtener las tiendas de un usuario.
 * Gestiona el estado de carga y errores durante la consulta.
 */
export const useUserStores = (userId: string | null) => {
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  /**
   * Efecto que se ejecuta cuando cambia el userId
   * Realiza la consulta a la base de datos para obtener las tiendas del usuario
   */
  useEffect(() => {
    const fetchStores = async () => {
      if (!userId) {
        setStores([])
        setLoading(false)
        return
      }

      try {
        const { data: userStores } = await client.models.UserStore.list({
          authMode: 'userPool',
          filter: {
            userId: { eq: userId },
            onboardingCompleted: { eq: true },
          },
          selectionSet: ['storeId', 'storeName', 'storeType'],
        })
        setStores(userStores)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStores()
  }, [userId])

  return { stores, loading, error }
}
