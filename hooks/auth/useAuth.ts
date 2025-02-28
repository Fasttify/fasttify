import { useEffect, useState } from 'react'
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth'
import useAuthStore from '@/zustand-states/userStore'

/**
 * Hook personalizado para manejar la autenticación del usuario.
 * Gestiona el estado de autenticación y los atributos del usuario utilizando Amplify Auth.
 * 
 * @returns {Object} Un objeto con las siguientes propiedades:
 * - loading: Estado que indica si se está verificando la autenticación
 * 
 * @example
 * ```tsx
 * const { loading } = useAuth()
 * 
 * if (loading) {
 *   return <LoadingSpinner />
 * }
 * ```
 */
export const useAuth = () => {
  const { user, setUser, clearUser } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    /**
     * Verifica y obtiene la información del usuario actual.
     * Si existe un usuario, obtiene sus atributos y actualiza el estado.
     * Si no existe o hay un error, limpia el estado del usuario.
     */
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          const userAttributes = await fetchUserAttributes()
          const newUser = {
            nickName: userAttributes?.nickname || undefined,
            email: userAttributes?.email || '',
            picture: userAttributes?.picture || undefined,
            preferredUsername: userAttributes?.preferred_username || '',
            plan: userAttributes?.['custom:plan'] || undefined,
            bio: userAttributes?.['custom:bio'] || undefined,
            phone: userAttributes?.['custom:phone'] || undefined,
          }
          setUser(newUser)
        } else {
          clearUser()
        }
      } catch (error) {
        console.error('Error al obtener el usuario:', error)
        clearUser()
      } finally {
        setLoading(false)
      }
    }

    if (!user) {
      checkUser()
    } else {
      setLoading(false)
    }
  }, [setUser, clearUser, user])

  return { loading }
}
