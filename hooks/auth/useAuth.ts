import { useEffect } from 'react'
import { fetchAuthSession } from 'aws-amplify/auth'
import useAuthStore from '@/zustand-states/userStore'

/**
 * Hook personalizado para manejar la autenticación del usuario.
 * Gestiona el estado de autenticación y los atributos del usuario utilizando Amplify Auth.
 *
 * @returns {Object} Un objeto vacío ya que el estado se maneja a través del store
 *
 * @example
 * ```tsx
 * useAuth() // Inicializa la autenticación
 * const { user, loading } = useAuthStore() // Obtiene el estado desde el store
 *
 * if (loading) {
 *   return <LoadingSpinner />
 * }
 * ```
 */
export const useAuth = () => {
  const { user, setUser, clearUser, setLoading } = useAuthStore()

  useEffect(() => {
    /**
     * Verifica y obtiene la información del usuario actual.
     * Si existe un usuario, obtiene sus atributos y actualiza el estado.
     * Si no existe o hay un error, limpia el estado del usuario.
     */
    const checkUser = async () => {
      try {
        setLoading(true)
        // Obtener la sesión actual del usuario
        const session = await fetchAuthSession({ forceRefresh: true })

        // Verificar si hay una sesión válida con tokens
        if (session && session.tokens) {
          // Obtener los atributos del usuario desde el token ID
          const userAttributes = session.tokens.idToken?.payload || {}

          const newUser = {
            nickName:
              typeof userAttributes.nickname === 'string' ? userAttributes.nickname : undefined,
            email: typeof userAttributes.email === 'string' ? userAttributes.email : '',
            picture:
              typeof userAttributes.picture === 'string' ? userAttributes.picture : undefined,
            preferredUsername:
              typeof userAttributes.preferred_username === 'string'
                ? userAttributes.preferred_username
                : '',
            plan:
              typeof userAttributes['custom:plan'] === 'string'
                ? userAttributes['custom:plan']
                : undefined,
            bio:
              typeof userAttributes['custom:bio'] === 'string'
                ? userAttributes['custom:bio']
                : undefined,
            phone:
              typeof userAttributes['custom:phone'] === 'string'
                ? userAttributes['custom:phone']
                : undefined,

            identities: Array.isArray(userAttributes.identities)
              ? userAttributes.identities
              : undefined,

            cognitoUsername:
              typeof userAttributes.sub === 'string' ? userAttributes.sub : undefined,

            userId:
              typeof userAttributes['cognito:username'] === 'string'
                ? userAttributes['cognito:username']
                : undefined,
          }
          setUser(newUser)
        } else {
          clearUser()
        }
      } catch (error) {
        console.error('Error getting user:', error)
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
  }, [setUser, clearUser, user, setLoading])

  return {}
}
