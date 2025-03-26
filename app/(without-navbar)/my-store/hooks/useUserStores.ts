import { useState, useEffect } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'

const client = generateClient<Schema>()

// Define store limits by plan
const STORE_LIMITS = {
  Imperial: 5,
  Majestic: 3,
  Royal: 1,
}

/**
 * Hook personalizado para obtener las tiendas de un usuario y verificar límites.
 * Gestiona el estado de carga y errores durante la consulta.
 */
export const useUserStores = (userId: string | null, userPlan?: string) => {
  const [stores, setStores] = useState<any[]>([])
  const [allStores, setAllStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const [canCreateStore, setCanCreateStore] = useState(false)

  /**
   * Efecto que se ejecuta cuando cambia el userId
   * Realiza la consulta a la base de datos para obtener las tiendas del usuario
   */
  useEffect(() => {
    const fetchStores = async () => {
      if (!userId) {
        console.log('useUserStores: No userId provided, returning empty stores array')
        setStores([])
        setAllStores([])
        setCanCreateStore(false)
        setLoading(false)
        return
      }

      try {
        console.log(`useUserStores: Fetching stores for userId: ${userId}`)

        // Obtener todas las tiendas del usuario (para verificar límites)
        const { data: allUserStores } = await client.models.UserStore.list({
          authMode: 'userPool',
          filter: {
            userId: { eq: userId },
          },
          selectionSet: ['storeId', 'storeName', 'storeType', 'onboardingCompleted'],
        })

        console.log(`useUserStores: Found ${allUserStores?.length || 0} total stores for user`)
        console.log('useUserStores: All stores data:', JSON.stringify(allUserStores))

        // Guardar todas las tiendas
        setAllStores(allUserStores || [])

        // Filtrar solo las tiendas con onboarding completado para mostrar
        const completedStores =
          allUserStores?.filter(store => store.onboardingCompleted === true) || []
        setStores(completedStores)

        console.log(`useUserStores: Found ${completedStores.length} completed stores for user`)

        // Verificar límite de tiendas según el plan
        const currentCount = allUserStores?.length || 0
        const limit = userPlan ? STORE_LIMITS[userPlan as keyof typeof STORE_LIMITS] || 0 : 0
        setCanCreateStore(currentCount < limit)

        console.log(
          `useUserStores: Store limit check - Current: ${currentCount}, Limit: ${limit}, Can create: ${currentCount < limit}`
        )
      } catch (err) {
        console.error('useUserStores: Error fetching stores:', err)
        setError(err)
        // En caso de error, establecer arrays vacíos
        setStores([])
        setAllStores([])
        setCanCreateStore(false)
      } finally {
        setLoading(false)
      }
    }

    fetchStores()
  }, [userId, userPlan])

  return {
    stores, // Tiendas con onboarding completado (para mostrar)
    allStores, // Todas las tiendas (para referencia)
    loading,
    error,
    canCreateStore, // Si el usuario puede crear más tiendas
    storeCount: allStores.length, // Número total de tiendas
  }
}
